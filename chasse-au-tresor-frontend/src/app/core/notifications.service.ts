import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable, ReplaySubject } from 'rxjs';
import { PlayerPosition, Position } from '../reference/types';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  private eventSubjects: Map<string, ReplaySubject<any>> = new Map();

  constructor(private socket: Socket) {}

  // Écouter un événement WebSocket (une seule fois par événement)
  listen(event: string): Observable<any> {
    if (!this.eventSubjects.has(event)) {
      const subject = new ReplaySubject<any>(1);
      this.socket.fromEvent(event).subscribe((data) => subject.next(data));
      this.eventSubjects.set(event, subject);
    }

    // Retourne un flux partagé pour cet événement
    return this.eventSubjects.get(event)!.asObservable();
  }

  // Émettre un événement WebSocket
  emit(event: string, data: any): void {
    this.socket.emit(event, data);
  }

  // Écouter les mises à jour des positions
  onPositionUpdated(): Observable<PlayerPosition[]> {
    return this.socket.fromEvent('positionUpdated');
  }

  // Envoyer une mise à jour de position
  updatePosition(playerId: string, latitude: number, longitude: number): void {
    this.socket.emit('updatePosition', { playerId, latitude, longitude });
  }
}
