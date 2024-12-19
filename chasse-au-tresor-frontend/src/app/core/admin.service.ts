import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Player, Solution, Team, TeamRiddle } from '../reference/types';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  constructor(private http: HttpClient) {}

  createRiddle(formData: FormData): Observable<Object> {
    // Exemple de requête HTTP vers le backend
    return this.http.post('/api/riddle', formData);
  }

  updateSolutionStatus(solution: Solution): Observable<Solution> {
    const body = {
      rejectionReason: solution.rejectionReason,
    };
    return this.http.post<Solution>(`/api/solutions/toggle/${solution._id}/${solution.validated}`, body);
  }
}
