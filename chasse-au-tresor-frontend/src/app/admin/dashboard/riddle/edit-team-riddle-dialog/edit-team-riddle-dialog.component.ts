import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DeleteConfirmDialogComponent } from '../../team/player-action-dialog/delete-confirm-dialog/delete-confirm-dialog.component';

@Component({
  selector: 'app-edit-team-riddle-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    FormsModule,
    MatDialogModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './edit-team-riddle-dialog.component.html',
  styleUrl: './edit-team-riddle-dialog.component.scss',
})
export class EditTeamRiddleDialogComponent implements OnInit {
  photoPreview: string | ArrayBuffer | null = null;

  constructor(
    public dialogRef: MatDialogRef<EditTeamRiddleDialogComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (this.data.riddle.photo) {
      this.photoPreview = '/api/files' + this.data.riddle.photo;
    }
  }

  ngOnInit(): void {
    // Initialiser les valeurs par défaut
    if (!this.data.riddle.gain) {
      this.data.riddle.gain = 0;
    }
    if (!this.data.riddle.text) {
      this.data.riddle.text = ''; // Texte vide pour forcer l'utilisateur à le remplir
    }

    // console.log(this.data);
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onSave(): void {
    this.dialogRef.close({ action:'save', data: this.data}); // Retourne les modifications
  }

  onFileSelected(event: any): void {
    this.data.selectedFile = event.target.files[0];
    if (this.data.selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        // console.log(reader.result);
        this.photoPreview = reader.result; // Prévisualisation de l'image
      };
      reader.readAsDataURL(this.data.selectedFile); // Convertit le fichier en DataURL pour affichage
    }
    event.target.value = '';
  }

  removePhoto(): void {
    this.data.selectedFile = null;
    this.data.riddle.photo = null;
    this.photoPreview = null;
  }

  onDelete(): void {
    const confirmDialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
      width: '300px' // Ajustez si nécessaire
    });
  
    confirmDialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Confirme la suppression
        this.dialogRef.close({ action:'delete', data: this.data}); // Notifie le composant parent
      }
    });
    }

}
