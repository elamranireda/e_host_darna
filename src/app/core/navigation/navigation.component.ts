import { Component, Input, OnInit, inject, OnDestroy } from '@angular/core';
import { NavigationItem } from './navigation-item.interface';
import { ActivatedRoute } from '@angular/router';
import { NavigationService } from './navigation.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit, OnDestroy {
  @Input() propertyId: string = '';
  
  navigationItems: NavigationItem[] = [];
  loading = false;
  
  private readonly navigationService = inject(NavigationService);
  private readonly route = inject(ActivatedRoute);
  private subscriptions = new Subscription();
  
  ngOnInit(): void {
    // Observer les changements dans les items de navigation
    const navSub = this.navigationService.items$.subscribe(items => {
      if (this.propertyId) {
        // Remplacer les IDs si un propertyId est fourni
        this.navigationItems = this.navigationService.getReplaceableNavigation(this.propertyId);
      } else {
        this.navigationItems = items;
      }
    });
    
    this.subscriptions.add(navSub);
    
    // Tenter d'obtenir l'ID de propriété depuis la route si non fourni via Input
    if (!this.propertyId) {
      const routeId = this.route.snapshot.paramMap.get('id');
      if (routeId) {
        this.propertyId = routeId;
        // Mettre à jour les items avec l'ID de la route
        this.navigationItems = this.navigationService.getReplaceableNavigation(this.propertyId);
      }
    }
  }
  
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
} 