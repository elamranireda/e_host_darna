import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-error-message',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, TranslateModule],
  templateUrl: './error-message.component.html',
  styleUrl: './error-message.component.scss'
})
export class ErrorMessageComponent {
  // Paramètre d'entrée pour le code d'erreur avec 500 comme valeur par défaut
  @Input() errorCode: string | number = 500;
  @Input({required: false}) icon?: string;
  
  // Émetteur pour l'événement de réessai
  @Output() retry = new EventEmitter<void>();

  // Méthode appelée lorsque le bouton de réessai est cliqué
  onRetry(): void {
    this.retry.emit();
  }
}
