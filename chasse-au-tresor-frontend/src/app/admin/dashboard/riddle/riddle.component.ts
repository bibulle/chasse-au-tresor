import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { TeamRiddle } from '../../../reference/types';
import { SolutionsComponent } from '../solutions/solutions.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-riddle',
  standalone: true,
  imports: [
    CommonModule,
    MatDividerModule,
    MatIconModule,
    MatExpansionModule,
    SolutionsComponent,
  ],
  templateUrl: './riddle.component.html',
  styleUrl: './riddle.component.scss',
})
export class RiddleComponent {
  @Input() teamRiddle: TeamRiddle | undefined;

  actionNeeded() {
    console.log('actionNeeded');
    if (!this.teamRiddle) {
      return false;
    }

    let ret = false;
    this.teamRiddle.solutions.forEach((sol) => {
      if (sol.validated !== true && sol.validated !== false) {
        ret = true;
      }
    });
    return ret;
  }
}
