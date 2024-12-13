import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { MapService } from '../../core/map.service';
import { NotificationsService } from '../../core/notifications.service';
import { Player } from '../../reference/types';
import { ScoreComponent } from '../score/score.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatChipsModule, MatIconModule, MatButtonModule, MatMenuModule,ScoreComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  @Input() player: Player | null = null;

  constructor(
    private readonly router: Router,
    private notificationsService: NotificationsService,
    private mapService: MapService
  ) {}

  goToAdmin() {
    this.router.navigate(['/admin']);
  }

  simulatePositionUpdate() {
    if (this.player?.username) {
      this.mapService.simulatePositionUpdate(this.player.username);
    }
  }
  centerUser() {
    if (this.player?.username) {
      this.mapService.centerUser(this.player);
    }
  }
}
