import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { MatOption } from '@angular/material/core';
import {
  MatError,
  MatFormField,
  MatFormFieldModule,
  MatLabel,
} from '@angular/material/form-field';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { UserNotificationsService } from '../../core/user-notifications.service';
import { MatButtonModule } from '@angular/material/button';
import { PlayerService } from '../../core/player.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  standalone: true,
  imports: [
    MatFormFieldModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatChipsModule,
    CommonModule,
    MatInputModule,
    MatIconModule,
    MatToolbarModule
  ],
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private userNotificationsService: UserNotificationsService,
    private playerService: PlayerService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', Validators.required],
    });
  }

  goToDashboard() {
    this.router.navigate(['/']);
  } 

  async onSubmit() {
    if (this.loginForm.valid) {
      let username = this.loginForm.value.username;
      username = username.charAt(0).toUpperCase() + username.slice(1);

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.playerService
            .alreadyExists(username)
            .subscribe((alreadyExists) => {
              if (!alreadyExists) {
                this.playerService
                  .createPlayer({ username: username })
                  .subscribe();
              }
            });

          localStorage.setItem('createdUser', `{"username": "${username}"}`);
          localStorage.setItem('token', response.access_token);
          this.router.navigate(['/admin']); // Redirection après login
        },
        error: (err) => {
          this.userNotificationsService.error('Erreur de connexion :', err);
        },
      });
    }
  }
}
