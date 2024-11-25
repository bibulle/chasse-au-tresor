import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { RiddlesService } from '../../../core/riddles.service';
import { TeamRiddlesService } from '../../../core/team-riddles.service';
import { UserNotificationsService } from '../../../core/user-notifications.service';
import { Riddle, Team, TeamRiddle } from '../../../reference/types';
import { SolutionsComponent } from '../solutions/solutions.component';
import { EditTeamRiddleDialogComponent } from './edit-team-riddle-dialog/edit-team-riddle-dialog.component';
import { Observable } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-admin-riddle',
  standalone: true,
  imports: [
    CommonModule,
    MatDividerModule,
    MatIconModule,
    MatExpansionModule,
    MatButtonModule,
    MatTableModule,
    MatFormFieldModule,
    SolutionsComponent,
  ],
  templateUrl: './riddle.component.html',
  styleUrl: './riddle.component.scss',
})
export class RiddleComponent implements OnInit {
  updateOrder(arg0: any, arg1: any) {
    throw new Error('Method not implemented.');
  }
  @Input() teamRiddle: TeamRiddle | undefined;
  @Input() riddle: Riddle | undefined;

  teamOrder: { team: Team; order: number }[] = [];

  constructor(
    private dialog: MatDialog,
    private riddleService: RiddlesService,
    private userNotificationsService: UserNotificationsService
  ) {}

  ngOnInit(): void {
    this.loadTeamsOrder();
    if (this.teamRiddle) {
      this.riddle = this.teamRiddle.riddle;
    }
    // console.log(this.teamRiddle)
    // console.log(this.riddle)
    // console.log(this.teamOrder)
  }

  loadTeamsOrder() {
    const riddleId = this.teamRiddle
      ? this.teamRiddle.riddle?._id
      : this.riddle?._id;
    this.riddleService.getRiddleTeamOrder(riddleId).subscribe((teamOrder) => {
      this.teamOrder = teamOrder;
    });
  }

  // async getRiddleTeamOrder() : {team: Team, order: number}[]> {
  //   return this.riddleService.getRiddleTeamOrder(this.teamRiddle ? this.teamRiddle.riddle?._id : this.riddle?._id);
  // }

  actionNeeded() {
    //console.log('actionNeeded');
    if (!this.teamRiddle) {
      return false;
    }

    let ret = false;
    this.teamRiddle.solutions.forEach((sol) => {
      if (sol.validated !== true && sol.validated !== false) {
        ret = true;
      }
    });
    return ret;
  }

  onEdit(event: any) {
    event.stopPropagation();

    // console.log(this.teamRiddle);

    if (!this.teamRiddle && !this.riddle) {
      return;
    }

    const riddleToEdit = this.teamRiddle ? this.teamRiddle.riddle : this.riddle;

    const dialogRef = this.dialog.open(EditTeamRiddleDialogComponent, {
      width: '600px',
      data: {
        riddle: { ...riddleToEdit },
        teams: this.teamOrder,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.action === 'save') {
        this.riddleService.saveRiddle(result.data).subscribe({
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
      } else if (result && result.action === 'delete') {
        this.riddleService.deleteRiddle(result.data).subscribe({
          next: () => {
            this.userNotificationsService.success('Énigme supprimée.');
          },
          error: (err) => {
            console.log(err);
            this.userNotificationsService.error(
              'Erreur lors de la suppression :',
              err.message
            );
          },
        });
      }
    });
  }
}
