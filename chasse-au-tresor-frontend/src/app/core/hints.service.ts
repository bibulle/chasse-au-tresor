import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Hint } from '../reference/types';

@Injectable({
  providedIn: 'root',
})
export class HintsService {
  private apiUrl = '/api/hints';

  constructor(private http: HttpClient) {}

  loadHints(teamRiddleId: string | null): Observable<Hint[]> {
    return this.http.get<Hint[]>(`${this.apiUrl}/${teamRiddleId}`);
  }

  purchaseHint(hintId: string | undefined): Observable<void> {
    console.log(`purchaseHint(${hintId})`);
    if (!hintId) {
      of();
    }
    return this.http.get<void>(`${this.apiUrl}/${hintId}/purchase`);
  }

  saveHint(hint: Hint, teamRiddleId: string): Observable<Hint> {
    return this.http.post<Hint>(`${this.apiUrl}`, { hint: hint, teamRiddleId: teamRiddleId });
  }

  deleteHint(hint: Hint): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${hint._id}`);
  }
}
