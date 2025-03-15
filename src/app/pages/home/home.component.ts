import {ChangeDetectionStrategy, Component, inject, OnInit} from '@angular/core';

import {ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {CommonModule, NgFor} from '@angular/common';
import {MatTabsModule} from '@angular/material/tabs';

import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {SidenavItemComponent} from "../../layouts/components/sidenav/sidenav-item/sidenav-item.component";
import {PropertyStore} from "../../core/property/property.store";
import {AppSecondaryToolbarComponent} from "@app/components/app-secondary-toolbar/app-secondary-toolbar.component";
import {AppBreadcrumbsComponent} from "@app/components/app-breadcrumbs/app-breadcrumbs.component";
import {MatExpansionModule} from "@angular/material/expansion";
import {scaleIn400ms} from "@app/animations/scale-in.animation";
import {fadeInRight400ms} from "@app/animations/fade-in-right.animation";
import {stagger40ms} from "@app/animations/stagger.animation";
import {fadeInUp400ms} from "@app/animations/fade-in-up.animation";
import {scaleFadeIn400ms} from "@app/animations/scale-fade-in.animation";
import {DefaultImageDirective} from "@app/directives/default-image.directive";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {NavigationMenuComponent} from "../../layouts/components/navigation-menu/navigation-menu.component";
import {FaqComponent} from "../faq/faq.component";
import {NavigationConfigStore} from "../../core/stores/navigation-config.store";
import {LanguageService} from "@app/services/language-service";
import {ToolbarService} from "../../core/services/toolbar.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [scaleIn400ms,
    fadeInRight400ms,
    stagger40ms,
    fadeInUp400ms,
    scaleFadeIn400ms],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatTabsModule, NgFor, RouterLinkActive, RouterLink, RouterOutlet, CommonModule, MatIconModule, MatButtonModule, SidenavItemComponent, DefaultImageDirective, AppSecondaryToolbarComponent, AppBreadcrumbsComponent, MatExpansionModule, TranslatePipe, NavigationMenuComponent, FaqComponent]
})
export class HomeComponent implements OnInit {
  readonly propertyStrore = inject(PropertyStore);
  readonly navigationConfigStore = inject(NavigationConfigStore);
  readonly languageService = inject(LanguageService);
  readonly toolbarService = inject(ToolbarService);
  readonly translateService = inject(TranslateService);
  propertyId: string = '';

  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe(data => {
      console.log('Route data:', data);
    });
    
    // Récupérer l'ID de la propriété depuis les paramètres de la route
    this.route.paramMap.subscribe(params => {
      this.propertyId = params.get('id') || '';
      console.log('Property ID from route:', this.propertyId);
      
      // S'assurer que les données de navigation sont chargées
      if (this.propertyId && this.navigationConfigStore.items().length === 0) {
        console.log('Forcing navigation config loading...');
        this.loadNavigationConfig();
      }
    });
  }

  /**
   * Charge explicitement la configuration de navigation
   */
  loadNavigationConfig(): void {
    // S'assurer que les données de navigation sont chargées
    if (this.propertyId) {
      this.navigationConfigStore.getNavigationConfigFromApi({
        path: this.propertyId,
        lang: this.languageService.getCurrentLanguageInfo(),
        propertyId: this.propertyId
      });
    }
  }

  ngOnInit(): void {
    console.log('Home component initialized');
    // Définir le titre et les fils d'Ariane pour la page d'accueil
    const welcomeText = this.translateService.instant('WELCOME');
    this.toolbarService.updateToolbar(welcomeText, [welcomeText]);
  }
}
