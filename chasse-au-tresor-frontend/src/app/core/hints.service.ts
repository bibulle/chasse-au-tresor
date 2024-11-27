import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Hint } from '../reference/types';

@Injectable({
  providedIn: 'root',
})
export class HintsService {
  constructor(private http: HttpClient) {}

  loadHints(teamRiddleId: string | null): Observable<Hint[]> {
    return this.http.get<Hint[]>(`/api/hints/${teamRiddleId}`);
  }

  purchaseHint(hintId: string | undefined): Observable<void> {
    console.log(`purchaseHint(${hintId})`);
    if (!hintId) {
      of();
    }
    return this.http.get<void>(`/api/hints/${hintId}/purchase`);
  }
}
