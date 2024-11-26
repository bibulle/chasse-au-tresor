import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-split-screen',
  standalone: true,
  imports: [],
  templateUrl: './split-screen.component.html',
  styleUrl: './split-screen.component.scss',
})
export class SplitScreenComponent implements OnInit {
  @ViewChild('leftPane', { static: true }) leftPane!: ElementRef;
  @ViewChild('rightPane', { static: true }) rightPane!: ElementRef;
  @ViewChild('resizer', { static: true }) resizer!: ElementRef;

  @Output() resized = new EventEmitter<void>();

  private isDragging = false;

  constructor() {}

  ngOnInit(): void {}

  onMouseDown(event: MouseEvent): void {
    this.isDragging = true;
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  }

  onMouseMove = (event: MouseEvent): void => {
    if (!this.isDragging) return;

    const container = this.leftPane.nativeElement.parentElement;
    const containerWidth = container.offsetWidth;
    const newLeftWidth = event.clientX - container.getBoundingClientRect().left;

    // Minimum and maximum width constraints
    const minLeftWidth = 50; // Minimum width in pixels
    const maxLeftWidth = containerWidth - 50; // Minimum width for the right pane

    if (newLeftWidth >= minLeftWidth && newLeftWidth <= maxLeftWidth) {
      const newLeftWidthPercentage = (newLeftWidth / containerWidth) * 100;
      this.leftPane.nativeElement.style.flex = `0 0 ${newLeftWidthPercentage}%`;
      this.rightPane.nativeElement.style.flex = `0 0 ${
        100 - newLeftWidthPercentage
      }%`;
    }
  };

  onMouseUp = (): void => {
    this.isDragging = false;
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);

    // Émettre un événement après le redimensionnement
    this.resized.emit();
  };
}
