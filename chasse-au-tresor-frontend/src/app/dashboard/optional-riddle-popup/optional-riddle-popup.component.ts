import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { TeamRiddle } from '../../reference/types';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SolutionPopupComponent } from '../solution-popup/solution-popup.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-optional-riddle-popup',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './optional-riddle-popup.component.html',
  styleUrl: './optional-riddle-popup.component.scss',
})
export class OptionalRiddlePopupComponent {
  constructor(
    public dialogRef: MatDialogRef<SolutionPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { lastOptional: TeamRiddle }
  ) {}

  closeDialog(): void {
    this.dialogRef.close();
  }
}
