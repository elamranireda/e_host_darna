import {Component, effect, inject, OnInit, OnDestroy} from '@angular/core';
import {AsyncPipe, NgClass, NgFor, NgIf} from '@angular/common';
import {NavigationDropdown, NavigationItem} from '../../../core/navigation/navigation-item.interface';
import {MatIconModule} from "@angular/material/icon";
import {MatRippleModule} from "@angular/material/core";
import {NavigationEnd, Router, RouterLink, RouterLinkActive} from "@angular/router";
import {stagger40ms} from "@app/animations/stagger.animation";
import {fadeInUp400ms} from "@app/animations/fade-in-up.animation";
import {SidenavItemComponent} from "../sidenav/sidenav-item/sidenav-item.component";
import {NavigationItemComponent} from "../navigation/navigation-item/navigation-item.component";
import {NavigationService} from "../../../core/navigation/navigation.service";
import {MenuNavigationItemComponent} from "../navigation/menu-navigation-item/menu-navigation-item.component";
import {Subject, filter, takeUntil, take} from "rxjs";

@Component({
  selector: 'navigation-menu',
  templateUrl: './navigation-menu.component.html',
  styleUrls: ['./navigation-menu.component.scss'],
  animations: [stagger40ms, fadeInUp400ms],
  standalone: true,
  imports: [NgFor, AsyncPipe, MatIconModule, MatRippleModule, RouterLinkActive, NgClass, RouterLink, SidenavItemComponent, NavigationItemComponent, MenuNavigationItemComponent, NgIf]
})
export class NavigationMenuComponent implements OnInit, OnDestroy {
  protected navigationService = inject(NavigationService);
  items!: NavigationItem[];
  private destroy$ = new Subject<void>();

  constructor(private router: Router) {
    // Réagir aux changements d'URL
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      console.log('Navigation end event, updating items');
      this.updateNavigationItems();
    });
  }

  /**
   * Met à jour les items de navigation en fonction de l'URL actuelle
   */
  private updateNavigationItems(): void {
    // S'abonner à l'Observable des items de navigation
    this.navigationService.items$.pipe(
      take(1), // Prendre la dernière valeur puis se désabonner
      takeUntil(this.destroy$)
    ).subscribe(currentItems => {
      if (!currentItems || currentItems.length === 0) {
        console.warn('No navigation items available in the store');
        this.items = [];
        return;
      }
      
      // Chercher un dropdown dont la route correspond exactement à un segment de l'URL
      const currentUrl = this.router.url;
      console.log('Current URL:', currentUrl);
      
      const selectedMenu = currentItems.find(item => 
        item.type === 'dropdown' && 
        item.route && 
        currentUrl.includes(item.route) &&
        item.children
      ) as NavigationDropdown | undefined;
      
      if (selectedMenu) {
        console.log('Selected menu found:', selectedMenu.label);
        this.items = selectedMenu.children || [];
      } else {
        console.log('No selected menu found, using top-level items');
        this.items = currentItems;
      }
      
      console.log('Final navigation items:', this.items);
    });
  }

  ngOnInit(): void {
    // Forcer une mise à jour des items au démarrage
    this.updateNavigationItems();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
