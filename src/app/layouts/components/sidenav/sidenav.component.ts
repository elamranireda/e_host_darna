import {ChangeDetectionStrategy, Component, inject, Input} from '@angular/core';
import {NavigationService} from '../../../core/navigation/navigation.service';
import {AppLayoutService} from '@app/services/app-layout.service';
import {AppConfigService} from '@app/config/app-config.service';
import {map, startWith, switchMap} from 'rxjs/operators';
import {NavigationItem} from '../../../core/navigation/navigation-item.interface';
import {Observable, of} from 'rxjs';
import {SidenavUserMenuComponent} from './sidenav-user-menu/sidenav-user-menu.component';
import {MatDialog} from '@angular/material/dialog';
import {SearchModalComponent} from './search-modal/search-modal.component';
import {SidenavItemComponent} from './sidenav-item/sidenav-item.component';
import {AppScrollbarComponent} from '@app/components/app-scrollbar/app-scrollbar.component';
import {MatRippleModule} from '@angular/material/core';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {AsyncPipe, NgFor, NgIf} from '@angular/common';
import { AppPopoverService } from '@app/components/app-popover/app-popover.service';
import { NavigationLoaderService } from 'src/app/core/navigation/navigation-loader.service';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgIf,
    MatButtonModule,
    MatIconModule,
    MatRippleModule,
    AppScrollbarComponent,
    NgFor,
    SidenavItemComponent,
    AsyncPipe
  ]
})
export class SidenavComponent {
  protected navigationService = inject(NavigationLoaderService);

  @Input() collapsed: boolean = false;
  collapsedOpen$ = this.layoutService.sidenavCollapsedOpen$;
  title$ = this.configService.config$.pipe(
    map((config) => config.sidenav.title)
  );
  imageUrl$ = this.configService.config$.pipe(
    map((config) => config.sidenav.imageUrl)
  );
  showCollapsePin$ = this.configService.config$.pipe(
    map((config) => config.sidenav.showCollapsePin)
  );
  userVisible$ = this.configService.config$.pipe(
    map((config) => config.sidenav.user.visible)
  );
  searchVisible$ = this.configService.config$.pipe(
    map((config) => config.sidenav.search.visible)
  );

  userMenuOpen$: Observable<boolean> = of(false);

  constructor(
    private layoutService: AppLayoutService,
    private configService: AppConfigService,
    private readonly popoverService: AppPopoverService,
    private readonly dialog: MatDialog
  ) {
  }


  collapseOpenSidenav() {
    this.layoutService.collapseOpenSidenav();
  }

  collapseCloseSidenav() {
    this.layoutService.collapseCloseSidenav();
  }

  toggleCollapse() {
    this.collapsed
      ? this.layoutService.expandSidenav()
      : this.layoutService.collapseSidenav();
  }

  trackByRoute(index: number, item: NavigationItem): string {
    if (item.type === 'link') {
      return item.route;
    }

    return item.label;
  }

  openProfileMenu(origin: HTMLDivElement): void {
    this.userMenuOpen$ = of(
      this.popoverService.open({
        content: SidenavUserMenuComponent,
        origin,
        offsetY: -8,
        width: origin.clientWidth,
        position: [
          {
            originX: 'center',
            originY: 'top',
            overlayX: 'center',
            overlayY: 'bottom'
          }
        ]
      })
    ).pipe(
      switchMap((popoverRef) => popoverRef.afterClosed$.pipe(map(() => false))),
      startWith(true)
    );
  }

  openSearch(): void {
    this.dialog.open(SearchModalComponent, {
      panelClass: 'app-dialog-glossy',
      width: '100%',
      maxWidth: '600px'
    });
  }
}
