import { Injectable } from '@angular/core';
import L from 'leaflet';
import { BehaviorSubject, filter, Observable, ReplaySubject, Subscription } from 'rxjs';
import { ICON_TYPE, Player, ItemPosition, PlayerPositionsUpdate, Riddle, TeamRiddle } from '../reference/types';
import { NotificationsService } from './notifications.service';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  map: L.Map | undefined;

  private updateNotifier$ = new ReplaySubject<PlayerPositionsUpdate>();

  private icons: { [type in ICON_TYPE]: { [id: string]: L.Icon } } = {
    0: {},
    1: {},
  };

  private markers: { [type in ICON_TYPE]: Map<string, L.Marker<any>> } = {
    0: new Map(),
    1: new Map(),
  };
  private polylines: Map<string, L.Polyline<any>> = new Map();

  private positionsSubject = new BehaviorSubject<PlayerPositionsUpdate | null>(null);
  positions$: Observable<PlayerPositionsUpdate | null> = this.positionsSubject.asObservable();
  positionsSubscription: Subscription | undefined;

  constructor(private notificationsService: NotificationsService) {
    this.notificationsService.listen('positionUpdated').subscribe((update: PlayerPositionsUpdate) => {
      this.updateNotifier$.next(update);
    });
  }

  setMap(map: L.Map) {
    this.map = map;
  }

  simulatePositionUpdate(username: string) {
    if (username) {
      const latitude = 43.6045 + Math.random() * 0.1; // Simulez des coordonnées
      const longitude = 1.4442 + Math.random() * 0.1;

      this.notificationsService.updatePosition(username, latitude, longitude);
    }
  }

  centerUser(player: Player) {
    console.log(`centerUser(${player?.latitude}, ${player?.longitude})`);
    if (this.map && player && player.latitude != 0 && player.longitude != 0) {
      this.map.setView([player.latitude, player.longitude]);
    }
  }

  // Écouter les notifications de mise à jour pour cet utilisateur
  listenForPositionUpdates(teamId: string): void {
    console.log(`listenForPositionUpdates(${teamId})`);
    if (this.positionsSubscription) {
      this.positionsSubscription.unsubscribe();
    }
    this.positionsSubscription = this.updateNotifier$
      .pipe(
        filter((payload) => {
          // console.log(payload);
          return teamId === 'all' || payload.team === teamId;
        })
      ) // Filtrer les notifications pour cet team
      .subscribe((payload) => {
        console.log('Mise à jour détectée via WebSocket. Déplacement des users...');
        this.positionsSubject.next(payload);
      });
  }

  updateMarkerRiddles(riddles: Riddle[], removeOld = true, color = 'grey') {
    const positions: ItemPosition[] = riddles.map((riddle) => {
      return {
        itemId: riddle.text ? riddle?.text : '',
        latitude: riddle.latitude ? riddle?.latitude : 0,
        longitude: riddle.longitude ? riddle?.longitude : 0,
      };
    });
    this.updateMakers(ICON_TYPE.Riddle, positions, removeOld, color);
  }

  updateMarkerTeamRiddles(teamRiddles: TeamRiddle[], removeOld = true, color = 'grey') {
    const positions: ItemPosition[] = teamRiddles.map((tr) => {
      return {
        itemId: tr.riddle?.text ? tr.riddle?.text : '',
        latitude: tr.riddle?.latitude ? tr.riddle?.latitude : 0,
        longitude: tr.riddle?.longitude ? tr.riddle?.longitude : 0,
      };
    });
    this.updateMakers(ICON_TYPE.Riddle, positions, removeOld, color);

    if (this.polylines.has(color)) {
      this.polylines.get(color)?.setLatLngs(this.connectTeamRiddle(teamRiddles));
    } else {
      const pathLine = L.polyline(this.connectTeamRiddle(teamRiddles));
      pathLine.setStyle({ color: color });
      this.map?.addLayer(pathLine);

      this.polylines.set(color, pathLine);
    }
  }

  updateMarkerPlayers(positions: ItemPosition[], removeOld = true, color = 'grey') {
    this.updateMakers(ICON_TYPE.Player, positions, removeOld, color);
  }

  private updateMakers(type: ICON_TYPE, positions: ItemPosition[], removeOld = true, color = 'grey') {
    // console.log(`updateMakers(${type}, ${positions.length})`);
    positions.forEach((p) => {
      // console.log(`${type} ${p.latitude}, ${p.longitude} ${color}: ${p.itemId}`);
      if (this.markers[type].has(p.itemId)) {
        const marker = this.markers[type].get(p.itemId);
        marker?.setLatLng([p.latitude, p.longitude]);
        marker?.setIcon(this.getIcon(type, color));
      } else {
        const newMarker = L.marker([p.latitude, p.longitude], { icon: this.getIcon(type, color) });
        this.map?.addLayer(newMarker);
        newMarker.bindPopup(`${p.itemId}`);

        this.markers[type].set(p.itemId, newMarker);
      }
    });
    // Supprimer ou mettre à jour les marqueurs sur la carte
    if (removeOld) {
      this.markers[type].forEach((marker, playerId) => {
        if (!positions.find((d) => d.itemId === playerId)) {
          this.map?.removeLayer(marker);
        }
      });
    }
    // console.log(savedMarkers);
  }

  private getIcon(type: ICON_TYPE, color: string): L.Icon {
    if (this.icons[type][color]) {
      return this.icons[type][color];
    }

    let icon;
    if (type === ICON_TYPE.Player) {
      icon = new L.Icon({
        iconUrl: `/assets/leaflet/marker-icon-2x-${color}.png`,
        shadowUrl: `/assets/leaflet/marker-shadow.png`,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });
    } else {
      icon = new L.Icon({
        iconUrl: `/assets/leaflet/target-${color}.svg`,
        iconSize: [25, 25],
        iconAnchor: [12, 12],
      });
    }
    this.icons[type][color] = icon;
    // console.log(`${type} ${color} -> ${icon}`);
    return icon;
  }

  private connectTeamRiddle(teamRiddles: TeamRiddle[]): L.LatLngExpression[] {
    const c = [];
    for (let i in teamRiddles) {
      if (teamRiddles[i].riddle) {
        const x = teamRiddles[i].riddle.latitude;
        const y = teamRiddles[i].riddle.longitude;
        c.push([x, y] as L.LatLngTuple);
      }
    }
    return c;
  }
}
