import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DeleteConfirmDialogComponent } from './delete-confirm-dialog/delete-confirm-dialog.component';

@Component({
  selector: 'app-player-action-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './player-action-dialog.component.html',
  styleUrl: './player-action-dialog.component.scss',
})
export class PlayerActionDialogComponent {
  constructor(
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<PlayerActionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onKick(): void {
    this.dialogRef.close('kick');
  }

  onDelete(): void {
    const confirmDialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
      width: '300px' // Ajustez si nécessaire
    });
  
    confirmDialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Confirme la suppression
        this.dialogRef.close('delete'); // Notifie le composant parent
      }
    });
    }
}
