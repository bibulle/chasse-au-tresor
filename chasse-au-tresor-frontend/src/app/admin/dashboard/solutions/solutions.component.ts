import { Component, Input } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { Solution } from '../../../reference/types';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/admin.service';
import { MatDialog } from '@angular/material/dialog';
import { PhotoViewerComponent } from './photo-viewer/photo-viewer.component';

@Component({
  selector: 'app-admin-solutions',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule],
  templateUrl: './solutions.component.html',
  styleUrl: './solutions.component.scss',
})
export class SolutionsComponent {
  @Input() solutions: Solution[] | undefined = [];

  displayedColumns = ['player', 'text', 'photo', 'status'];

  isHovered = false; // Indique si la souris est sur une image
  hoveredPhoto: string | null = null; // Stocke l'URL de la photo survolée
  popupPosition = { x: 0, y: 0 }; // Position du popup

  constructor(private readonly adminService: AdminService, private readonly dialog: MatDialog) {};

  openPhotoClick(photoUrl: string) {
    this.dialog.open(PhotoViewerComponent, {
      data: { photoUrl },
      panelClass: 'custom-dialog-container', 
      autoFocus: false 
      });
  }

  onStatusClick(solution: Solution, status: boolean) {

    if ((solution.validated === false && status === true) ||  (solution.validated === true && status === false)) {
      solution.validated = undefined;
    } else {
      solution.validated = status;
    }
   
    // Mise à jour du statut dans le backend
    this.adminService.updateSolutionStatus(solution).subscribe({
      next: () => {
        console.log(`Statut mis à jour : ${solution.validated}`);
      },
      error: (err: any) => {
        console.error('Erreur lors de la mise à jour du statut:', err);
        alert('Une erreur est survenue lors de la mise à jour du statut.');
      },
    });
    }
    
}
