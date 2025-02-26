import {Component, inject} from '@angular/core';
import {AsyncPipe, NgClass, NgFor} from '@angular/common';
import {NavigationItem} from '../../../core/navigation/navigation-item.interface';
import {MatIconModule} from "@angular/material/icon";
import {MatRippleModule} from "@angular/material/core";
import {RouterLink, RouterLinkActive} from "@angular/router";
import {stagger40ms} from "@vex/animations/stagger.animation";
import {fadeInUp400ms} from "@vex/animations/fade-in-up.animation";
import {SidenavItemComponent} from "../sidenav/sidenav-item/sidenav-item.component";
import {NavigationItemComponent} from "../navigation/navigation-item/navigation-item.component";
import {NavigationConfigStore} from "../../../core/stores/navigation-config.store";
import {MenuNavigationItemComponent} from "../navigation/menu-navigation-item/menu-navigation-item.component";

@Component({
  selector: 'navigation-menu',
  templateUrl: './navigation-menu.component.html',
  styleUrls: ['./navigation-menu.component.scss'],
  animations: [stagger40ms, fadeInUp400ms],
  standalone: true,
  imports: [NgFor, AsyncPipe, MatIconModule, MatRippleModule, RouterLinkActive, NgClass, RouterLink, SidenavItemComponent, NavigationItemComponent, MenuNavigationItemComponent]
})
export class NavigationMenuComponent {
  readonly navigationConfigStore = inject(NavigationConfigStore);
  items!: NavigationItem[];

  constructor() {

    this.items = this.navigationConfigStore.items();
  }
}
