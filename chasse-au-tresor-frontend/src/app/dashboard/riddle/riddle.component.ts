import { Component, Input } from '@angular/core';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCalendar } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { Riddle } from '../../reference/types';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-riddle',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './riddle.component.html',
  styleUrl: './riddle.component.scss'
})
export class RiddleComponent {

  @Input() riddle:Riddle | undefined;

}
