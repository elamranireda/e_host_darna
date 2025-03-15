import {Component, OnInit, inject} from '@angular/core';
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
import { ToolbarService } from '../../core/services/toolbar.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ehost-home',
  templateUrl: './arrival.component.html',
  styleUrls: ['./arrival.component.scss'],
  animations: [scaleIn400ms, fadeInRight400ms],
  standalone: true,
  imports: [MatTabsModule, NgFor, RouterLinkActive, RouterLink, RouterOutlet, CommonModule, AppSecondaryToolbarComponent, AppBreadcrumbsComponent, MatIconModule, MatButtonModule, NavigationMenuComponent, TranslatePipe]
})
export class ArrivalComponent implements OnInit {
  readonly toolbarService = inject(ToolbarService);
  readonly translateService = inject(TranslateService);
  
  constructor() {
  }
  
  ngOnInit(): void {
    // Définir le titre et les fils d'Ariane pour la page d'arrivée
    const arrivalTitle = this.translateService.instant('ARRIVAL');
    this.toolbarService.updateToolbar(arrivalTitle, [arrivalTitle]);
  }
}
