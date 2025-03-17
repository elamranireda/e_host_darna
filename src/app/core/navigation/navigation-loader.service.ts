import {Injectable, inject} from '@angular/core';
import {NavigationItem} from './navigation-item.interface';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {toObservable} from '@angular/core/rxjs-interop';
import {AppConfigStore} from '@app/config/app-config.store';

/**
 * Service simplifié pour obtenir les données de navigation
 * Utilise désormais AppConfigStore comme source unique de vérité
 */
@Injectable({
  providedIn: 'root'
})
export class NavigationLoaderService {
  private readonly _items: BehaviorSubject<NavigationItem[]> = new BehaviorSubject<NavigationItem[]>([]);
  private readonly appConfigStore = inject(AppConfigStore);
  // Convertir le signal en Observable
  private readonly navigationItems$ = toObservable(this.appConfigStore.navigationItems);

  get items$(): Observable<NavigationItem[]> {
    return this._items.asObservable();
  }

  constructor() {
    console.log('Initialisation de NavigationLoaderService (version simplifiée)');
    
    // S'abonner à l'Observable dérivé du signal pour rester synchronisé
    this.navigationItems$.subscribe((items: NavigationItem[]) => {
      if (items && items.length > 0) {
        console.log('Navigation mise à jour depuis AppConfigStore:', items.length, 'items');
        this._items.next(items);
      }
    });

    // Si le store n'est pas encore initialisé, nous attendrons que navigationItems$ émette
    // Si le store est déjà initialisé, nous obtiendrons immédiatement les items
  }

  /**
   * Charge les données de navigation pour un chemin et une langue spécifiques
   * Cette méthode est maintenue pour la compatibilité, mais délègue maintenant à AppConfigStore
   */
  loadNavigation(pathId: string, lang: string): Observable<NavigationItem[]> {
    console.log('Demande de navigation pour', pathId, lang, '(délégué à AppConfigStore)');
    
    // Utiliser les données de navigation déjà disponibles dans le store
    const currentItems = this._items.getValue();
    if (currentItems && currentItems.length > 0) {
      console.log('Réutilisation des données de navigation existantes');
      return this.items$;
    }

    // Émettre les données actuelles du store
    const currentStoreNavItems = this.appConfigStore.navigationItems();
    if (currentStoreNavItems && currentStoreNavItems.length > 0) {
      console.log('Navigation obtenue depuis AppConfigStore');
      this._items.next(currentStoreNavItems);
    }
    
    return this.items$;
  }

  /**
   * Force le rechargement des données de navigation
   * Cette méthode est maintenue pour la compatibilité, mais délègue à AppConfigStore
   */
  refresh() {
    console.log('Demande de refresh navigation (délégué à AppConfigStore)');
    
    // Utiliser directement les valeurs actuelles du signal
    const currentNavItems = this.appConfigStore.navigationItems();
    if (currentNavItems && currentNavItems.length > 0) {
      console.log('Navigation rafraîchie depuis AppConfigStore');
      this._items.next(currentNavItems);
    } else {
      console.warn('Aucune navigation disponible dans AppConfigStore lors du refresh');
    }
  }
}
