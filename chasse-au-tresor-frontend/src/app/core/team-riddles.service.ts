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
import { Riddle, TeamRiddle } from '../reference/types';
import { NotificationsService } from './notifications.service';

@Injectable({
  providedIn: 'root',
})
export class TeamRiddlesService {
  private apiUrl = '/api/team-riddles';

  private updateNotifier$ = new ReplaySubject<string>(1); // Flux partagé des notifications de mise à jour

  private teamRiddlesSubject: {
    [id: string]: BehaviorSubject<TeamRiddle[] | null>;
  } = {};
  teamRiddle$: { [id: string]: Observable<TeamRiddle[] | null> } = {};

  private currentTeamRiddleSubject = new BehaviorSubject<TeamRiddle | null>(
    null
  );
  currentTeamRiddle$: Observable<TeamRiddle | null> =
    this.currentTeamRiddleSubject.asObservable();

  // private pollingSubscription: Subscription | undefined;

  constructor(
    private notificationsService: NotificationsService,
    private http: HttpClient
  ) {
    this.notificationsService
      .listen('riddleUpdated')
      .subscribe((update: { teamId: string }) => {
        // console.log(update);
        this.updateNotifier$.next(update.teamId);
      });

    // this.startPolling();
  }

  // Écouter les notifications de mise à jour pour toutes les teams
  listenForTeamRiddlesUpdates(teamId: string): void {
    console.log(`listenForTeamRiddlesUpdates(${teamId})`);
    if (!this.teamRiddlesSubject[teamId] || !this.teamRiddle$[teamId]) {
      this.teamRiddlesSubject[teamId] = new BehaviorSubject<
        TeamRiddle[] | null
      >(null);
      this.teamRiddle$[teamId] = this.teamRiddlesSubject[teamId].asObservable();
    }

    this.updateNotifier$
      .pipe(
        filter((notifiedTeam) => {
          // console.log(
          //   `filter ${notifiedTeam} === ${teamId}   -> ${
          //     notifiedTeam === teamId
          //   }`
          // );
          return notifiedTeam === teamId;
        })
      ) // Filtrer les notifications pour cette team
      .subscribe(() => {
        console.log(
          `Mise à jour détectée via WebSocket. Rechargement des teams riddles pour ${teamId}...`
        );
        this.loadTeamRiddles(teamId).subscribe(); // Recharge les données à jour
      });
  }
  // Charger toutes les énigmes
  loadTeamRiddles(teamId: string): Observable<TeamRiddle[] | null> {
    console.log(`loadTeamRiddles(${teamId})`);
    if (!this.teamRiddlesSubject[teamId] || !this.teamRiddle$[teamId]) {
      this.teamRiddlesSubject[teamId] = new BehaviorSubject<
        TeamRiddle[] | null
      >(null);
      this.teamRiddle$[teamId] = this.teamRiddlesSubject[teamId].asObservable();
    }

    const url = `${this.apiUrl}/${encodeURIComponent(teamId)}`;
    return this.http.get<TeamRiddle[]>(url).pipe(
      map((p) => {
        this.teamRiddlesSubject[teamId].next(p);
        return p;
      })
    );
  }

  // Écouter les notifications de mise à jour pour cette team
  listenForCurrentTeamRiddleUpdates(teamId: string): void {
    this.updateNotifier$
      .pipe(filter((notifiedTeam) => notifiedTeam === teamId)) // Filtrer les notifications pour cette team
      .subscribe(() => {
        console.log(
          'Mise à jour détectée via WebSocket. Rechargement des team riddle...'
        );
        this.loadCurrentTeamRiddle(teamId).subscribe(); // Recharge les données à jour
      });
  }
  // Charger l'énigme courante connecté depuis le backend
  loadCurrentTeamRiddle(teamId: string): Observable<TeamRiddle | null> {
    if (!teamId) {
      return of(null);
    }
    const url = `${this.apiUrl}/current/${encodeURIComponent(teamId)}`;
    return this.http.get<TeamRiddle | null>(url).pipe(
      map((p) => {
        this.currentTeamRiddleSubject.next(p);
        return p;
      })
    );
  }
}
