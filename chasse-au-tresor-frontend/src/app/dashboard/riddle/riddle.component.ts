import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Player, Riddle, TeamRiddle } from '../../reference/types';
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

  @Input() optionalRiddles: TeamRiddle[] = [];
  optionalRiddlesIndex = 0;

  @Input() player: Player | null = null;

  @Output() toggleHints = new EventEmitter<void>();

  isCardHidden = false; // État de la carte (visible ou cachée)
  startY = 0; // Position initiale du toucher
  currentY = 0; // Position actuelle pendant le glissement
  threshold = 100; // Distance minimale pour déclencher un changement d'état
  isSwipeGesture = false; // Pour différencier les swipes des clics

  constructor(private dialog: MatDialog) {}

  getHtml() {
    //<img *ngIf="teamRiddle?.riddle?.photo" mat-card-md-image src="/api/files{{ teamRiddle?.riddle?.photo }}" />
    if (!this.getTeamRiddle()?.riddle?.photo) {
      return this.getTeamRiddle()?.riddle?.text;
    } else {
      return `<img mat-card-md-image class="image-riddle" src="/api/files${this.getTeamRiddle()?.riddle?.photo}" /> ${
        this.getTeamRiddle()?.riddle?.text
      }`;
    }
  }

  isSolutionLocked() {
    if (
      this.getTeamRiddle()?.riddle?.solutionLocked &&
      !this.getTeamRiddle()?.hints.some((hint) => hint.isPurchased && hint.unlockSolution)
    ) {
      return true;
    }
    return false;
  }

  openSubmitSolutionDialog(): void {
    this.dialog.open(SubmitSolutionDialogComponent, {
      width: '600px',
      data: {
        playerId: this.player?._id,
        teamRiddleId: this.getTeamRiddle()?._id,
      },
    });
  }

  getTeamRiddle(): TeamRiddle | undefined {
    if (this.optionalRiddlesIndex === 0) {
      return this.teamRiddle;
    } else {
      if (
        this.optionalRiddlesIndex > this.optionalRiddles.length ||
        !this.optionalRiddles[this.optionalRiddlesIndex - 1].riddle
      ) {
        this.optionalRiddlesIndex = 0;
        return this.teamRiddle;
      }
      return this.optionalRiddles[this.optionalRiddlesIndex - 1];
    }
  }
  calculatedGain(): number {
    const initial = this.getTeamRiddle()?.riddle?.gain;
    let calculated = 0;
    if (initial) {
      calculated = initial;
    }

    this.getTeamRiddle()
      ?.hints.filter((h) => h.isPurchased)
      .forEach((h) => {
        calculated -= h.cost;
      });

    return calculated;
  }

  toggleOptionalRiddles() {
    if (this.optionalRiddlesIndex === 0) {
      this.optionalRiddlesIndex = Math.min(1, this.optionalRiddles.length);
    } else {
      this.optionalRiddlesIndex = 0;
    }
  }
  incrementOptionalRiddles(increment: number) {
    this.optionalRiddlesIndex += increment;

    if (this.optionalRiddlesIndex < 0) {
      this.optionalRiddlesIndex = 0;
    }
    if (this.optionalRiddlesIndex > this.optionalRiddles.length) {
      this.optionalRiddlesIndex = this.optionalRiddles.length;
    }
  }

  onTouchStart(event: TouchEvent): void {
    console.log(`onTouchStart(${event.touches[0].clientY})`);
    this.startY = event.touches[0].clientY;
    this.currentY = this.startY;

    this.isSwipeGesture = false; // Réinitialiser le flag

    // event.preventDefault();
  }

  onTouchMove(event: TouchEvent): void {
    console.log(`onTouchMove(${event.touches[0].clientY})`);
    this.currentY = event.touches[0].clientY;

    // Optionnel : appliquez une translation visuelle pendant le mouvement
    const deltaY = this.currentY - this.startY;

    if (Math.abs(deltaY) > 10) {
      this.isSwipeGesture = true; // Détecte un swipe
      const card = document.querySelector('.swipeable-riddle-card') as HTMLElement;
      if (card) {
        card.style.transform = `translateY(${deltaY}px)`; // Déplacer visuellement la carte
      }
    }
  }

  onTouchEnd(event: TouchEvent): void {
    console.log(`onTouchEnd(${this.startY})`);
    const deltaY = this.currentY - this.startY;
    // console.log(`   deltaY -> ${deltaY}`);

    if (this.isSwipeGesture) {
      if (deltaY > this.threshold) {
        this.isCardHidden = true; // Ranger la carte
      } else if (deltaY < -this.threshold) {
        this.isCardHidden = false; // Remonter la carte
      }

      // Réinitialiser la translation de la carte
      const card = document.querySelector('.swipeable-riddle-card') as HTMLElement;
      if (card) {
        card.style.transform = '';
      }

      // Bloquer le comportement par défaut uniquement en cas de swipe
      event.preventDefault();
    }
  }
}
