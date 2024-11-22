import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-photo-viewer',
  standalone: true,
  imports: [],
  templateUrl: './photo-viewer.component.html',
  styleUrl: './photo-viewer.component.scss'
})
export class PhotoViewerComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { photoUrl: string }) {}
}
