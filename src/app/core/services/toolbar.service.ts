import { Injectable, signal } from '@angular/core';

/**
 * Service qui gère le titre et les éléments de la barre d'outils secondaire
 */
@Injectable({
  providedIn: 'root'
})
export class ToolbarService {
  // Signal pour le titre actuel de la barre d'outils (initialisé avec une valeur par défaut)
  private _currentTitle = signal<string>('E-Host Darna');
  // Signal pour les fils d'Ariane (breadcrumbs)
  private _currentBreadcrumbs = signal<string[]>(['Bienvenue']);

  // Exposer les signaux en lecture seule
  public readonly currentTitle = this._currentTitle.asReadonly();
  public readonly currentBreadcrumbs = this._currentBreadcrumbs.asReadonly();

  constructor() {
    console.log('ToolbarService initialized with default values');
  }

  /**
   * Met à jour le titre de la barre d'outils
   */
  setTitle(title: string): void {
    if (title === null || title === undefined) {
      console.warn('Null or undefined title provided to ToolbarService.setTitle');
      return;
    }
    this._currentTitle.set(title);
  }

  /**
   * Met à jour les fils d'Ariane
   */
  setBreadcrumbs(breadcrumbs: string[]): void {
    if (!breadcrumbs || !Array.isArray(breadcrumbs)) {
      console.warn('Invalid breadcrumbs provided to ToolbarService.setBreadcrumbs');
      this._currentBreadcrumbs.set(['Bienvenue']);
      return;
    }
    this._currentBreadcrumbs.set(breadcrumbs);
  }
  
  /**
   * Met à jour à la fois le titre et les fils d'Ariane
   */
  updateToolbar(title: string, breadcrumbs?: string[]): void {
    if (title === null || title === undefined) {
      console.warn('Null or undefined title provided to ToolbarService.updateToolbar');
      return;
    }
    
    this._currentTitle.set(title);
    
    if (breadcrumbs && Array.isArray(breadcrumbs)) {
      this._currentBreadcrumbs.set(breadcrumbs);
    } else {
      // Si aucun fil d'Ariane n'est spécifié ou si le format est invalide, utiliser le titre comme fil d'Ariane unique
      this._currentBreadcrumbs.set([title]);
    }
  }
} 