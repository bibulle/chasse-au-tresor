import { Injectable } from '@angular/core';
import { Map } from 'leaflet';
import {
  BehaviorSubject,
  filter,
  Observable,
  ReplaySubject,
  Subscription,
} from 'rxjs';
import {
  Player,
  PlayerPosition,
  PlayerPositionsUpdate,
} from '../reference/types';
import { NotificationsService } from './notifications.service';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  map: Map | undefined;

  private updateNotifier$ = new ReplaySubject<PlayerPositionsUpdate>();

  private positionsSubject = new BehaviorSubject<PlayerPositionsUpdate | null>(
    null
  );
  positions$: Observable<PlayerPositionsUpdate | null> =
    this.positionsSubject.asObservable();
  positionsSubscription: Subscription | undefined;

  constructor(private notificationsService: NotificationsService) {
    this.notificationsService
      .listen('positionUpdated')
      .subscribe((update: PlayerPositionsUpdate) => {
        this.updateNotifier$.next(update);
      });
  }

  setMap(map: Map) {
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
        console.log(
          'Mise à jour détectée via WebSocket. Déplacement des users...'
        );
        this.positionsSubject.next(payload);
      });
  }
}
