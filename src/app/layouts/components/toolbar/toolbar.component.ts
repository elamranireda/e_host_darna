import {Component, DestroyRef, ElementRef, HostBinding, inject, OnInit} from '@angular/core';
import {AppLayoutService} from '@app/services/app-layout.service';

import {filter, map, startWith, switchMap} from 'rxjs/operators';
import {NavigationService} from '../../../core/navigation/navigation.service';
import {AppPopoverService} from '@app/components/app-popover/app-popover.service';
import {MegaMenuComponent} from './mega-menu/mega-menu.component';
import {Observable, of} from 'rxjs';
import {NavigationComponent} from '../navigation/navigation.component';
import {ToolbarUserComponent} from './toolbar-user/toolbar-user.component';
import {ToolbarNotificationsComponent} from './toolbar-notifications/toolbar-notifications.component';
import {NavigationItemComponent} from '../navigation/navigation-item/navigation-item.component';
import {MatMenuModule} from '@angular/material/menu';
import {NavigationEnd, Router, RouterLink} from '@angular/router';
import {AsyncPipe, NgClass, NgFor, NgIf} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {NavigationItem} from '../../../core/navigation/navigation-item.interface';
import {checkRouterChildsData} from '@app/utils/check-router-childs-data';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {TranslatePipe} from "@ngx-translate/core";
import {LanguageService} from "@app/services/language-service";
import { AppConfigService } from '@app/config/app-config.service';
import { NavigationLoaderService } from 'src/app/core/navigation/navigation-loader.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    NgIf,
    RouterLink,
    MatMenuModule,
    NgClass,
    NgFor,
    NavigationItemComponent,
    ToolbarNotificationsComponent,
    ToolbarUserComponent,
    NavigationComponent,
    AsyncPipe,
    TranslatePipe
  ]
})
export class ToolbarComponent implements OnInit {
  @HostBinding('class.shadow-b')
  showShadow: boolean = false;

  navigationItems$: Observable<NavigationItem[]> =
    this.navigationService.items$;

  isHorizontalLayout$: Observable<boolean> = this.configService.config$.pipe(
    map((config) => config.layout === 'horizontal')
  );
  isVerticalLayout$: Observable<boolean> = this.configService.config$.pipe(
    map((config) => config.layout === 'vertical')
  );
  isNavbarInToolbar$: Observable<boolean> = this.configService.config$.pipe(
    map((config) => config.navbar.position === 'in-toolbar')
  );
  isNavbarBelowToolbar$: Observable<boolean> = this.configService.config$.pipe(
    map((config) => config.navbar.position === 'below-toolbar')
  );
  userVisible$: Observable<boolean> = this.configService.config$.pipe(
    map((config) => config.toolbar.user.visible)
  );
  title$: Observable<string> = this.configService.select(
    (config) => config.sidenav.title
  );

  isDesktop$: Observable<boolean> = this.layoutService.isDesktop$;
  megaMenuOpen$: Observable<boolean> = of(false);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  constructor(
    private readonly layoutService: AppLayoutService,
    private readonly configService: AppConfigService,
    private readonly navigationService: NavigationLoaderService,
    private readonly popoverService: AppPopoverService,
    private readonly router: Router,
    private languageService: LanguageService
  ) {
  }

  changeLanguage(lang: string) {
    this.languageService.changeLanguage(lang);
  }

  getCurrentLanguageInfo(): string {
    return this.languageService.getCurrentLanguageInfo()
  }

  getSupportedLanguages(): string[] {
    return this.languageService.getSupportedLanguages().filter(lang => lang !== this.getCurrentLanguageInfo());
  }

  ngOnInit() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        startWith(null),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.showShadow = checkRouterChildsData(
          this.router.routerState.root.snapshot,
          (data) => data.toolbarShadowEnabled ?? false
        );
      });
  }

  openQuickpanel(): void {
    this.layoutService.openQuickpanel();
  }

  openSidenav(): void {
    this.layoutService.openSidenav();
  }

  openMegaMenu(origin: ElementRef | HTMLElement): void {
    this.megaMenuOpen$ = of(
      this.popoverService.open({
        content: MegaMenuComponent,
        origin,
        offsetY: 12,
        position: [
          {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'top'
          },
          {
            originX: 'end',
            originY: 'bottom',
            overlayX: 'end',
            overlayY: 'top'
          }
        ]
      })
    ).pipe(
      switchMap((popoverRef) => popoverRef.afterClosed$.pipe(map(() => false))),
      startWith(true)
    );
  }

  openSearch(): void {
    this.layoutService.openSearch();
  }
}
