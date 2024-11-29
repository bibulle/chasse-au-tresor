import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { PlayerService } from './player.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService, private playerService: PlayerService) {}

  canActivate(): boolean {
    const token = localStorage.getItem('token');

    if (token) {
      const decrypted = this.authService.decryptToken(token);
      if (decrypted && decrypted.username) {
        const username = decrypted.username.charAt(0).toUpperCase() + decrypted.username.slice(1);
        localStorage.setItem('createdUser', `{"username": "${username}"}`);

        this.playerService.alreadyExists(username).subscribe((alreadyExists) => {
          if (!alreadyExists) {
            this.playerService.createPlayer({ username: username }).subscribe();
          }
        });
      }

      return true; // L'utilisateur est authentifié
    } else {
      this.router.navigate(['/login']); // Redirige vers la page de login
      return false;
    }
  }
}
