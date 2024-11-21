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
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
  ],
})
export class UserCreateComponent implements OnInit {
  userForm: FormGroup;

  // isUserCreated = false;
  createdUser: { username: String; } | undefined;

  constructor(private fb: FormBuilder, private userService: PlayerService, private router: Router) {
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
          alert('Utilisateur créé avec succès !');
          // this.isUserCreated = true;
          localStorage.setItem('createdUser', JSON.stringify(userData)); // Stocker l'utilisateur
          this.router.navigate(['/dashboard']); // Redirection vers un tableau de bord ou une autre page
        },
        error: (err) => {
          console.error('Erreur lors de la création de l’utilisateur :', err);
        },
      });
    }
  }

  checkUniqueUsername() {
    const username = this.userForm.get('username')?.value;
    if (username) {
      this.userService.isUsernameUnique(username).subscribe({
        next: (isUnique) => {
          if (!isUnique) {
            this.userForm.get('username')?.setErrors({ notUnique: true });
          }
        },
        error: (err) => {
          console.error('Erreur lors de la vérification du nom unique :', err);
        },
      });
    }
  }
}
