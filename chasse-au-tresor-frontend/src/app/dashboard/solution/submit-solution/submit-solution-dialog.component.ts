import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { SolutionsService } from '../../../core/solutions.service';

@Component({
  selector: 'app-submit-solution-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './submit-solution-dialog.component.html',
  styleUrl: './submit-solution-dialog.component.scss'
})
export class SubmitSolutionDialogComponent {
  solutionText: string = '';
  selectedFile: File | null = null;
  preview: string | null = null;

  constructor(
    private solutionsService: SolutionsService,
    private dialogRef: MatDialogRef<SubmitSolutionDialogComponent>
  ) {}

  onFileSelected(event: Event): void {
    console.log(`onFileSelected()`);
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];

      // Générer un aperçu de l'image
      const reader = new FileReader();
      reader.onload = () => (this.preview = reader.result as string);
      reader.readAsDataURL(this.selectedFile);
    }
  }

  submitSolution(): void {
    console.log(`submitSolution()`);
    if (this.solutionText && this.selectedFile) {
      this.solutionsService
        .submitSolution('playerId', 'riddleId', this.solutionText, this.selectedFile)
        .subscribe({
          next: () => {
            alert('Solution soumise avec succès !');
            this.closeDialog();
          },
          error: (err) => console.error('Erreur lors de la soumission :', err),
        });
    } else {
      alert('Veuillez remplir le texte et ajouter une photo.');
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
