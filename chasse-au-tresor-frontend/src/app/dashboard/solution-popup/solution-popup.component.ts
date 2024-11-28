import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Solution, TeamRiddle } from '../../reference/types';
@Component({
  selector: 'app-solution-popup',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './solution-popup.component.html',
  styleUrl: './solution-popup.component.scss',
})
export class SolutionPopupComponent {
  constructor(
    public dialogRef: MatDialogRef<SolutionPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { lastResolved: TeamRiddle }
  ) {}

  getSolution(): Solution | undefined {
    return this.data.lastResolved.solutions.filter((s) => s.validated).at(0);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
