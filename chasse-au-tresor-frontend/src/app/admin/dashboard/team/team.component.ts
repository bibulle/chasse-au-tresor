import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { Team, TeamRiddle } from '../../../reference/types';
import { AdminService } from '../../../core/admin.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { RiddleComponent } from '../riddle/riddle.component';
import { firstValueFrom, Subscription } from 'rxjs';
import { RiddleService } from '../../../core/riddle.service';

@Component({
  selector: 'app-admin-team',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatChipsModule,
    RiddleComponent,
  ],
  templateUrl: './team.component.html',
  styleUrl: './team.component.scss',
})
export class TeamComponent implements OnDestroy {
  @Input() team: Team | undefined;

  teamRiddles: TeamRiddle[] = [];
  teamRiddleSubscription: Subscription | undefined;

  constructor(
    private readonly adminService: AdminService,
    private readonly riddleService: RiddleService
  ) {}

  ngOnDestroy(): void {
    if (this.teamRiddleSubscription) {
      this.teamRiddleSubscription.unsubscribe();
    }
  }

  async loadRiddlesForTeam(): Promise<void> {
    if (this.team && !this.teamRiddleSubscription) {
      this.updateTeamRiddles(
        await firstValueFrom(this.riddleService.loadRiddles(this.team._id))
      );
      this.riddleService.listenForRiddlesUpdates(this.team._id);
      this.teamRiddleSubscription = this.riddleService.riddle$[
        this.team._id
      ].subscribe((teamRiddles) => {
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
  }
  updateTeamRiddle(teamRiddle: TeamRiddle) {
    const oldTR = this.teamRiddles.find((tr) => tr._id === teamRiddle._id);

    if (!oldTR) {
      this.teamRiddles.push(teamRiddle);
    } else {
      oldTR.order = teamRiddle.order;
      oldTR.resolved = teamRiddle.resolved;
      oldTR.riddle = teamRiddle.riddle;
      oldTR.solutions = teamRiddle.solutions;
      oldTR.team = teamRiddle.team;
    }
  }
}
