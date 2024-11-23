import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { Team, TeamRiddle } from '../../../reference/types';
import { AdminService } from '../../../core/admin.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { RiddleComponent } from '../riddle/riddle.component';

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
export class TeamComponent {
  @Input() team: Team | undefined;

  riddles: TeamRiddle[] | undefined;

  constructor(private readonly adminService: AdminService) {}

  loadRiddlesForTeam(): void {

    if (this.team && !this.riddles) {
      this.adminService.getRiddlesByTeam(this.team._id).subscribe({
        next: (teamRiddles) => (this.riddles = teamRiddles),
        error: (err: any) =>
          console.error('Erreur lors du chargement des énigmes :', err),
      });
    }
  }
}
