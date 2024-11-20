import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatLine, MatLineModule, MatOption } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatFormField, MatLabel, MatSelect } from '@angular/material/select';
import { MatToolbar, MatToolbarModule } from '@angular/material/toolbar';
import { AdminService } from '../../core/admin.service';

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
    MatLineModule
  ],
})
export class AdminDashboardComponent implements OnInit {
  players: any[] = [];
  teams: any[] = [];
  assignmentForm: FormGroup;

  constructor(private fb: FormBuilder, private adminService: AdminService) {
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
    this.adminService
      .getPlayers()
      .subscribe((players) => (this.players = players));
  }

  loadTeams() {
    this.adminService.getTeams().subscribe((teams) => {
      this.teams = teams;
    });

  }

  unassignedPlayer() {
    return this.players.filter((p) => !p.team);
  }

  assignPlayer() {
    const { playerId, teamId } = this.assignmentForm.value;
    this.adminService.assignPlayerToTeam(playerId, teamId).subscribe(() => {
      this.loadTeams();
      this.loadPlayers();
    });
  }

  removePlayer(playerId: string, teamId: string) {
    this.adminService.removePlayerFromTeam(playerId, teamId).subscribe(() => {
      this.loadTeams(); 
      this.loadPlayers();
    });
  }
}
