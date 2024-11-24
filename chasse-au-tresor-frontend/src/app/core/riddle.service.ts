import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  filter,
  map,
  Observable,
  of,
  ReplaySubject,
} from 'rxjs';
import { TeamRiddle } from '../reference/types';
import { NotificationsService } from './notifications.service';

@Injectable({
  providedIn: 'root',
})
export class RiddleService {
  private apiUrl = '/api/team-riddles';

  // le user concerné
  private username = '';

  private updateNotifier$ = new ReplaySubject<string>(1); // Flux partagé des notifications de mise à jour

  private riddlesSubject: {
    [id: string]: BehaviorSubject<TeamRiddle[] | null>;
  } = {};
  riddle$: { [id: string]: Observable<TeamRiddle[] | null> } = {};

  private currentRiddleSubject = new BehaviorSubject<TeamRiddle | null>(null);
  currentRiddle$: Observable<TeamRiddle | null> = this.currentRiddleSubject.asObservable();

  // private pollingSubscription: Subscription | undefined;

  constructor(
    private notificationsService: NotificationsService,
    private http: HttpClient
  ) {
    this.notificationsService
      .listen('riddleUpdated')
      .subscribe((update: { teamId: string }) => {
        this.updateNotifier$.next(update.teamId);
      });

    // this.startPolling();
  }

  // Écouter les notifications de mise à jour pour toutes les teams
  listenForRiddlesUpdates(teamId: string): void {
    // console.log(`listenForRiddlesUpdates(${teamId})`);
    if (!this.riddlesSubject[teamId] || !this.riddle$[teamId]) {
      this.riddlesSubject[teamId] = new BehaviorSubject<TeamRiddle[] | null>(null);
      this.riddle$[teamId] = this.riddlesSubject[teamId].asObservable();
    }

    this.updateNotifier$
      .pipe(filter((notifiedTeam) => notifiedTeam === teamId)) // Filtrer les notifications pour cette team
      .subscribe(() => {
        console.log(
          `Mise à jour détectée via WebSocket. Rechargement des riddles pour ${teamId}...`
        );
        this.loadRiddles(teamId).subscribe(); // Recharge les données à jour
      });
  }
  // Charger toutes les énigmes
  loadRiddles(teamId: string): Observable<TeamRiddle[] | null> {
    console.log(`loadRiddles(${teamId})`);
    if (!this.riddlesSubject[teamId] || !this.riddle$[teamId]) {
      this.riddlesSubject[teamId] = new BehaviorSubject<TeamRiddle[] | null>(null);
      this.riddle$[teamId] = this.riddlesSubject[teamId].asObservable();
    }

    const url = `${this.apiUrl}/${encodeURIComponent(teamId)}`;
    return this.http.get<TeamRiddle[]>(url).pipe(
      map((p) => {
        this.riddlesSubject[teamId].next(p);
        return p;
      })
    );
  }

  // Écouter les notifications de mise à jour pour cette team
  listenCurrentForRiddleUpdates(teamId: string): void {
    this.updateNotifier$
      .pipe(filter((notifiedTeam) => notifiedTeam === teamId)) // Filtrer les notifications pour cette team
      .subscribe(() => {
        console.log(
          'Mise à jour détectée via WebSocket. Rechargement des riddle...'
        );
        this.loadCurrentRiddle(teamId).subscribe(); // Recharge les données à jour
      });
  }
  // Charger l'énigme courante connecté depuis le backend
  loadCurrentRiddle(teamId: string): Observable<TeamRiddle | null> {
    if (!teamId) {
      return of(null);
    }
    const url = `${this.apiUrl}/current/${encodeURIComponent(teamId)}`;
    return this.http.get<TeamRiddle | null>(url).pipe(
      map((p) => {
        this.currentRiddleSubject.next(p);
        return p;
      })
    );
  }

  ngOnDestroy(): void {
    // this.stopPolling();
  }

}
