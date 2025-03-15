import { Component, Input, OnInit, inject } from '@angular/core';
import { trackByValue } from '../../utils/track-by';
import { AppBreadcrumbComponent } from './app-breadcrumb/app-breadcrumb.component';
import { Router, RouterLink } from '@angular/router';
import { AsyncPipe, NgFor } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ToolbarService } from '../../../app/core/services/toolbar.service';
import { BreadcrumbHistoryService } from '../../../app/core/services/breadcrumb-history.service';

@Component({
  selector: 'app-breadcrumbs',
  template: `
    <div class="flex items-center gap-2">
      <app-breadcrumb>
        <a [routerLink]="['/']">
          <mat-icon svgIcon="mat:home" class="icon-sm"></mat-icon>
        </a>
      </app-breadcrumb>
      <ng-container *ngFor="let crumb of getCurrentBreadcrumbs(); trackBy: trackByValue; let i = index">
        <div class="w-1 h-1 bg-gray-600 rounded-full"></div>
        <app-breadcrumb>
          <a [routerLink]="getRouteForBreadcrumb(i)" (click)="onBreadcrumbClick(i)">{{ crumb }}</a>
        </app-breadcrumb>
      </ng-container>
    </div>
  `,
  standalone: true,
  imports: [AppBreadcrumbComponent, RouterLink, NgFor, AsyncPipe, MatIconModule]
})
export class AppBreadcrumbsComponent implements OnInit {
  // Input optionnel pour permettre de passer des breadcrumbs manuellement si nécessaire
  @Input() crumbs: string[] = [];

  // Injection des services
  private readonly toolbarService = inject(ToolbarService);
  private readonly breadcrumbHistoryService = inject(BreadcrumbHistoryService);
  private readonly router = inject(Router);

  // Fonction de tracking
  trackByValue = trackByValue;

  ngOnInit(): void {
    // Aucune initialisation supplémentaire nécessaire
  }

  /**
   * Obtient la liste des breadcrumbs actuels en priorité depuis le service
   */
  getCurrentBreadcrumbs(): string[] {
    // Priorité 1: Utiliser les breadcrumbs définis manuellement via Input si présents
    if (this.crumbs && this.crumbs.length > 0) {
      return this.crumbs;
    }
    
    // Priorité 2: Utiliser les breadcrumbs du ToolbarService qui sont alimentés par le BreadcrumbHistoryService
    return this.toolbarService.currentBreadcrumbs();
  }

  /**
   * Retourne la route associée à un breadcrumb en utilisant le service d'historique
   */
  getRouteForBreadcrumb(index: number): any[] {
    // Si nous utilisons des breadcrumbs manuels, retourner une route vide
    if (this.crumbs && this.crumbs.length > 0) {
      return [];
    }
    
    // Sinon, essayer de récupérer l'URL associée depuis le service d'historique
    const url = this.breadcrumbHistoryService.getUrlByIndex(index);
    
    if (url) {
      // Convertir l'URL relative en array pour routerLink
      return [url];
    }
    
    // Par défaut, retourner une route vide (ne navigue pas)
    return [];
  }

  /**
   * Gère le clic sur un breadcrumb
   * Cette méthode implémente la logique de navigation et d'ajustement des breadcrumbs
   */
  onBreadcrumbClick(index: number): void {
    // Si nous utilisons des breadcrumbs manuels, ne rien faire
    if (this.crumbs && this.crumbs.length > 0) {
      return;
    }
    
    const breadcrumbs = this.getCurrentBreadcrumbs();
    
    // Si on clique sur le dernier breadcrumb, pas d'action spéciale
    if (index === breadcrumbs.length - 1) {
      return;
    }
    
    // Récupérer l'URL associée au breadcrumb
    const url = this.breadcrumbHistoryService.getUrlByIndex(index);
    
    if (url) {
      // Naviguer vers l'URL correspondante
      this.router.navigateByUrl(url);
      
      // Tronquer l'historique jusqu'à ce breadcrumb
      const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
      this.toolbarService.setBreadcrumbs(newBreadcrumbs);
    }
  }
}
