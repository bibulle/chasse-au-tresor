import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class SolutionsService {
  constructor(private http: HttpClient) {}

  submitSolution(playerId: string, riddleId: string, text: string, photo: File) {
    const formData = new FormData();
    formData.append('playerId', playerId);
    formData.append('riddleId', riddleId);
    formData.append('text', text);
    formData.append('photo', photo);

    return this.http.post('/api/solutions/submit', formData);
  }
}
