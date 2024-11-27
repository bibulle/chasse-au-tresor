import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DeleteConfirmDialogComponent } from '../../team/player-action-dialog/delete-confirm-dialog/delete-confirm-dialog.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Hint, TeamRiddle } from '../../../../reference/types';

@Component({
  selector: 'app-edit-hint-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    FormsModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './edit-hint-dialog.component.html',
  styleUrl: './edit-hint-dialog.component.scss',
})
export class EditHintDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<EditHintDialogComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: { hint: Hint; teamRiddleId: string }
  ) {}

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onSave(): void {
    // console.log(this.data);
    this.dialogRef.close({ action: 'save', data: this.data }); // Retourne les modifications
  }

  onDelete(): void {
    const confirmDialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
      width: '300px',
      data: {
        message: 'Êtes-vous sûr de vouloir supprimer cet indice définitivement ?',
      },
    });

    confirmDialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Confirme la suppression
        this.dialogRef.close({ action: 'delete', data: this.data }); // Notifie le composant parent
      }
    });
  }
}
