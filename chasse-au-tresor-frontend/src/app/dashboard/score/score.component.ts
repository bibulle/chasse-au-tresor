import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-score',
  standalone: true,
  imports: [],
  templateUrl: './score.component.html',
  styleUrl: './score.component.scss',
  animations: [
    trigger('scoreChange', [
      state('default', style({ transform: 'scale(1)', opacity: 1 })),
      state('changed', style({ transform: 'scale(1.8)', opacity: 0.8 })),
      transition('default => changed', [animate('200ms ease-out')]),
      transition('changed => default', [animate('200ms ease-in')]),
    ]),
  ],
})
export class ScoreComponent implements OnChanges {
  @Input() score: number | undefined = 0;
  animationState: 'default' | 'changed' = 'default';

  ngOnChanges(changes: SimpleChanges) {
    if (changes['score']) {
      // Change l'état de l'animation pour déclencher l'effet
      this.animationState = 'changed';

      // Remet l'état à 'default' après un court délai
      setTimeout(() => {
        this.animationState = 'default';
      }, 200); // Durée totale de l'animation
    }
  }
}
