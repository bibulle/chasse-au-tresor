import { Component } from '@angular/core';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCalendar } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-riddle',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './riddle.component.html',
  styleUrl: './riddle.component.scss'
})
export class RiddleComponent {
  currentRiddle = {
    gain: 20,
    text: 'What has a head and a tail but no body?',
  };

}
