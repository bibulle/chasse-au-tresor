import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NotificationsService } from './notifications.service';
import { BehaviorSubject, filter, map, Observable, of, ReplaySubject } from 'rxjs';
import { Riddle, Team } from '../reference/types';

@Injectable({
  providedIn: 'root',
})
export class RiddlesService {
  private apiUrl = '/api/riddles';

  private updateNotifier$ = new ReplaySubject<string>(1); // Flux partagé des notifications de mise à jour

  private unassignedRiddlesSubject = new BehaviorSubject<Riddle[] | null>(null);
  unassignedRiddle$: Observable<Riddle[] | null> = this.unassignedRiddlesSubject.asObservable();

  constructor(private notificationsService: NotificationsService, private http: HttpClient) {
    this.notificationsService.listen('riddleUpdated').subscribe((update: { teamId: string }) => {
      this.updateNotifier$.next(update.teamId);
    });

    // this.startPolling();
  }

  // Écouter les notifications de mise à jour pour toutes les teams
  listenForUnassignedRiddlesUpdates(): void {
    // console.log(`listenForUnassignedRiddlesUpdates(${teamId})`);
    this.updateNotifier$.subscribe(() => {
      console.log(`Mise à jour détectée via WebSocket. Rechargement des riddles...`);
      this.loadUnassignedRiddles().subscribe(); // Recharge les données à jour
    });
  }
  // Charger toutes les énigmes
  loadUnassignedRiddles(): Observable<Riddle[] | null> {
    console.log(`loadUnassignedRiddles()`);
    const url = `${this.apiUrl}/unassigned`;
    return this.http.get<Riddle[]>(url).pipe(
      map((p) => {
        this.unassignedRiddlesSubject.next(p);
        return p;
      })
    );
  }

  saveRiddle(data: any) {
    // console.log(data);
    // console.log(data.riddle);
    const formData = new FormData();
    if (data.riddle._id) formData.append('_id', data.riddle._id);
    if (data.riddle.gain) formData.append('gain', data.riddle.gain);
    if (data.riddle.latitude) formData.append('latitude', data.riddle.latitude);
    if (data.riddle.longitude) formData.append('longitude', data.riddle.longitude);
    if (data.riddle.photo) formData.append('photo', data.riddle.photo);
    if (data.riddle.trivia) formData.append('trivia', data.riddle.trivia);
    if (data.riddle.text) formData.append('text', data.riddle.text);
    if (data.riddle.title) formData.append('title', data.riddle.title);
    if (data.riddle.optional) {
      formData.append('optional', data.riddle.optional);
    } else {
      formData.append('optional', 'false');
    }
    if (data.selectedFile) formData.append('file', data.selectedFile);
    if (data.teams) formData.append('teams', JSON.stringify(data.teams));

    return this.http.post('/api/riddles', formData);
  }
  deleteRiddle(data: any) {
    return this.http.delete(`/api/riddles/${data.riddle._id}`);
  }

  getRiddleTeamOrder(riddleId: string | undefined): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${riddleId}/teams`);
  }

  ngOnDestroy(): void {
    // this.stopPolling();
  }
}
