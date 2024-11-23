import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Player, Solution, Team, TeamRiddle } from '../reference/types';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http: HttpClient) { }

  getTeams(): Observable<Team[]> {
    return this.http.get<Team[]>('/api/teams');
  }
  
  assignPlayerToTeam(playerId: string, teamId: string): Observable<Team> {
    return this.http.patch<Team>(`/api/teams/${teamId}/add-player`, { playerId });
  }
  removePlayerFromTeam(playerId: string, teamId: string): Observable<Team> {
    return this.http.patch<Team>(`/api/teams/${teamId}/remove-player`, { playerId });
  }

  createRiddle(formData: FormData): Observable<Object> {
    // Exemple de requête HTTP vers le backend
    return this.http.post('/api/riddle', formData);
  }

  updateSolutionStatus(solution: Solution): Observable<Solution> {
    return this.http.get<Solution>(`/api/solutions/toggle/${solution._id}/${solution.validated}`);
  }

}
