import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DatabaseFileService {
  private readonly apiUrl = '/api/files';

  constructor(private http: HttpClient) {}

  // Importer un fichier JSON
  importFile(file: File): Observable<void> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<void>(`${this.apiUrl}/import`, formData);
  }

  // Exporter les données JSON
  exportFile(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export`, { responseType: 'blob' });
  }
}
