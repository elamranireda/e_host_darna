import { ChangeDetectionStrategy, Component, Input, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface AccessCode {
  code: string;
  expiresAt?: string;
}

@Component({
  selector: 'app-access-code',
  templateUrl: './access-code.component.html',
  styleUrls: ['./access-code.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    TranslateModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccessCodeComponent {
  /**
   * Code d'accès et sa date d'expiration
   */
  @Input() codeAccess!: AccessCode;

  /**
   * État de visibilité du code
   */
  visible = false;

  /**
   * Type d'input (password/text) pour l'affichage du code
   */
  inputType = 'password';

  constructor(
    private clipboard: Clipboard,
    private snackBar: MatSnackBar,
    private cd: ChangeDetectorRef
  ) {}

  /**
   * Copie le code dans le presse-papiers
   */
  copyToClipboard(text: string | undefined): void {
    if (!text) return;
    
    this.clipboard.copy(text);
    this.snackBar.open('Code copié dans le presse-papiers', 'Fermer', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  /**
   * Bascule la visibilité du code
   */
  togglePassword(): void {
    this.visible = !this.visible;
    this.inputType = this.visible ? 'text' : 'password';
    
    // Auto-masquage après 10 secondes pour la sécurité
    if (this.visible) {
      setTimeout(() => {
        this.visible = false;
        this.inputType = 'password';
        this.cd.markForCheck();
      }, 10000);
    }
    
    this.cd.markForCheck();
  }

  /**
   * Formate la date d'expiration
   */
  formatExpiryDate(dateStr: string | undefined): string {
    if (!dateStr) return '';
    
    const date = new Date(dateStr);
    return date.toLocaleString('default', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
} 