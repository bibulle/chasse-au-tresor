import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-import-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './import-confirmation-dialog.component.html',
  styleUrl: './import-confirmation-dialog.component.scss'
})
export class ImportConfirmationDialogComponent {

  constructor(
    private dialogRef: MatDialogRef<ImportConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true); // L'utilisateur confirme
  }

  onCancel(): void {
    this.dialogRef.close(false); // L'utilisateur annule
  }

}
