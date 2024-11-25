import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, ReplaySubject } from 'rxjs';
import { Team } from '../reference/types';
import { HttpClient } from '@angular/common/http';
import { NotificationsService } from './notifications.service';

@Injectable({
  providedIn: 'root',
})
export class TeamsService {
  private apiUrl = '/api/teams'; // URL backend

  private updateNotifier$ = new ReplaySubject<string>(1); // Flux partagé des notifications de mise à jour

  private teamsSubject = new BehaviorSubject<Team[] | null>(null);
  teams$: Observable<Team[] | null> = this.teamsSubject.asObservable();

  constructor(
    private notificationsService: NotificationsService,
    private http: HttpClient
  ) {
    this.notificationsService
      .listen('teamUpdated')
      .subscribe((update: { teamId: string }) => {
        this.updateNotifier$.next(update.teamId);
      });
  }

  // Écouter les notifications de mise à jour pour tous les utilisateurs
  listenForTeamsUpdates(): void {
    this.updateNotifier$.subscribe(() => {
      console.log(
        'Mise à jour détectée via WebSocket. Rechargement des teams...'
      );
      this.loadTeams().subscribe(); // Recharge les données à jour
    });
  }
  // Charger tous les teams depuis le backend
  loadTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(`${this.apiUrl}`).pipe(
      map((p) => {
        this.teamsSubject.next(p);
        return p;
      })
    );
  }
  // getTeams(): Observable<Team[]> {
  //   return this.http.get<Team[]>('/api/teams');
  // }
  assignPlayerToTeam(playerId: string, teamId: string): Observable<Team> {
    return this.http.patch<Team>(`/api/teams/${teamId}/add-player`, {
      playerId,
    });
  }
  removePlayerFromTeam(playerId: string, teamId: string): Observable<Team> {
    return this.http.patch<Team>(`/api/teams/${teamId}/remove-player`, {
      playerId,
    });
  }
}
