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
import { NavigationConfigStore } from '../stores/navigation-config.store';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private navigationConfigStore = inject(NavigationConfigStore);
  
  // Créer un observable à partir du signal du store
  private readonly storeItems$ = of(null).pipe(
    startWith(null),
    map(() => this.navigationConfigStore.items())
  );
  
  // Utiliser le store de navigation comme source de données
  // Les items sont déjà transformés dans le store
  items$: Observable<NavigationItem[]> = this.storeItems$;

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
}
