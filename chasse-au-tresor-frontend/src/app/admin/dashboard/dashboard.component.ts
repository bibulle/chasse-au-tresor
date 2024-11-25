import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatLineModule, MatOption } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatFormField, MatLabel, MatSelect } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { firstValueFrom } from 'rxjs';
import { AdminService } from '../../core/admin.service';
import { PlayerService } from '../../core/player.service';
import { RiddlesService } from '../../core/riddles.service';
import { TeamsService } from '../../core/teams.service';
import { UserNotificationsService } from '../../core/user-notifications.service';
import { Player, Riddle, Team } from '../../reference/types';
import { HeaderComponent } from '../header/header.component';
import { RiddleFormComponent } from '../riddle-form/riddle-form.component';
import { EditTeamRiddleDialogComponent } from './riddle/edit-team-riddle-dialog/edit-team-riddle-dialog.component';
import { TeamComponent } from './team/team.component';
import { MatDialog } from '@angular/material/dialog';
import { RiddleComponent } from './riddle/riddle.component';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatOption,
    MatSelect,
    MatLabel,
    MatFormField,
    MatButtonModule,
    MatToolbarModule,
    MatCardModule,
    MatListModule,
    MatIconModule,
    MatLineModule,
    MatExpansionModule,
    MatTableModule,
    MatTooltipModule,
    MatChipsModule,
    MatCheckboxModule,
    RiddleFormComponent,
    TeamComponent,
    HeaderComponent,
    RiddleComponent
  ],
})
export class AdminDashboardComponent implements OnInit {
  players: Player[] = [];
  teams: Team[] = [];
  unassignedRiddles: Riddle[] = [];
  // teamRiddle: TeamRiddle[] = [];

  assignmentForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private playerService: PlayerService,
    private teamsService: TeamsService,
    private riddlesService: RiddlesService,
    private userNotificationsService: UserNotificationsService,
    private dialog: MatDialog,

  ) {
    this.assignmentForm = this.fb.group({
      playerId: [''],
      teamId: [''],
    });
  }

  async ngOnInit() {
    this.players = await firstValueFrom(this.playerService.loadUsers());
    this.playerService.listenForUsersUpdates();
    this.playerService.users$.subscribe((users) => {
      if (users) {
        this.players = users;
      }
    });

    this.teams = await firstValueFrom(this.teamsService.loadTeams());
    this.teamsService.listenForTeamsUpdates();
    this.teamsService.teams$.subscribe((teams) => {
      if (teams) {
        this.teams = teams;
      }
    });

    const temp = await firstValueFrom(this.riddlesService.loadUnassignedRiddles());
    this.unassignedRiddles = temp ? temp : [];
    // console.log(this.unassignedRiddles);
    this.riddlesService.listenForUnassignedRiddlesUpdates();
    this.riddlesService.unassignedRiddle$.subscribe((riddles) => {
      if (riddles) {
        this.unassignedRiddles = riddles;
        // console.log(this.unassignedRiddles);
      }
    });
  }

  unassignedPlayer() {
    return this.players.filter((p) => !p.team);
  }

  assignPlayerToTeam() {
    const { playerId, teamId } = this.assignmentForm.value;
    this.teamsService.assignPlayerToTeam(playerId, teamId).subscribe(() => {
      this.userNotificationsService.success(`Joueur assigné a l\'équipe`);
      // this.loadTeams();
      //this.loadPlayers();
    });
  }

  onRiddleSubmit(formData: FormData): void {
    this.adminService.createRiddle(formData).subscribe(() => {
      this.userNotificationsService.success('Énigme sauvegardée');
    });
  }

  onEditRiddle(riddle:Riddle, event: any) {
    event.stopPropagation();

    console.log(riddle);

    if (!riddle) {
      return;
    }

    const dialogRef = this.dialog.open(EditTeamRiddleDialogComponent, {
      width: '600px',
      data: {
        riddle: { ...riddle },
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.riddlesService.saveRiddle(result).subscribe({
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
