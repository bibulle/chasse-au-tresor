import { Component, Input } from '@angular/core';
import { Hint, Player, TeamRiddle } from '../../reference/types';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HintsService } from '../../core/hints.service';
import { UserNotificationsService } from '../../core/user-notifications.service';

@Component({
  selector: 'app-hints',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './hints.component.html',
  styleUrl: './hints.component.scss',
})
export class HintsComponent {
  @Input() hints: Hint[] | undefined = [];

  constructor(private hintsService: HintsService, private userNotificationsService: UserNotificationsService) {}

  hintsPurchased(): Hint[] {
    const ret = this.hints?.filter((hint) => {
      return hint.isPurchased;
    });
    return ret ? ret : [];
  }

  nextHintToPurchase(): Hint | undefined {
    const ret = this.hints
      ?.filter((hint) => {
        return !hint.isPurchased;
      })
      .sort((a, b) => a.order - b.order);

    return ret && ret.length > 0 ? ret[0] : undefined;
  }

  purchaseHint(hintId: string | undefined) {
    this.hintsService.purchaseHint(hintId).subscribe({
      next: () => {
        this.userNotificationsService.success('Indice acheté.');
      },
      error: (err) => {
        console.log(err);
        this.userNotificationsService.error("Erreur lors de l'achat :", err);
      },
    });
  }
}
