import {Component, effect, inject, OnInit, OnDestroy} from '@angular/core';
import {AsyncPipe, NgClass, NgFor} from '@angular/common';
import {NavigationDropdown, NavigationItem} from '../../../core/navigation/navigation-item.interface';
import {MatIconModule} from "@angular/material/icon";
import {MatRippleModule} from "@angular/material/core";
import {NavigationEnd, Router, RouterLink, RouterLinkActive} from "@angular/router";
import {stagger40ms} from "@app/animations/stagger.animation";
import {fadeInUp400ms} from "@app/animations/fade-in-up.animation";
import {SidenavItemComponent} from "../sidenav/sidenav-item/sidenav-item.component";
import {NavigationItemComponent} from "../navigation/navigation-item/navigation-item.component";
import {NavigationConfigStore} from "../../../core/stores/navigation-config.store";
import {MenuNavigationItemComponent} from "../navigation/menu-navigation-item/menu-navigation-item.component";
import {Subject, filter, takeUntil} from "rxjs";

@Component({
  selector: 'navigation-menu',
  templateUrl: './navigation-menu.component.html',
  styleUrls: ['./navigation-menu.component.scss'],
  animations: [stagger40ms, fadeInUp400ms],
  standalone: true,
  imports: [NgFor, AsyncPipe, MatIconModule, MatRippleModule, RouterLinkActive, NgClass, RouterLink, SidenavItemComponent, NavigationItemComponent, MenuNavigationItemComponent]
})
export class NavigationMenuComponent implements OnInit, OnDestroy {
  readonly navigationConfigStore = inject(NavigationConfigStore);
  items!: NavigationItem[];
  private destroy$ = new Subject<void>();

  constructor(private router: Router) {
    // Réagir aux changements dans les items de navigation
    effect(() => {
      this.updateNavigationItems();
    });
    
    // Réagir aux changements d'URL
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.updateNavigationItems();
    });
  }

  /**
   * Met à jour les items de navigation en fonction de l'URL actuelle
   */
  private updateNavigationItems(): void {
    const currentItems = this.navigationConfigStore.items();
    
    // Chercher un dropdown dont la route correspond exactement à un segment de l'URL
    const currentUrl = this.router.url;
    const selectedMenu = currentItems.find(item => 
      item.type === 'dropdown' && 
      item.route && 
      currentUrl.includes(item.route) &&
      item.children
    ) as NavigationDropdown | undefined;
    
    this.items = selectedMenu?.children || currentItems;
  }

  ngOnInit(): void {
    // Initialisation supplémentaire si nécessaire
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
