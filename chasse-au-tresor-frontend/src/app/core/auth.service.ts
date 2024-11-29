import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}

  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post('/api/auth/login', credentials);
  }

  decryptToken(token: string | null): any {
    if (!token) {
      return;
    }
    const helper = new JwtHelperService();
    return helper.decodeToken(token);
  }
}
