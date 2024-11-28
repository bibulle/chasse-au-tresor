import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MapService } from '../../../core/map.service';
import { RiddlesService } from '../../../core/riddles.service';
import { UserNotificationsService } from '../../../core/user-notifications.service';
import { Riddle, Team, TeamRiddle } from '../../../reference/types';
import { SolutionsComponent } from '../solutions/solutions.component';
import { EditTeamRiddleDialogComponent } from './edit-team-riddle-dialog/edit-team-riddle-dialog.component';
import { HintsComponent } from '../hints/hints.component';

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
    MatExpansionModule,
    SolutionsComponent,
    HintsComponent,
  ],
  templateUrl: './riddle.component.html',
  styleUrl: './riddle.component.scss',
})
export class RiddleComponent implements OnInit, OnChanges {
  updateOrder(arg0: any, arg1: any) {
    throw new Error('Method not implemented.');
  }
  @Input() teamRiddle: TeamRiddle | undefined;
  @Input() riddle: Riddle | undefined;

  @Output() actionNeeded = new EventEmitter<boolean>();
  actionNeededState = false;

  teamOrder: { team: Team; order: number }[] = [];

  constructor(
    private dialog: MatDialog,
    private riddleService: RiddlesService,
    private mapService: MapService,
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

  ngOnChanges(changes: SimpleChanges): void {
    // console.log(changes);
    if (changes['riddle'] && changes['riddle'].currentValue) {
      const riddle: Riddle = changes['riddle'].currentValue;
      this.mapService.updateMarkerRiddles([riddle], false);
    }
    // if (changes['teamRiddle'] && changes['teamRiddle'].currentValue) {
    //   const teamRiddle: TeamRiddle = changes['teamRiddle'].currentValue;
    //   if (teamRiddle.riddle) {
    //     this.mapService.updateMarkerRiddles([teamRiddle.riddle], false, teamRiddle.team?.color);
    //   }
    // }
  }

  actionNeededStateChange(state: boolean) {
    console.log(`actionNeededStateChange(${state})`);
    this.actionNeededState = state;
    this.actionNeeded.emit(state);
  }

  loadTeamsOrder() {
    const riddleId = this.teamRiddle ? this.teamRiddle.riddle?._id : this.riddle?._id;
    this.riddleService.getRiddleTeamOrder(riddleId).subscribe((teamOrder) => {
      this.teamOrder = teamOrder;
    });
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
            this.userNotificationsService.error('Erreur lors de la sauvegarde :', err.message);
          },
        });
      } else if (result && result.action === 'delete') {
        this.riddleService.deleteRiddle(result.data).subscribe({
          next: () => {
            this.userNotificationsService.success('Énigme supprimée.');
          },
          error: (err) => {
            console.log(err);
            this.userNotificationsService.error('Erreur lors de la suppression :', err.message);
          },
        });
      }
    });
  }
}
