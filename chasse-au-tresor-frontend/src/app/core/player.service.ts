import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Player } from '../reference/types';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  private apiUrl = '/api/players'; // URL backend

  constructor(private http: HttpClient) {}

  getPlayers(): Observable<Player[]> {
    return this.http.get<Player[]>('/api/players');
  }

  getPlayerByUsername(username: string): Observable<Player> {
    return this.http.get<Player>(`${this.apiUrl}/${username}`);
  }
  createPlayer(userData: { username: string }): Observable<Player> {
    return this.http.post<Player>(this.apiUrl, userData);
  }

  isUsernameUnique(username: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/is-unique?username=${username}`);
  }
}
