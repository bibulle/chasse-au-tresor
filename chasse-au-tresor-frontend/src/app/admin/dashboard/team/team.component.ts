import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { firstValueFrom, Subscription } from 'rxjs';
import { MapService } from '../../../core/map.service';
import { PlayerService } from '../../../core/player.service';
import { TeamRiddlesService } from '../../../core/team-riddles.service';
import { TeamsService } from '../../../core/teams.service';
import { Player, Team, TeamRiddle } from '../../../reference/types';
import { RiddleComponent } from '../riddle/riddle.component';
import { PlayerActionDialogComponent } from './player-action-dialog/player-action-dialog.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-admin-team',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatChipsModule,
    RiddleComponent,
  ],
  templateUrl: './team.component.html',
  styleUrl: './team.component.scss',
})
export class TeamComponent implements OnInit, OnDestroy {
  @Input() team: Team | undefined;

  actionNeededStateGlobal = false;
  actionNeededStateByRiddle: { [key: string]: boolean } = {};

  teamRiddles: TeamRiddle[] = [];
  teamRiddleSubscription: Subscription | undefined;

  constructor(
    private readonly riddleService: TeamRiddlesService,
    private readonly playerService: PlayerService,
    private readonly teamsService: TeamsService,
    private readonly mapService: MapService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadRiddlesForTeam();
  }

  ngOnDestroy(): void {
    if (this.teamRiddleSubscription) {
      this.teamRiddleSubscription.unsubscribe();
    }
  }

  actionNeededStateChange(state: boolean, teamRiddleId: string) {
    console.log(`actionNeededStateChange(${state}, ${teamRiddleId})`);
    this.actionNeededStateByRiddle[teamRiddleId] = state;
    this.actionNeededStateGlobal = Object.values(this.actionNeededStateByRiddle).some((b) => b);
  }

  async loadRiddlesForTeam(): Promise<void> {
    if (this.team && !this.teamRiddleSubscription) {
      this.updateTeamRiddles(await firstValueFrom(this.riddleService.loadTeamRiddles(this.team._id)));
      this.riddleService.listenForTeamRiddlesUpdates(this.team._id);
      this.teamRiddleSubscription = this.riddleService.teamRiddle$[this.team._id].subscribe((teamRiddles) => {
        this.updateTeamRiddles(teamRiddles);
      });
    }
  }

  updateTeamRiddles(teamRiddles: TeamRiddle[] | null) {
    if (!teamRiddles) {
      return;
    }

    teamRiddles.forEach((tr) => {
      this.updateTeamRiddle(tr);
    });

    this.teamRiddles.forEach((tr, index) => {
      const oldTR = teamRiddles.find((teamRiddle) => tr._id === teamRiddle._id);
      if (!oldTR) {
        this.teamRiddles.splice(index, 1);
      }
    });

    this.mapService.updateMarkerTeamRiddles(this.teamRiddles, false, this.team?.color);
  }
  updateTeamRiddle(teamRiddle: TeamRiddle) {
    // console.log(`updateTeamRiddle()`)
    // console.log(teamRiddle)
    const oldTR = this.teamRiddles.find((tr) => tr._id === teamRiddle._id);

    if (!oldTR) {
      this.teamRiddles.push(teamRiddle);
    } else {
      oldTR.order = teamRiddle.order;
      oldTR.resolved = teamRiddle.resolved;
      oldTR.riddle = teamRiddle.riddle;
      oldTR.solutions = teamRiddle.solutions;
      oldTR.team = teamRiddle.team;
      oldTR.hints = teamRiddle.hints;
    }
  }

  openPlayerActionDialog(player: any): void {
    const dialogRef = this.dialog.open(PlayerActionDialogComponent, {
      maxWidth: '600px', // Limite la largeur maximale
      width: '90%', // Adapte à l'écran
      data: { player },
    });

    dialogRef.afterClosed().subscribe((action) => {
      if (action === 'kick') {
        this.kickPlayer(player);
      } else if (action === 'delete') {
        this.deletePlayer(player);
      }
    });
  }

  kickPlayer(player: any): void {
    console.log(player);
    this.teamsService.removePlayerFromTeam(player._id, player.team).subscribe(() => {
      // this.loadTeams();
      //this.loadPlayers();
    });
    console.log(`Player ${player.username} kicked from the team.`);
  }

  deletePlayer(player: Player): void {
    this.playerService.removePlayerFromTheGame(player._id).subscribe(() => {
      // this.loadTeams();
      //this.loadPlayers();
    });

    console.log(`Player ${player.username} deleted.`);
  }
}
