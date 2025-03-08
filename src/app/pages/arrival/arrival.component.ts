import {Component} from '@angular/core';
import {scaleIn400ms} from '@app/animations/scale-in.animation';
import {fadeInRight400ms} from '@app/animations/fade-in-right.animation';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {CommonModule, NgFor} from '@angular/common';
import {MatTabsModule} from '@angular/material/tabs';

import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";

import {NavigationMenuComponent} from "../../layouts/components/navigation-menu/navigation-menu.component";

import { AppBreadcrumbsComponent } from '@app/components/app-breadcrumbs/app-breadcrumbs.component';
import { AppSecondaryToolbarComponent } from '@app/components/app-secondary-toolbar/app-secondary-toolbar.component';

@Component({
  selector: 'ehost-home',
  templateUrl: './arrival.component.html',
  styleUrls: ['./arrival.component.scss'],
  animations: [scaleIn400ms, fadeInRight400ms],
  standalone: true,
  imports: [MatTabsModule, NgFor, RouterLinkActive, RouterLink, RouterOutlet, CommonModule, AppSecondaryToolbarComponent, AppBreadcrumbsComponent, MatIconModule, MatButtonModule, NavigationMenuComponent]
})
export class ArrivalComponent {
  constructor() {
  }
}
