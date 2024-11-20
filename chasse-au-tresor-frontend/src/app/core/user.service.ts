import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = '/api/players'; // URL backend
  private mockExistingUsernames = ['Alice', 'Bob', 'Charlie']; // Mock temporaire

  constructor(private http: HttpClient) {}

  getUserByUsername(username: string): Observable<any> {
    return this.http.get<boolean>(`${this.apiUrl}/${username}`);
  }
  createUser(userData: { username: string }): Observable<any> {
    return this.http.post<any>(this.apiUrl, userData);
  }

  isUsernameUnique(username: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/is-unique?username=${username}`);
  }
}
