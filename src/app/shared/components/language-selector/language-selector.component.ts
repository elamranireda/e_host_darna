import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { LanguageService } from '@app/services/language-service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { getLanguageInfo, languageConfig } from '@app/config/language.config';

interface Language {
  code: string;
  name: string;
  flag?: string;
}

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatMenuModule, TranslateModule],
  template: `
    <button mat-icon-button [matMenuTriggerFor]="languageMenu" aria-label="Sélection de langue">
      <mat-icon svgIcon="mat:language"></mat-icon>
    </button>
    
    <mat-menu #languageMenu="matMenu" xPosition="before">
      <button 
        mat-menu-item 
        *ngFor="let lang of languages" 
        (click)="changeLanguage(lang.code)"
        [class.active]="currentLang === lang.code">
        <span>{{ lang.name }}</span>
      </button>
    </mat-menu>
  `,
  styles: [`
    .active {
      background-color: rgba(0, 0, 0, 0.04);
      font-weight: 500;
    }
  `]
})
export class LanguageSelectorComponent {
  readonly languageService = inject(LanguageService);
  readonly translateService = inject(TranslateService);
  
  languages: Language[] = languageConfig.supportedLanguages.map(lang => ({
    code: lang.code,
    name: lang.name,
    flag: lang.flag
  }));
  
  get currentLang(): string {
    return this.translateService.currentLang;
  }
  
  changeLanguage(langCode: string): void {
    this.languageService.changeLanguage(langCode);
  }
} 