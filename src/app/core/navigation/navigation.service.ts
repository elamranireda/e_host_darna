import { Injectable } from '@angular/core';
import {
  NavigationDropdown,
  NavigationItem,
  NavigationLink,
  NavigationSubheading
} from './navigation-item.interface';
import { Subject} from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
 
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
  
  
}
