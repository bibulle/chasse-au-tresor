import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { ImportExportDialogComponent } from '../import-export-dialog/import-export-dialog.component';
import { EditTeamRiddleDialogComponent } from '../dashboard/riddle/edit-team-riddle-dialog/edit-team-riddle-dialog.component';
import { RiddlesService } from '../../core/riddles.service';
import { UserNotificationsService } from '../../core/user-notifications.service';
import { Team } from '../../reference/types';
import { TeamsService } from '../../core/teams.service';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [MatChipsModule, MatIconModule, MatButtonModule, MatToolbarModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  teamOrder: { team: Team; order: number }[] = [];

  constructor(
    private readonly router: Router,
    private dialog: MatDialog,
    private riddleService: RiddlesService,
    private teamsService: TeamsService,
    private userNotificationsService: UserNotificationsService
  ) {}

  ngOnInit(): void {
    this.loadTeamsOrder();
  }

  loadTeamsOrder() {
    console.log(`loadTeamsOrder()`);
    this.teamsService.loadTeams().subscribe((teams) => {
      teams.forEach((t) => {
        this.teamOrder.push({ team: t, order: 0 });
      });
    });
  }

  goToDashboard() {
    this.router.navigate(['/']);
  }
  logout() {
    localStorage.removeItem('createdUser');
    localStorage.removeItem('id_token');
    localStorage.removeItem('token');
    window.location.reload();
  }

  importExport() {
    const dialogRef = this.dialog.open(ImportExportDialogComponent, {
      maxWidth: '600px', // Limite la largeur maximale
      width: '90%', // Adapte à l'écran
    });

    dialogRef.afterClosed().subscribe((action) => {});
  }

  newRiddle() {
    const dialogRef = this.dialog.open(EditTeamRiddleDialogComponent, {
      width: '600px',
      data: {
        riddle: {},
        teams: this.teamOrder,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.riddleService.saveRiddle(result).subscribe({
          next: () => {
            this.userNotificationsService.success('Énigme sauvegardée.');
          },
          error: (err) => {
            console.log(err);
            this.userNotificationsService.error(
              'Erreur lors de la sauvegarde :',
              err.message
            );
          },
        });
      }
    });
  }
}
