import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Player, TeamRiddle } from '../../reference/types';
import { SubmitSolutionDialogComponent } from '../solution/submit-solution/submit-solution-dialog.component';

@Component({
  selector: 'app-riddle',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatCardModule, MatDialogModule],
  templateUrl: './riddle.component.html',
  styleUrl: './riddle.component.scss',
})
export class RiddleComponent {
  @Input() teamRiddle: TeamRiddle | undefined;
  @Input() player: Player | null = null;

  @Output() toggleHints = new EventEmitter<void>();

  constructor(private dialog: MatDialog) {}

  openSubmitSolutionDialog(): void {
    this.dialog.open(SubmitSolutionDialogComponent, {
      width: '600px',
      data: {
        playerId: this.player?._id,
        teamRiddleId: this.teamRiddle?._id,
      },
    });
  }

  calculatedGain(): number {
    let calculated = this.teamRiddle?.riddle?.gain ? this.teamRiddle?.riddle?.gain : 0;

    this.teamRiddle?.hints
      .filter((h) => h.isPurchased)
      .forEach((h) => {
        calculated -= h.cost;
      });

    return calculated;
  }
}
