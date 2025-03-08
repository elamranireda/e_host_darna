import { Component } from '@angular/core';
import { AppLayoutService } from '@app/services/app-layout.service';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RouterOutlet } from '@angular/router';
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
export class LayoutComponent {
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

  onSidenavClosed(): void {
    this.layoutService.closeSidenav();
  }

  onQuickpanelClosed(): void {
    this.layoutService.closeQuickpanel();
  }
}
