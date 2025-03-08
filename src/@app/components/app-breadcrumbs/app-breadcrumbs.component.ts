import { Component, Input } from '@angular/core';
import { trackByValue } from '../../utils/track-by';
import { AppBreadcrumbComponent } from './app-breadcrumb/app-breadcrumb.component';
import { RouterLink } from '@angular/router';
import { NgFor } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-breadcrumbs',
  template: `
    <div class="flex items-center gap-2">
      <app-breadcrumb>
        <a [routerLink]="['/']">
          <mat-icon svgIcon="mat:home" class="icon-sm"></mat-icon>
        </a>
      </app-breadcrumb>
      <ng-container *ngFor="let crumb of crumbs; trackBy: trackByValue">
        <div class="w-1 h-1 bg-gray-600 rounded-full"></div>
        <app-breadcrumb>
          <a [routerLink]="[]">{{ crumb }}</a>
        </app-breadcrumb>
      </ng-container>
    </div>
  `,
  standalone: true,
  imports: [AppBreadcrumbComponent, RouterLink, NgFor, MatIconModule]
})
export class AppBreadcrumbsComponent {
  @Input() crumbs: string[] = [];

  trackByValue = trackByValue;
}
