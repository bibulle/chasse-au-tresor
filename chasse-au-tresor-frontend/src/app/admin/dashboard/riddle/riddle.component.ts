import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { TeamRiddle } from '../../../reference/types';
import { SolutionsComponent } from '../solutions/solutions.component';

@Component({
  selector: 'app-riddle',
  standalone: true,
  imports: [CommonModule, MatDividerModule, SolutionsComponent],
  templateUrl: './riddle.component.html',
  styleUrl: './riddle.component.scss'
})
export class RiddleComponent {

  @Input() teamRiddle: TeamRiddle | undefined;
}
