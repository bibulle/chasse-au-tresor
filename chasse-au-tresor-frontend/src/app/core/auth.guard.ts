import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('token');
    if (token) {
      return true; // L'utilisateur est authentifié
    } else {
      this.router.navigate(['/login']); // Redirige vers la page de login
      return false;
    }
  }
}
