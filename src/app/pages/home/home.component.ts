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
import {TranslatePipe} from "@ngx-translate/core";
import {NavigationMenuComponent} from "../../layouts/components/navigation-menu/navigation-menu.component";
import {FaqComponent} from "../faq/faq.component";

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

  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe(data => {
      console.log(data);
    });
  }

  ngOnInit(): void {

  }
}
