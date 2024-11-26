import { Component, Input, OnInit } from '@angular/core';
import { Player, PlayerPosition } from '../reference/types';
import { NotificationsService } from '../core/notifications.service';
import L from 'leaflet';
import { MapService } from '../core/map.service';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
})
export class MapComponent implements OnInit {
  @Input() player: Player | null = null;

  private map: L.Map | undefined;
  private markers: Map<string, L.Marker> = new Map();

  constructor(private notificationsService: NotificationsService, private mapService: MapService) {}

  ngOnInit(): void {
    this.initMap();
    this.listenForPositionUpdates();
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

  listenForPositionUpdates() {
    this.notificationsService
      .onPositionUpdated()
      .subscribe((data: PlayerPosition[]) => {
        console.log('playerPositionUpdated');
        // Ajouter ou mettre à jour les marqueurs sur la carte
        console.log(data);
        data.forEach((p) => {
          if (this.markers.has(p.playerId)) {
            const marker = this.markers.get(p.playerId);
            marker?.setLatLng([p.latitude, p.longitude]);
          } else {
            const newMarker = L.marker([p.latitude, p.longitude]);
            this.map?.addLayer(newMarker);
            newMarker.bindPopup(`${p.playerId}`);

            this.markers.set(p.playerId, newMarker);
          }
        });
        // Supprimer ou mettre à jour les marqueurs sur la carte
        this.markers.forEach((marker, playerId) => {
          if (!data.find((d) => d.playerId === playerId)) {
            this.map?.removeLayer(marker);
          }
        });
      });
  }
}
