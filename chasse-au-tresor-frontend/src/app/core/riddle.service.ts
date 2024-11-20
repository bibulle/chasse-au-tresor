import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RiddleService {
  private apiUrl = '/api/riddles';

  constructor(private http: HttpClient) {}

  getCurrentRiddle(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/current`);
  }
}
