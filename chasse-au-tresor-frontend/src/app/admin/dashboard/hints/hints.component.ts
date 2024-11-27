import { Component, Input, OnInit } from '@angular/core';
import { Hint, TeamRiddle } from '../../../reference/types';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { EditHintDialogComponent } from './edit-hint-dialog/edit-hint-dialog.component';
import { HintsService } from '../../../core/hints.service';
import { UserNotificationsService } from '../../../core/user-notifications.service';

@Component({
  selector: 'app-admin-hints',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule],
  templateUrl: './hints.component.html',
  styleUrl: './hints.component.scss',
})
export class HintsComponent implements OnInit {
  @Input() teamRiddleId: string | undefined;
  @Input() hints: Hint[] | undefined = [];

  displayedColumns = ['text', 'cost', 'order', 'status', 'edit'];

  constructor(
    private dialog: MatDialog,
    private hintsService: HintsService,
    private userNotificationsService: UserNotificationsService
  ) {}

  ngOnInit(): void {}

  onEdit(event: any, hint?: Hint) {
    event.stopPropagation();

    if (!hint) {
      hint = new Hint();
      hint.order = this.hints?.length ? this.hints?.length + 1 : 1;
    }

    const dialogRef = this.dialog.open(EditHintDialogComponent, {
      width: '600px',
      data: {
        hint: { ...hint },
        teamRiddleId: this.teamRiddleId,
      },
    });

    dialogRef.afterClosed().subscribe((result: { action: string; data: { hint: Hint; teamRiddleId: string } }) => {
      if (result && result.action === 'save') {
        // console.log(result.data);
        this.hintsService.saveHint(result.data.hint, result.data.teamRiddleId).subscribe({
          next: () => {
            this.userNotificationsService.success('Indice sauvegardé.');
          },
          error: (err: any) => {
            console.log(err);
            this.userNotificationsService.error('Erreur lors de la sauvegarde :', err);
          },
        });
      } else if (result && result.action === 'delete') {
        this.hintsService.deleteHint(result.data.hint).subscribe({
          next: () => {
            this.userNotificationsService.success('Indice supprimé.');
          },
          error: (err) => {
            console.log(err);
            this.userNotificationsService.error('Erreur lors de la suppression :', err);
          },
        });
      }
    });
  }
}
