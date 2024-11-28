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
    console.log(data);
    console.log(data.data.riddle);
    const formData = new FormData();
    if (data.data.riddle._id) formData.append('_id', data.data.riddle._id);
    if (data.data.riddle.gain) formData.append('gain', data.data.riddle.gain);
    if (data.data.riddle.latitude) formData.append('latitude', data.data.riddle.latitude);
    if (data.data.riddle.longitude) formData.append('longitude', data.data.riddle.longitude);
    if (data.data.riddle.photo) formData.append('photo', data.data.riddle.photo);
    if (data.data.riddle.trivia) formData.append('trivia', data.data.riddle.trivia);
    if (data.data.riddle.text) formData.append('text', data.data.riddle.text);
    if (data.data.selectedFile) formData.append('file', data.data.selectedFile);
    if (data.data.teams) formData.append('teams', JSON.stringify(data.data.teams));

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
