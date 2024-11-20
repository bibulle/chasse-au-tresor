import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http: HttpClient) { }

  getPlayers(): Observable<any[]> {
    return this.http.get<any[]>('/api/players');
  }
  
  getTeams(): Observable<any[]> {
    return this.http.get<any[]>('/api/teams');
  }
  
  assignPlayerToTeam(playerId: string, teamId: string): Observable<any> {
    return this.http.patch(`/api/teams/${teamId}/add-player`, { playerId });
  }
  removePlayerFromTeam(playerId: string, teamId: string): Observable<any> {
    return this.http.patch(`/api/teams/${teamId}/remove-player`, { playerId });
  }
}
