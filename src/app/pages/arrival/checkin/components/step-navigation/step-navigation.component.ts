import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-step-navigation',
  templateUrl: './step-navigation.component.html',
  styleUrls: ['./step-navigation.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepNavigationComponent {
  /**
   * Index de l'étape actuelle
   */
  @Input() currentIndex: number = 0;

  /**
   * Nombre total d'étapes
   */
  @Input() totalSteps: number = 1;

  /**
   * Indique si c'est la dernière étape
   */
  @Input() isLastStep: boolean = false;

  /**
   * Événement émis lors de la navigation
   */
  @Output() navigate = new EventEmitter<'prev' | 'next'>();

  /**
   * Événement émis lors de la complétion
   */
  @Output() complete = new EventEmitter<void>();

  /**
   * Vérifie si la navigation vers l'étape précédente est possible
   */
  get canNavigatePrevious(): boolean {
    return this.currentIndex > 0;
  }

  /**
   * Vérifie si la navigation vers l'étape suivante est possible
   */
  get canNavigateNext(): boolean {
    return !this.isLastStep && this.currentIndex < this.totalSteps - 1;
  }

  /**
   * Gère la navigation vers l'étape précédente
   */
  onPrevious(): void {
    if (this.canNavigatePrevious) {
      this.navigate.emit('prev');
    }
  }

  /**
   * Gère la navigation vers l'étape suivante
   */
  onNext(): void {
    if (this.canNavigateNext) {
      this.navigate.emit('next');
    }
  }

  /**
   * Gère la complétion du processus
   */
  onComplete(): void {
    this.complete.emit();
  }
} 