import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, map, Observable, ReplaySubject } from 'rxjs';
import { NotificationsService } from './notifications.service';
import { Player } from '../reference/types';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  private apiUrl = '/api/players'; // URL backend

  private updateNotifier$ = new ReplaySubject<string>(1); // Flux partagé des notifications de mise à jour

  private usersSubject = new BehaviorSubject<Player[] | null>(null);
  users$: Observable<Player[] | null> = this.usersSubject.asObservable();

  private userSubject = new BehaviorSubject<Player | null>(null);
  user$: Observable<Player | null> = this.userSubject.asObservable();

  constructor(
    private notificationsService: NotificationsService,
    private http: HttpClient
  ) {
    this.notificationsService.listen('playerUpdated').subscribe((update: { username: string }) => {
      this.updateNotifier$.next(update.username);
    });
  }

  // Écouter les notifications de mise à jour pour tous les utilisateurs
  listenForUsersUpdates(): void {
    this.updateNotifier$
      .subscribe(() => {
        console.log('Mise à jour détectée via WebSocket. Rechargement des users...');
        this.loadUsers().subscribe(); // Recharge les données à jour
      });
  }
  // Charger tous les users depuis le backend
  loadUsers(): Observable<Player[]> {
    return this.http.get<Player[]>(`${this.apiUrl}`).pipe(
      map((p) => {
        this.usersSubject.next(p);
        return p;
      })
    );
  }
  getPlayers(): Observable<Player[]> {
    return this.http.get<Player[]>('/api/players');
  }

  // Écouter les notifications de mise à jour pour cet utilisateur
  listenForUserUpdates(username: string): void {
    this.updateNotifier$
    .pipe(filter((notifiedUsername) => notifiedUsername === username)) // Filtrer les notifications pour cet utilisateur
    .subscribe(() => {
      console.log('Mise à jour détectée via WebSocket. Rechargement du user...');
      this.loadUser(username).subscribe(); // Recharge les données à jour
    });
  }
  // Charger l'utilisateur connecté depuis le backend
  loadUser(username: string): Observable<Player> {
    return this.http.get<Player>(`${this.apiUrl}/${username}`).pipe(
      map((p) => {
        this.userSubject.next(p);
        return p;
      })
    );
  } 

  createPlayer(userData: { username: string }): Observable<Player> {
    return this.http.post<Player>(this.apiUrl, userData);
  }
  removePlayerFromTheGame(playerId: string): Observable<void> {
    return this.http.delete<void>(`/api/players/${playerId}`);
  }


  alreadyExists(username: string): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.apiUrl}/already-exists?username=${username}`
    );
  }
}
