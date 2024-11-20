import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http: HttpClient) { }

  getPlayers(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:3000/players');
  }
  
  getTeams(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:3000/teams');
  }
  
  assignPlayerToTeam(playerId: string, teamId: string): Observable<any> {
    return this.http.patch(`http://localhost:3000/teams/${teamId}/add-player`, { playerId });
  }
  removePlayerFromTeam(playerId: string, teamId: string): Observable<any> {
    return this.http.patch(`http://localhost:3000/teams/${teamId}/remove-player`, { playerId });
  }
}
