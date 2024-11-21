import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DatabaseFileService } from '../../core/database-file.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { ImportConfirmationDialogComponent } from './import-confirmation-dialog/import-confirmation-dialog.component';

@Component({
  selector: 'app-database-file-manager',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatInputModule, MatCardModule],
  templateUrl: './database-file-manager.component.html',
  styleUrl: './database-file-manager.component.scss',
})
export class DatabaseFileManagerComponent {
  constructor(
    private dialog: MatDialog,
    private databaseFileService: DatabaseFileService
  ) {}

  // Gestion de l'importation
  async onImportFile(event: Event, fileInput: HTMLInputElement) {
    const file = (event.target as HTMLInputElement).files?.[0];

    if (!file) {
      alert('Veuillez sélectionner un fichier.');
      return;
    }

    try {
      // Lire le fichier comme texte
      const fileContent = await file.text();
      const jsonData = JSON.parse(fileContent);

      // Ouvrir une popup pour confirmation
      const dialogRef = this.dialog.open(ImportConfirmationDialogComponent, {
        width: '600px',
        data: jsonData,
      });

      // Attendre la réponse de l'utilisateur
      dialogRef.afterClosed().subscribe((confirmed) => {
        if (confirmed) {
          this.uploadFile(jsonData);
        } else {
          alert('Importation annulée.');
        }
      });
    } catch (error) {
      alert(`Erreur lors de la lecture du fichier : ${error}`);
    } finally {
      // Réinitialiser la valeur du champ input pour permettre de ré-sélectionner le même fichier
      fileInput.value = '';
    }
  }

  private uploadFile(data: any) {
    const cleanedBlob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const formData = new FormData();
    formData.append(
      'file',
      new File([cleanedBlob], 'cleaned-data.json', { type: 'application/json' })
    );

    this.databaseFileService
      .importFile(new File([cleanedBlob], 'cleaned-data.json'))
      .subscribe({
        next: () => alert('Fichier importé avec succès !'),
        error: () => alert("Erreur lors de l'importation du fichier."),
      });
  }

  // Gestion de l'exportation
  onExportFile() {
    this.databaseFileService.exportFile().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'treasure_hunt_data.json';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => alert("Erreur lors de l'exportation du fichier."),
    });
  }
}
