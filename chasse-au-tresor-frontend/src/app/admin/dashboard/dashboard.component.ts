import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatLineModule, MatOption } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatFormField, MatLabel, MatSelect } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AdminService } from '../../core/admin.service';
import { Player, Team, TeamRiddle } from '../../reference/types';
import { PlayerService } from '../../core/player.service';
import { RiddleFormComponent } from '../riddle-form/riddle-form.component';
import { DatabaseFileManagerComponent } from '../database-file-manager/database-file-manager.component';

@Component({
  selector: 'app-dashboard',
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
    RiddleFormComponent,
    DatabaseFileManagerComponent
  ],
})
export class AdminDashboardComponent implements OnInit {
  players: Player[] = [];
  teams: Team[] = [];
  teamRiddle: TeamRiddle[] = [];


  assignmentForm: FormGroup;

  constructor(private fb: FormBuilder, private adminService: AdminService, private userService: PlayerService) {
    this.assignmentForm = this.fb.group({
      playerId: [''],
      teamId: [''],
    });
  }

  ngOnInit() {
    this.loadPlayers();
    this.loadTeams();
  }

  loadPlayers() {
    this.userService
      .getPlayers()
      .subscribe((players) => (this.players = players));
  }

  loadTeams() {
    this.adminService.getTeams().subscribe((teams) => {
      this.teams = teams;
    });

  }

  loadTeamRiddles() {
    // this.adminService
    //    .getTeamRiddles()
    //    .subscribe((teamRiddle) => (this.teamRiddle = teamRiddle));
  }

  
  unassignedPlayer() {
    return this.players.filter((p) => !p.team);
  }

  assignPlayerToTeam() {
    const { playerId, teamId } = this.assignmentForm.value;
    this.adminService.assignPlayerToTeam(playerId, teamId).subscribe(() => {
      this.loadTeams();
      this.loadPlayers();
    });
  }

  removePlayerFromTeam(playerId: string, teamId: string) {
    this.adminService.removePlayerFromTeam(playerId, teamId).subscribe(() => {
      this.loadTeams(); 
      this.loadPlayers();
    });
  }

  onRiddleSubmit(formData: FormData): void {

    this.adminService.createRiddle(formData).subscribe(()=>{console.log("onRiddleSubmit done")});
  }


}
