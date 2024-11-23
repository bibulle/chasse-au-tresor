import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval, Observable, switchMap } from 'rxjs';
import { Version } from '../reference/types';

@Injectable({
  providedIn: 'root',
})
export class VersionService {
  private versionUrl = 'assets/version.json'; // Chemin vers le fichier
  private currentVersion: string | null = null;

  constructor(private http: HttpClient) {}

  getVersion(): Observable<Version> {
    const url = `${this.versionUrl}?t=${new Date().getTime()}`;
    return this.http.get<Version>(url);
  }

  // Vérifie la version périodiquement
  checkVersion(): void {
    // Vérifie toutes les 30 secondes (modifiable selon tes besoins)
    interval(30000)
      .pipe(switchMap(() => this.getVersion()))
      .subscribe((version) => {
        if (this.currentVersion && version.version !== this.currentVersion) {
          this.promptReload();
        }
        this.currentVersion = version.version;
      });
  }

  // Affiche un message et recharge la page
  private promptReload(): void {
    // if (confirm('Une nouvelle version est disponible. Recharger la page ?')) {
    window.location.reload();
    // }
  }
}
