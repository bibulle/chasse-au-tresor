import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  distinctUntilChanged,
  interval,
  map,
  Observable,
  of,
  switchMap,
} from 'rxjs';
import { Riddle, Team, TeamRiddle } from '../reference/types';

@Injectable({
  providedIn: 'root',
})
export class RiddleService {
  private apiUrl = '/api/riddles';

  // le user concerné
  private username = '';

  // BehaviorSubject qui stocke l'énigme actuelle
  private currentRiddleSubject: BehaviorSubject<Riddle | undefined> =
    new BehaviorSubject<Riddle | undefined>(undefined);

  constructor(private http: HttpClient) {
    this.startPolling();
  }

  // Méthode pour démarrer le polling
  private startPolling(): void {
    interval(5000) // Interroge toutes les 5 secondes
      .pipe(
        switchMap(() => this.fetchCurrentRiddle()), // Fait une requête au backend
        distinctUntilChanged() // N'émet que si l'énigme change
      )
      .subscribe({
        next: (riddle) => this.currentRiddleSubject.next(riddle),
        error: (err) =>
          console.error('Erreur lors de la récupération de l’énigme:', err),
      });
  }

  // Observable pour les abonnés
  getCurrentRiddle$(username: string): Observable<Riddle | undefined> {
    this.username = username;
    return this.currentRiddleSubject.asObservable();
  }

  // Requête HTTP pour récupérer l'énigme actuelle
  private fetchCurrentRiddle(): Observable<Riddle | undefined> {
    if (this.username === '') {
      return of(undefined);
    }
    const url = `${this.apiUrl}/current?username=${encodeURIComponent(
      this.username
    )}`;
    return this.http.get<Riddle>(url);
  }

  // get all Team-Riddles
  getAllTeamRiddles(): Observable<TeamRiddle[]> {
    const url = `${this.apiUrl}/team-riddles`;
    return this.http.get<TeamRiddle[]>(url).pipe(
      map((teamRiddle: TeamRiddle[]) => {
        // align the riddle and team objects
        const riddlesDico: { [id: string]: Riddle } = {};
        const teamsDico: { [id: string]: Team } = {};
        teamRiddle.forEach((tr) => {
          if (tr.riddle?._id) {
            if (!riddlesDico[tr.riddle?._id]) {
              riddlesDico[tr.riddle?._id] = tr.riddle;
            } else {
              tr.riddle = riddlesDico[tr.riddle?._id];
            }
          }
          if (tr.team?._id) {
            if (!teamsDico[tr.team?._id]) {
              teamsDico[tr.team?._id] = tr.team;
            } else {
              tr.team = teamsDico[tr.team?._id];
            }
          }
        });

        return teamRiddle;
      })
    );
  }
}
