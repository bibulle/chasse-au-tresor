import { Injectable } from '@angular/core';
import { NotificationsService } from './notifications.service';
import { Map } from 'leaflet';
import { Player } from '../reference/types';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  map: Map | undefined;

  constructor(private notificationsService: NotificationsService) {}

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
    console.log(`centerUser(${player?.latitude}, ${player?.longitude})`)
    if (this.map && player && player.latitude != 0 && player.longitude != 0) {
      this.map.setView([player.latitude, player.longitude]);
    }
  }
}
