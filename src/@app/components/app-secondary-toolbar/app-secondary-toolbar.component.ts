import { Component, Input, inject } from '@angular/core';
import { AppConfigService } from '../../config/app-config.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AsyncPipe, NgClass, NgIf, Location } from '@angular/common';
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { ToolbarService } from '../../../app/core/services/toolbar.service';
import { LanguageSelectorComponent } from '../../../app/shared/components/language-selector/language-selector.component';

@Component({
  selector: 'app-secondary-toolbar',
  template: `
    <div class="secondary-toolbar-placeholder">&nbsp;</div>

    <div
      [ngClass]="{ fixed: fixed$ | async, 'w-full': !(fixed$ | async) }"
      class="secondary-toolbar py-1 z-40 border-t flex">

      <div
        class="px-6 flex items-center flex-auto"
        [class.container]="isVerticalLayout$ | async">
        <button mat-icon-button (click)="goBack()" color="primary">
          <mat-icon class="icon-lg m-0 ltr:pr-3 rtl:pl-3 ltr:border-r rtl:border-l ltr:mr-3 rtl:ml-3 flex-none" svgIcon="mat:keyboard_arrow_left"></mat-icon>
        </button>
        <h1
          class="subheading-2 font-medium m-0 ltr:pr-3 rtl:pl-3 ltr:border-r rtl:border-l ltr:mr-3 rtl:ml-3 flex-none">
          {{ getTitle() }}
        </h1>

        <ng-content></ng-content>
      </div>
    </div>
  `,
  styleUrls: ['./app-secondary-toolbar.component.scss'],
  standalone: true,
  imports: [NgClass, NgIf, AsyncPipe, MatIconModule, MatButtonModule, LanguageSelectorComponent]
})
export class AppSecondaryToolbarComponent {
  @Input() current?: string;

  fixed$ = this.configService.config$.pipe(
    map((config) => config.toolbar.fixed)
  );
  
  // Injection du service ToolbarService
  readonly toolbarService = inject(ToolbarService);
  
  /**
   * Récupère le titre avec gestion des cas vides
   */
  getTitle(): string {
    // Utiliser le titre fourni en input ou sinon celui du service
    const title = this.current || this.toolbarService.currentTitle();
    
    // S'assurer que la valeur n'est pas vide
    if (!title) {
      return 'E-Host Darna'; // Titre par défaut
    }
    
    return title;
  }
  
  goBack(): void {
    // Utilise l'historique du navigateur pour revenir à la page précédente
    this.location.back();
  }
  
  isVerticalLayout$: Observable<boolean> = this.configService
    .select((config) => config.layout)
    .pipe(map((layout) => layout === 'vertical'));

  constructor(private readonly configService: AppConfigService, private location: Location) {}
}
