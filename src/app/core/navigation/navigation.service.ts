import { Injectable, inject, Signal } from '@angular/core';
import {
  NavigationDropdown,
  NavigationItem,
  NavigationLink,
  NavigationSubheading
} from './navigation-item.interface';
import { Observable, Subject, map, of } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { filter, startWith } from 'rxjs/operators';
import { AppConfigStore } from '@app/config/app-config.store';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private appConfigStore = inject(AppConfigStore);
  
  // Créer un observable à partir du signal du store
  items$: Observable<NavigationItem[]> = toObservable(this.appConfigStore.navigationItems);
  
  // Exposer l'état de chargement du store
  loading$ = toObservable(this.appConfigStore.loading);

  private _openChangeSubject = new Subject<NavigationDropdown>();
  openChange$ = this._openChangeSubject.asObservable();

  constructor(private router: Router) {}


  triggerOpenChange(item: NavigationDropdown) {
    this._openChangeSubject.next(item);
  }

  isLink(item: NavigationItem): item is NavigationLink {
    return item.type === 'link';
  }

  isDropdown(item: NavigationItem): item is NavigationDropdown {
    return item.type === 'dropdown';
  }

  isSubheading(item: NavigationItem): item is NavigationSubheading {
    return item.type === 'subheading';
  }
  
  /**
   * Remplace récursivement les :id dans les routes par l'ID de propriété réel
   */
  getNavigationWithReplacedIds(items: NavigationItem[], propertyId: string): NavigationItem[] {
    if (!propertyId || !items || items.length === 0) {
      return items;
    }
    
    return items.map(item => {
      const newItem = { ...item };
      
      // Remplacer l'ID dans la route si elle existe
      if (this.isLink(newItem) || this.isDropdown(newItem)) {
        if (newItem.route) {
          // Remplacer le paramètre :id par l'ID réel
          newItem.route = newItem.route.replace(/:id/g, propertyId);
        }
      }
      
      // Traiter les enfants de manière récursive
      if (this.isDropdown(newItem) && newItem.children) {
        newItem.children = this.getNavigationWithReplacedIds(newItem.children, propertyId) as (NavigationLink | NavigationDropdown)[];
      } else if (this.isSubheading(newItem) && newItem.children) {
        newItem.children = this.getNavigationWithReplacedIds(newItem.children, propertyId) as (NavigationLink | NavigationDropdown)[];
      }
      
      return newItem;
    });
  }
  
  /**
   * Obtient les items de navigation avec les IDs de propriété remplacés
   * @param propertyId ID de la propriété à insérer dans les routes
   * @returns Items de navigation avec les IDs remplacés
   */
  getReplaceableNavigation(propertyId: string): NavigationItem[] {
    const items = this.appConfigStore.navigationItems();
    if (!items || items.length === 0) {
      console.warn('Aucun item de navigation disponible');
      return [];
    }
    
    if (!propertyId) {
      console.warn('Aucun ID de propriété fourni, utilisation des items originaux');
      return items;
    }
    
    return this.getNavigationWithReplacedIds(items, propertyId);
  }
}
