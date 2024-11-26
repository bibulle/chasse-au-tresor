import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Player, PlayerPosition } from '../reference/types';
import { NotificationsService } from '../core/notifications.service';
import L from 'leaflet';
import { MapService } from '../core/map.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
})
export class MapComponent implements OnInit, OnChanges {
  @Input() player: Player | null = null;
  @Input() allTeams: boolean = false;

  private map: L.Map | undefined;
  private markers: Map<string, L.Marker> = new Map();

  positionSubscription: Subscription | undefined;
  positionSubscriptionTeamId: string | undefined;

  icons: { [id: string]: L.Icon } = {};

  constructor(
    private notificationsService: NotificationsService,
    private mapService: MapService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['player'] && changes['player'].currentValue) {
      const newTeamId = (changes['player'].currentValue as Player).team?._id;
      if (newTeamId && this.positionSubscriptionTeamId !== newTeamId) {
        this.positionSubscriptionTeamId = newTeamId;
        this.listenForPositionUpdates(newTeamId);
      }
    }
    if (changes['allTeams'] && changes['allTeams'].currentValue) {
      const newTeamId = 'all';
      if (newTeamId && this.positionSubscriptionTeamId !== newTeamId) {
        this.positionSubscriptionTeamId = newTeamId;
        this.listenForPositionUpdates(newTeamId);
      }
    }
    // console.log(`ngOnChanges(${JSON.stringify(changes, null, 2)})`);
  }

  ngOnInit(): void {
    this.initMap();
  }

  initMap() {
    L.Icon.Default.imagePath = 'assets/leaflet/';

    this.map = L.map('map').setView([43.6045, 1.4442], 13); // Position Toulouse
    var Stadia_OSMBright = L.tileLayer(
      'https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png',
      {
        minZoom: 0,
        maxZoom: 20,
        attribution:
          '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        // ext: 'png',
      }
    );
    var Stadia_AlidadeSatellite = L.tileLayer(
      'https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.jpg',
      {
        minZoom: 0,
        maxZoom: 20,
        attribution:
          '&copy; CNES, Distribution Airbus DS, © Airbus DS, © PlanetObserver (Contains Copernicus Data) | &copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        // ext: 'jpg'
      }
    );
    var OpenStreetMap_France = L.tileLayer(
      'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
      {
        maxZoom: 20,
        attribution:
          '&copy; OpenStreetMap France | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }
    );

    this.mapService.setMap(this.map);

    //Stadia_OSMBright.addTo(this.map);
    //Stadia_AlidadeSatellite.addTo(this.map);
    OpenStreetMap_France.addTo(this.map);
  }

  listenForPositionUpdates(newTeamId: string) {
    this.mapService.listenForPositionUpdates(newTeamId);

    this.positionSubscription = this.mapService.positions$.subscribe((data) => {
      console.log('playerPositionUpdated');
      // console.log(data);
      // Ajouter ou mettre à jour les marqueurs sur la carte
      data?.positions.forEach((p) => {
        if (this.markers.has(p.playerId)) {
          const marker = this.markers.get(p.playerId);
          marker?.setLatLng([p.latitude, p.longitude]);
          marker?.setIcon(this.getIcon(data.color));
        } else {
          const newMarker = L.marker([p.latitude, p.longitude], {icon: this.getIcon(data.color)});
          this.map?.addLayer(newMarker);
          newMarker.bindPopup(`${p.playerId}`);

          this.markers.set(p.playerId, newMarker);
        }
      });
      // Supprimer ou mettre à jour les marqueurs sur la carte
      if (newTeamId != 'all') {
        this.markers.forEach((marker, playerId) => {
          if (!data?.positions.find((d) => d.playerId === playerId)) {
            this.map?.removeLayer(marker);
          }
        });
      }
    });
  }

  invalidateMapSize(): void {
    if (this.map) {
      this.map.invalidateSize();
    }
  }

  getIcon(color: string): L.Icon {
    if (this.icons[color]) {
      return this.icons[color];
    }

    const icon = new L.Icon({
      iconUrl: `/assets/leaflet/marker-icon-2x-${color}.png`,
      shadowUrl: `/assets/leaflet/marker-shadow.png`,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
    this.icons[color] = icon;
    return icon;
  }
}
