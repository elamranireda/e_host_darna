import { Component, OnInit, inject } from '@angular/core';
import { AppLayoutService } from '@app/services/app-layout.service';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { AppConfigService } from '@app/config/app-config.service';
import { AppSidebarComponent } from '@app/components/app-sidebar/app-sidebar.component';

import { AsyncPipe, NgIf, NgTemplateOutlet } from '@angular/common';
import { SidenavComponent } from '../components/sidenav/sidenav.component';
import { ToolbarComponent } from '../components/toolbar/toolbar.component';
import { FooterComponent } from '../components/footer/footer.component';
import { QuickpanelComponent } from '../components/quickpanel/quickpanel.component';
import { ConfigPanelToggleComponent } from '../components/config-panel/config-panel-toggle/config-panel-toggle.component';
import { ConfigPanelComponent } from '../components/config-panel/config-panel.component';
import { MatDialogModule } from '@angular/material/dialog';
import { BaseLayoutComponent } from '../base-layout/base-layout.component';
import { MatDrawerMode, MatSidenavModule } from '@angular/material/sidenav';
import { SearchComponent } from '../components/toolbar/search/search.component';
import { AppProgressBarComponent } from '@app/components/app-progress-bar/app-progress-bar.component';
import { AppConfig } from '@app/config/app-config.interface';
import { LanguageService } from '@app/services/language-service';
import { filter } from 'rxjs/operators';
import { isLanguageSupported } from '@app/config/language.config';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  imports: [
    BaseLayoutComponent,
    NgIf,
    AsyncPipe,
    SidenavComponent,
    ToolbarComponent,
    FooterComponent,
    QuickpanelComponent,
    ConfigPanelToggleComponent,
    AppSidebarComponent,
    ConfigPanelComponent,
    MatDialogModule,
    MatSidenavModule,
    NgTemplateOutlet,
    RouterOutlet,
    SearchComponent,
    AppProgressBarComponent
  ],
  standalone: true
})
export class LayoutComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly languageService = inject(LanguageService);

  // Stockage de l'ID pour réutilisation
  private propertyId: string | null = null;

  config$: Observable<AppConfig> = this.configService.config$;
  sidenavCollapsed$: Observable<boolean> = this.layoutService.sidenavCollapsed$;
  sidenavDisableClose$: Observable<boolean> = this.layoutService.isDesktop$;
  sidenavFixedInViewport$: Observable<boolean> =
    this.layoutService.isDesktop$.pipe(map((isDesktop) => !isDesktop));
  sidenavMode$: Observable<MatDrawerMode> = combineLatest([
    this.layoutService.isDesktop$,
    this.configService.select((config) => config.layout)
  ]).pipe(
    map(([isDesktop, layout]) =>
      !isDesktop || layout === 'vertical' ? 'over' : 'side'
    )
  );
  sidenavOpen$: Observable<boolean> = this.layoutService.sidenavOpen$;
  configPanelOpen$: Observable<boolean> = this.layoutService.configPanelOpen$;
  quickpanelOpen$: Observable<boolean> = this.layoutService.quickpanelOpen$;

  constructor(
    private readonly layoutService: AppLayoutService,
    private readonly configService: AppConfigService
  ) {}

  ngOnInit(): void {
    // Récupérer l'ID de la propriété et le stocker
    this.route.parent?.paramMap.subscribe(params => {
      this.propertyId = params.get('id');
    });
    
    // Détecter le paramètre de langue dans l'URL et mettre à jour la langue si nécessaire
    this.route.paramMap.subscribe(params => {
      const lang = params.get('lang');
      if (lang && isLanguageSupported(lang)) {
        this.languageService.changeLanguage(lang, false);
      }
    });

    // S'assurer que les liens de navigation utilisent le préfixe de langue actuel
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // Ce code peut être utilisé pour adapter les liens de navigation si nécessaire
      // Par exemple, mettre à jour les liens dans un service de navigation
    });
  }

  onSidenavClosed(): void {
    this.layoutService.closeSidenav();
  }

  onQuickpanelClosed(): void {
    this.layoutService.closeQuickpanel();
  }

  /**
   * Utilitaire pour construire des URL avec la structure id/lang
   * @param path Chemin à ajouter après id/lang
   * @returns URL complète avec id/lang/path
   */
  buildUrl(path: string = ''): string {
    const currentLang = this.languageService.getCurrentLanguageInfo();
    const baseUrl = `/${this.propertyId}/${currentLang}`;
    return path ? `${baseUrl}/${path}` : baseUrl;
  }
}
