import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PlayerService } from '../../core/player.service';
import { Router } from '@angular/router';
import { UserNotificationsService } from '../../core/user-notifications.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-user-create',
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.scss'],
  standalone: true,
  imports: [
    MatLabel,
    MatError,
    MatInputModule,
    MatFormField,
    MatToolbarModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
  ],
})
export class UserCreateComponent implements OnInit {
  userForm: FormGroup;

  // isUserCreated = false;
  createdUser: { username: String } | undefined;

  constructor(
    private fb: FormBuilder,
    private userService: PlayerService,
    private router: Router,
    private userNotificationsService: UserNotificationsService
  ) {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    const createdUserS = localStorage.getItem('createdUser');
    if (createdUserS) {
      this.createdUser = JSON.parse(createdUserS);

      // this.isUserCreated = true;
      this.router.navigate(['/dashboard']); // Redirection vers un tableau de bord ou une autre page
    }
  }

  onSubmit() {
    if (this.userForm.valid) {
      const userData = this.userForm.value;
      this.userService.createPlayer(userData).subscribe({
        next: () => {
          this.userNotificationsService.success(
            "Utilisateur créé avec succès ! En attente d'assignation a une équipe"
          );
          // this.isUserCreated = true;
          localStorage.setItem('createdUser', JSON.stringify(userData)); // Stocker l'utilisateur
          this.router.navigate(['/dashboard']); // Redirection vers un tableau de bord ou une autre page
        },
        error: (err) => {
          this.userNotificationsService.error(
            'Erreur lors de la création de l’utilisateur :',
            err
          );
        },
      });
    }
  }

  checkUniqueUsername() {
    const username = this.userForm.get('username')?.value;
    if (username) {
      this.userService.alreadyExists(username).subscribe({
        next: (alreadyExists) => {
          if (alreadyExists) {
            this.userForm.get('username')?.setErrors({ notUnique: true });
          }
        },
        error: (err) => {
          this.userNotificationsService.error(
            'Erreur lors de la vérification du nom unique :',
            err
          );
        },
      });
    }
  }
}
