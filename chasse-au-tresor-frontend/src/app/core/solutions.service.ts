import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NotificationsService } from './notifications.service';
import { BehaviorSubject, filter, Observable, ReplaySubject } from 'rxjs';
import { Riddle } from '../reference/types';
import { RiddlesService } from './riddles.service';

@Injectable({
  providedIn: 'root',
})
export class SolutionsService {
  private updateNotifier$ = new ReplaySubject<RejectionIds>(); // Flux partagé des notifications de mise à jour

  private rejectedSolutionSubject = new BehaviorSubject<Rejection | null>(null);
  rejectedSolution$: Observable<Rejection | null> = this.rejectedSolutionSubject.asObservable();

  constructor(
    private notificationsService: NotificationsService,
    private http: HttpClient,
    private riddlesService: RiddlesService
  ) {
    console.log('SolutionsService subscribe');
    this.notificationsService.listen('solutionRefused').subscribe((update: RejectionIds) => {
      // console.log(`solutionRefused`);
      // console.log(update);
      this.updateNotifier$.next({
        playerId: update.playerId,
        rejectionReason: update.rejectionReason,
        teamRiddleId: update.teamRiddleId,
      });
    });
  }

  submitSolution(playerId: string, riddleId: string, text: string, photo: File) {
    const formData = new FormData();
    formData.append('playerId', playerId);
    formData.append('riddleId', riddleId);
    formData.append('text', text);
    formData.append('photo', photo);

    return this.http.post('/api/solutions/submit', formData);
  }

  // Écouter les notifications de solution refusé
  listenForRejectedSolution(playerId: string): void {
    this.updateNotifier$
      .pipe(filter((data: RejectionIds) => data.playerId === playerId)) // Filtrer les notifications pour cet utilisateur
      .subscribe(async (rejection) => {
        console.log("Solution refusé pour l'utilisateur...");
        this.riddlesService.getRiddleFromTeamRiddle(rejection.teamRiddleId).subscribe((riddle) => {
          this.rejectedSolutionSubject.next({
            rejectionReason: rejection.rejectionReason,
            riddle: riddle,
          });
        });
      });
  }
}

export interface RejectionIds {
  playerId: string;
  rejectionReason: string;
  teamRiddleId: string;
}
export interface Rejection {
  rejectionReason: string;
  riddle: Riddle;
}
