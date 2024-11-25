import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { UserNotificationsService } from '../../core/user-notifications.service';
import { DatabaseFileService } from '../../core/database-file.service';
import { ImportConfirmationDialogComponent } from './import-confirmation-dialog/import-confirmation-dialog.component';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-import-export-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './import-export-dialog.component.html',
  styleUrl: './import-export-dialog.component.scss',
})
export class ImportExportDialogComponent {
  constructor(
    private dialog: MatDialog,
    private databaseFileService: DatabaseFileService,
    private userNotificationsService: UserNotificationsService,
    public dialogRef: MatDialogRef<ImportExportDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onCancel(): void {
    this.dialogRef.close(null);
  }

  // Gestion de l'importation
  async onImportFile(event: Event, fileInput: HTMLInputElement) {
    const file = (event.target as HTMLInputElement).files?.[0];

    if (!file) {
      this.userNotificationsService.error('Veuillez sélectionner un fichier.');
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
          this.userNotificationsService.info('Importation annulée.');
        }
      });
    } catch (error) {
      this.userNotificationsService.error(
        `Erreur lors de la lecture du fichier : ${error}`
      );
    } finally {
      this.dialogRef.close(null);
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
        next: () =>
          this.userNotificationsService.success(
            'Fichier importé avec succès !'
          ),
        error: () =>
          this.userNotificationsService.error(
            "Erreur lors de l'importation du fichier."
          ),
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
        this.dialogRef.close(null);
      },
      error: () => {
        this.userNotificationsService.error(
          "Erreur lors de l'exportation du fichier."
        );
        this.dialogRef.close(null);
      },
    });
  }
}
