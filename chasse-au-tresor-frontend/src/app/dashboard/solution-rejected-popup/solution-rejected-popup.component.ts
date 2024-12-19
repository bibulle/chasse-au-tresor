import { Component, Inject } from '@angular/core';
import { Rejection } from '../../core/solutions.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-solution-rejected-popup',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './solution-rejected-popup.component.html',
  styleUrl: './solution-rejected-popup.component.scss',
})
export class SolutionRejectedPopupComponent {
  constructor(
    public dialogRef: MatDialogRef<SolutionRejectedPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { rejection: Rejection }
  ) {}

  getHtml() {
    if (!this.data.rejection.riddle?.photo) {
      return this.data.rejection.riddle?.text;
    } else {
      return `<img mat-card-md-image class="image-riddle" src="/api/files${this.data.rejection.riddle?.photo}" /> ${this.data.rejection.riddle?.text}`;
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
