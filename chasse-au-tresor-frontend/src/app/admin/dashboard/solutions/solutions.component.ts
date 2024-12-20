import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { Solution } from '../../../reference/types';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/admin.service';
import { MatDialog } from '@angular/material/dialog';
import { PhotoViewerComponent } from './photo-viewer/photo-viewer.component';
import { UserNotificationsService } from '../../../core/user-notifications.service';
import { RejectionReasonDialogComponent } from './rejection-reason-dialog/rejection-reason-dialog.component';

@Component({
  selector: 'app-admin-solutions',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule],
  templateUrl: './solutions.component.html',
  styleUrl: './solutions.component.scss',
})
export class SolutionsComponent implements OnChanges {
  @Input() solutions: Solution[] | undefined = [];

  @Output() actionNeeded = new EventEmitter<boolean>();
  actionNeededState: boolean = false;

  displayedColumns = ['player', 'text', 'photo', 'status'];

  isHovered = false; // Indique si la souris est sur une image
  hoveredPhoto: string | null = null; // Stocke l'URL de la photo survolée
  popupPosition = { x: 0, y: 0 }; // Position du popup

  constructor(
    private readonly adminService: AdminService,
    private readonly dialog: MatDialog,
    private readonly userNotificationsService: UserNotificationsService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['solutions']?.currentValue) {
      this.calculateIfActionNeeded();
    }
  }

  openPhotoClick(photoUrl: string) {
    this.dialog.open(PhotoViewerComponent, {
      data: { photoUrl },
      panelClass: 'custom-dialog-container',
      autoFocus: false,
    });
  }

  calculateIfActionNeeded() {
    const state = this.solutions?.some((s) => s.validated === undefined);
    this.actionNeededState = state !== undefined ? state : false;
    this.actionNeeded.emit(this.solutions?.some((s) => s.validated === undefined));
  }

  onStatusClick(solution: Solution, status: boolean, rejectionReason = '') {
    if ((solution.validated === false && status === true) || (solution.validated === true && status === false)) {
      solution.validated = undefined;
    } else {
      solution.validated = status;
    }
    solution.rejectionReason = rejectionReason;

    // Mise à jour du statut dans le backend
    this.adminService.updateSolutionStatus(solution).subscribe({
      next: () => {
        this.userNotificationsService.success(`Statut mis à jour : ${solution.validated}`);
      },
      error: (err: any) => {
        console.error('Erreur lors de la mise à jour du statut:');
        console.error(err);
        this.userNotificationsService.error('Une erreur est survenue lors de la mise à jour du statut.', err);
      },
    });
  }

  openRejectionReason(solution: any): void {
    if (solution.validated === true) {
      return this.onStatusClick(solution, false);
    }
    const dialogRef = this.dialog.open(RejectionReasonDialogComponent, {
      width: '400px',
      data: { solution },
    });

    dialogRef.afterClosed().subscribe((reason: string) => {
      if (reason) {
        // Appeler une méthode pour enregistrer le refus avec une raison
        this.rejectSolutionWithReason(solution, reason);
      }
    });
  }

  rejectSolutionWithReason(solution: any, reason: string): void {
    // Implémentez la logique pour sauvegarder la raison du refus
    console.log(`Solution refusée : ${solution._id}, Raison : ${reason}`);
    // Exemple d'appel à un service backend :
    // this.solutionService.rejectSolution(solution._id, reason).subscribe();
    this.onStatusClick(solution, false, reason);
  }
}
