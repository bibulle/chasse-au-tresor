import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { NotificationsService } from '../../core/notifications.service';
import { Player } from '../../reference/types';
import { MapService } from '../../core/map.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatChipsModule, MatIconModule, MatButtonModule],
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
