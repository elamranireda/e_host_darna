import { Injectable, inject } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { filter, map } from 'rxjs/operators';
import { ToolbarService } from './toolbar.service';

// Interface pour stocker les informations de navigation
interface BreadcrumbItem {
  title: string;
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbHistoryService {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private toolbarService = inject(ToolbarService);
  private titleService = inject(Title);

  // Structure pour stocker l'historique des breadcrumbs avec leur URL
  private navigationHistory: BreadcrumbItem[] = [];
  // Limite du nombre d'items dans l'historique
  private readonly MAX_HISTORY_ITEMS = 5;

  constructor() {
    this.initRouteListener();
  }

  /**
   * Initialise l'écoute des événements de navigation
   */
  private initRouteListener(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map((event: any) => {
          const currentUrl = event.urlAfterRedirects || event.url;
          let route = this.activatedRoute;
          while (route.firstChild) {
            route = route.firstChild;
          }
          return { route, url: currentUrl };
        }),
        filter(({ route }) => route.outlet === 'primary')
      )
      .subscribe(({ route, url }) => {
        // Extraire les données de la route
        route.data.subscribe(data => {
          // Récupérer le titre de la page depuis les données de route
          const title = data['title'] || this.getLastSegmentFromUrl(url);
          
          // Mettre à jour l'historique de navigation avec l'URL
          this.updateNavigationHistory({ title, url });
          
          // Mettre à jour les breadcrumbs dans le service de toolbar
          // On extrait seulement les titres pour la compatibilité
          const titles = this.navigationHistory.map(item => item.title);
          this.toolbarService.setBreadcrumbs(titles);
          
          // Mise à jour du titre du document
          if (title) {
            this.titleService.setTitle(`${title} | E-Host Darna`);
          }
        });
      });
  }

  /**
   * Met à jour l'historique de navigation en ajoutant un nouvel élément
   */
  private updateNavigationHistory(item: BreadcrumbItem): void {
    // Éviter les doublons consécutifs (même URL)
    if (this.navigationHistory.length === 0 || 
        this.navigationHistory[this.navigationHistory.length - 1].url !== item.url) {
      
      // Ajouter le nouveau titre à l'historique
      this.navigationHistory.push(item);
      
      // Limiter la taille de l'historique
      if (this.navigationHistory.length > this.MAX_HISTORY_ITEMS) {
        this.navigationHistory.shift(); // Retirer le plus ancien
      }
    }
  }

  /**
   * Récupère le dernier segment de l'URL fournie comme titre de secours
   */
  private getLastSegmentFromUrl(url: string): string {
    const urlPath = url.split('?')[0]; // Ignorer les query params
    const segments = urlPath.split('/').filter(segment => segment.length > 0);
    return segments.length > 0 
      ? this.formatUrlSegment(segments[segments.length - 1]) 
      : 'Accueil';
  }

  /**
   * Formate un segment d'URL pour l'affichage (remplace les tirets par des espaces et capitalise)
   */
  private formatUrlSegment(segment: string): string {
    return segment
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  /**
   * Réinitialise l'historique de navigation
   */
  public resetHistory(): void {
    this.navigationHistory = [];
    this.toolbarService.setBreadcrumbs(['Accueil']);
  }

  /**
   * Retourne l'historique de navigation actuel avec les titres uniquement
   */
  public getNavigationHistory(): string[] {
    return this.navigationHistory.map(item => item.title);
  }

  /**
   * Retourne l'URL associée à un breadcrumb spécifique par son index
   */
  public getUrlByIndex(index: number): string | null {
    if (index >= 0 && index < this.navigationHistory.length) {
      return this.navigationHistory[index].url;
    }
    return null;
  }

  /**
   * Retourne l'historique complet (titres + URLs)
   */
  public getFullNavigationHistory(): BreadcrumbItem[] {
    return [...this.navigationHistory];
  }
} 