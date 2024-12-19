import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-rejection-reason-dialog',
  standalone: true,
  imports: [MatDialogModule, MatFormFieldModule, MatButtonModule, MatInputModule, FormsModule, CommonModule],
  templateUrl: './rejection-reason-dialog.component.html',
  styleUrl: './rejection-reason-dialog.component.scss',
})
export class RejectionReasonDialogComponent {
  reason: string = '';

  constructor(
    public dialogRef: MatDialogRef<RejectionReasonDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    this.dialogRef.close(this.reason);
  }
}
