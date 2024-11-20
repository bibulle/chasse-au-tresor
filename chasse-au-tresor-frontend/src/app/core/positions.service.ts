import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PositionService {
  constructor(private socket: Socket) {}

  // Écouter les mises à jour des positions
  onPositionUpdated(): Observable<any> {
    return this.socket.fromEvent('positionUpdated');
  }

  // Envoyer une mise à jour de position
  updatePosition(playerId: string, latitude: number, longitude: number): void {
    this.socket.emit('updatePosition', { playerId, latitude, longitude });
  }
}
