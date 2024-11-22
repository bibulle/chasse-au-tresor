import { Component, Input } from '@angular/core';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCalendar } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { Riddle } from '../../reference/types';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SubmitSolutionDialogComponent } from '../solution/submit-solution/submit-solution-dialog.component';

@Component({
  selector: 'app-riddle',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatCardModule, MatDialogModule],
  templateUrl: './riddle.component.html',
  styleUrl: './riddle.component.scss'
})
export class RiddleComponent {

  @Input() riddle:Riddle | undefined;

  constructor(private dialog: MatDialog) {}

  openSubmitSolutionDialog(): void {
    this.dialog.open(SubmitSolutionDialogComponent, {
      width: '600px',
    });
  }

  showHint() {}

}
