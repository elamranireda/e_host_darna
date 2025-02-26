import {Component, effect, inject, OnInit} from '@angular/core';
import {AsyncPipe, NgClass, NgFor} from '@angular/common';
import {NavigationDropdown, NavigationItem} from '../../../core/navigation/navigation-item.interface';
import {MatIconModule} from "@angular/material/icon";
import {MatRippleModule} from "@angular/material/core";
import {Router, RouterLink, RouterLinkActive} from "@angular/router";
import {stagger40ms} from "@vex/animations/stagger.animation";
import {fadeInUp400ms} from "@vex/animations/fade-in-up.animation";
import {SidenavItemComponent} from "../sidenav/sidenav-item/sidenav-item.component";
import {NavigationItemComponent} from "../navigation/navigation-item/navigation-item.component";
import {NavigationConfigStore} from "../../../core/stores/navigation-config.store";
import {MenuNavigationItemComponent} from "../navigation/menu-navigation-item/menu-navigation-item.component";
import {find} from "rxjs";

@Component({
  selector: 'navigation-menu',
  templateUrl: './navigation-menu.component.html',
  styleUrls: ['./navigation-menu.component.scss'],
  animations: [stagger40ms, fadeInUp400ms],
  standalone: true,
  imports: [NgFor, AsyncPipe, MatIconModule, MatRippleModule, RouterLinkActive, NgClass, RouterLink, SidenavItemComponent, NavigationItemComponent, MenuNavigationItemComponent]
})
export class NavigationMenuComponent implements  OnInit {
  readonly navigationConfigStore = inject(NavigationConfigStore);
  items!: NavigationItem[];

  constructor(private router: Router) {
    effect(() => {
      const selectedMenu = this.navigationConfigStore.items().find(item => item.type === 'dropdown' && this.router.url.includes(item.route ?? 'unknown')  && item.children) as NavigationDropdown;
      console.log(selectedMenu)
      this.items = selectedMenu ? selectedMenu?.children || [] : this.navigationConfigStore.items();
    })
  }

  ngOnInit(): void {


    }
}
