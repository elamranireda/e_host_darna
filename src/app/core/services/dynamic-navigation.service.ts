import { Injectable, inject } from '@angular/core';
import { Event, NavigationEnd, Router } from '@angular/router';
import { ToolbarService } from './toolbar.service';
import { filter } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

/**
 * Service qui gère la mise à jour dynamique des titres lors de la navigation
 */
@Injectable({
  providedIn: 'root'
})
export class DynamicNavigationService {
  private readonly router = inject(Router);
  private readonly toolbarService = inject(ToolbarService);
  private readonly translateService = inject(TranslateService);
  
  // Mapping des routes vers les titres (avec support pour la traduction)
  private readonly routeTitleMap: Record<string, string> = {
    '': 'WELCOME',
    'arrival': 'ARRIVAL',
    'arrival/contact': 'ARRIVAL.CONTACT',
    'arrival/itinerary': 'ARRIVAL.ITINERARY',
    'arrival/checkin': 'ARRIVAL.CHECKIN',
    'arrival/parking': 'ARRIVAL.PARKING',
    'arrival/rules': 'ARRIVAL.RULES',
    'arrival/late-arrival': 'ARRIVAL.LATE_ARRIVAL',
    'arrival/times': 'ARRIVAL.TIMES',
  };
  
  /**
   * Initialise le service et commence à écouter les événements de navigation
   */
  initialize(): void {
    // Vérifier que le router est disponible avant d'y souscrire
    if (!this.router) {
      console.error('Router not available in DynamicNavigationService');
      return;
    }
    
    this.router.events.pipe(
      filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      try {
        this.updateToolbarOnNavigation(event.urlAfterRedirects);
      } catch (error) {
        console.error('Error updating toolbar on navigation:', error);
      }
    });
  }
  
  /**
   * Mets à jour la barre d'outils en fonction de l'URL actuelle
   */
  private updateToolbarOnNavigation(url: string): void {
    if (!url) {
      console.warn('Empty URL provided to updateToolbarOnNavigation');
      return;
    }
    
    try {
      // Extraire le chemin sans les paramètres de requête et l'id de propriété
      const propertyIdMatch = url.match(/^\/([^\/]+)/);
      const propertyId = propertyIdMatch ? propertyIdMatch[1] : '';
      
      let path = url.replace(/^\/[^\/]+\//, ''); // Supprimer l'ID de propriété
      path = path.replace(/\?.+$/, ''); // Supprimer les paramètres de requête
      
      // Obtenir le titre correspondant à la route
      let title = this.getRouteTitle(path);
      
      // Générer les fils d'Ariane
      const breadcrumbs = this.generateBreadcrumbs(path);
      
      // Mettre à jour la barre d'outils
      this.toolbarService.updateToolbar(title, breadcrumbs);
    } catch (error) {
      console.error('Error parsing URL in updateToolbarOnNavigation:', error);
    }
  }
  
  /**
   * Récupère le titre correspondant à une route
   */
  private getRouteTitle(route: string): string {
    const titleKey = this.routeTitleMap[route] || 'UNKNOWN_PAGE';
    return this.translateService.instant(titleKey);
  }
  
  /**
   * Génère les fils d'Ariane en fonction du chemin
   */
  private generateBreadcrumbs(path: string): string[] {
    const parts = path.split('/').filter(part => part !== '');
    const breadcrumbs: string[] = [];
    
    // Ajouter l'accueil comme premier élément si nous ne sommes pas sur la page d'accueil
    if (parts.length > 0) {
      breadcrumbs.push(this.translateService.instant('WELCOME'));
    }
    
    // Ajouter chaque partie du chemin
    let currentPath = '';
    for (const part of parts) {
      currentPath += (currentPath ? '/' : '') + part;
      breadcrumbs.push(this.getRouteTitle(currentPath));
    }
    
    return breadcrumbs;
  }
} 