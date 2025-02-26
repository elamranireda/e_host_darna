import {Component, OnInit} from '@angular/core';
import {scaleIn400ms} from '@vex/animations/scale-in.animation';
import {fadeInRight400ms} from '@vex/animations/fade-in-right.animation';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {CommonModule, NgFor} from '@angular/common';
import {MatTabsModule} from '@angular/material/tabs';
import {VexSecondaryToolbarComponent} from "@vex/components/vex-secondary-toolbar/vex-secondary-toolbar.component";
import {VexBreadcrumbsComponent} from "@vex/components/vex-breadcrumbs/vex-breadcrumbs.component";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";


@Component({
  selector: 'ehost-home',
  templateUrl: './itinerary.component.html',
  styleUrls: ['./itinerary.component.scss'],
  animations: [scaleIn400ms, fadeInRight400ms],
  standalone: true,
  imports: [MatTabsModule, NgFor, RouterLinkActive, RouterLink, RouterOutlet, CommonModule, VexSecondaryToolbarComponent, VexBreadcrumbsComponent, MatIconModule, MatButtonModule]
})
export class ItineraryComponent implements OnInit {


  loading: boolean = true;

  constructor() {
  }

  ngOnInit(): void {
  }
}
