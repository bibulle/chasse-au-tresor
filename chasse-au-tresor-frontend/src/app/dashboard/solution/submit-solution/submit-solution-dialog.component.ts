import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SolutionsService } from '../../../core/solutions.service';
import { UserNotificationsService } from '../../../core/user-notifications.service';

@Component({
  selector: 'app-submit-solution-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './submit-solution-dialog.component.html',
  styleUrl: './submit-solution-dialog.component.scss',
})
export class SubmitSolutionDialogComponent {
  solutionText: string = '';
  selectedFile: File | null = null;
  preview: string | null = null;

  constructor(
    private solutionsService: SolutionsService,
    private userNotificationsService: UserNotificationsService,
    private dialogRef: MatDialogRef<SubmitSolutionDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { playerId: string; teamRiddleId: string }
  ) {}

  onFileSelected(event: Event): void {
    // console.log(`onFileSelected()`);
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
    // console.log(`submitSolution()`);
    // console.log(this.data);
    if (this.solutionText && this.selectedFile) {
      this.closeDialog();
      this.solutionsService
        .submitSolution(this.data.playerId, this.data.teamRiddleId, this.solutionText, this.selectedFile)
        .subscribe({
          next: () => {
            this.userNotificationsService.success('Solution soumise avec succès !! En attente de validation.');
          },
          error: (err) => this.userNotificationsService.error('Erreur lors de la soumission', err),
        });
    } else {
      this.userNotificationsService.error('Veuillez remplir le texte et ajouter une photo.', null);
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
