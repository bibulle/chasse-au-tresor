import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {
  MatError,
  MatFormFieldModule,
  MatLabel,
} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-riddle-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatLabel,
    MatError,
    MatInputModule,
    MatButtonModule,
    MatInputModule,
  ],
  templateUrl: './riddle-form.component.html',
  styleUrl: './riddle-form.component.scss',
})
export class RiddleFormComponent implements OnInit {
  riddleForm!: FormGroup;
  uploadedPhoto: File | null = null;

  @Output() formSubmitted = new EventEmitter<any>();

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.riddleForm = this.fb.group({
      text: ['', [Validators.required, Validators.minLength(5)]],
      points: [0, [Validators.required, Validators.min(1)]],
      photo: [null],
    });
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // if (file.size > 5 * 1024 * 1024) {
      //   // Taille max : 5 Mo
      //   alert(
      //     'Le fichier est trop volumineux. Taille maximale autorisée : 5 Mo.'
      //   );
      //   return;
      // }
      // if (!['image/jpeg', 'image/png'].includes(file.type)) {
      //   // Types autorisés
      //   alert('Seuls les fichiers JPG et PNG sont autorisés.');
      //   return;
      // }
      this.uploadedPhoto = file;
      this.riddleForm.patchValue({ photo: file });
    }
  }

  onSubmit(): void {
    if (this.riddleForm.valid) {
      const formData = new FormData();
      formData.append('text', this.riddleForm.get('text')?.value);
      formData.append(
        'points',
        this.riddleForm.get('points')?.value.toString()
      );
      if (this.uploadedPhoto) {
        formData.append('photo', this.uploadedPhoto);
      }
      this.formSubmitted.emit(formData);
    }
  }
}
