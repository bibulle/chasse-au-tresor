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
import { AdminService } from '../../core/admin.service';
import { PlayerService } from '../../core/player.service';
import { Player, Team } from '../../reference/types';
import { DatabaseFileManagerComponent } from '../database-file-manager/database-file-manager.component';
import { RiddleFormComponent } from '../riddle-form/riddle-form.component';
import { TeamComponent } from './team/team.component';
import { HeaderComponent } from '../header/header.component';
import { firstValueFrom } from 'rxjs';
import { UserNotificationsService } from '../../core/user-notifications.service';

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
    DatabaseFileManagerComponent,
    TeamComponent,
    HeaderComponent,
  ],
})
export class AdminDashboardComponent implements OnInit {
  players: Player[] = [];
  teams: Team[] = [];
  // teamRiddle: TeamRiddle[] = [];

  assignmentForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private userService: PlayerService,
    private userNotificationsService:UserNotificationsService
  ) {
    this.assignmentForm = this.fb.group({
      playerId: [''],
      teamId: [''],
    });
  }

  async ngOnInit() {
    this.players = await firstValueFrom(this.userService.loadUsers());
    this.userService.listenForUsersUpdates();
    this.userService.users$.subscribe((users) => {
      if (users) {
        this.players = users;
      }
    });

    this.loadTeams();
  }

  loadTeams() {
    this.adminService.getTeams().subscribe({
      next: (teams) => (this.teams = teams),
      error: (err) =>
        this.userNotificationsService.error('Erreur lors du chargement des équipes :', err),
    });
  }

  unassignedPlayer() {
    return this.players.filter((p) => !p.team);
  }

  assignPlayerToTeam() {
    const { playerId, teamId } = this.assignmentForm.value;
    this.adminService.assignPlayerToTeam(playerId, teamId).subscribe(() => {
      this.loadTeams();
      //this.loadPlayers();
    });
  }

  removePlayerFromTeam(playerId: string, teamId: string) {
    this.adminService.removePlayerFromTeam(playerId, teamId).subscribe(() => {
      this.loadTeams();
      //this.loadPlayers();
    });
  }

  onRiddleSubmit(formData: FormData): void {
    this.adminService.createRiddle(formData).subscribe(() => {
      this.userNotificationsService.success('Énigme sauvegardée');
    });
  }
}
