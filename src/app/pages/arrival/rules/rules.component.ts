import {Component, OnInit, inject, ChangeDetectorRef, effect} from '@angular/core';
import {scaleIn400ms} from '@app/animations/scale-in.animation';
import {fadeInRight400ms} from '@app/animations/fade-in-right.animation';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {CommonModule, NgFor, NgIf} from '@angular/common';
import {MatTabsModule} from '@angular/material/tabs';
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {MatCardModule} from '@angular/material/card';
import {MatDividerModule} from '@angular/material/divider';
import {MatChipsModule} from '@angular/material/chips';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {LanguageService} from '@app/services/language-service';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {PropertyStore} from '../../../core/property/property.store';
import {ParkingInstructions, ParkingSpot} from '../../../core/interfaces/property.interface';
import {ActivatedRoute} from '@angular/router';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatListModule} from '@angular/material/list';

// Interface pour les règles de la maison
export interface HouseRule {
  id: string;
  category: string;
  title: string;
  description: string;
  icon: string;
  isImportant: boolean;
}

// Interface pour la propriété avec les règles de la maison
interface PropertyWithRules {
  id: string;
  name: string;
  houseRules?: HouseRule[];
  [key: string]: any;
}

@Component({
  selector: 'ehost-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.scss'],
  animations: [scaleIn400ms, fadeInRight400ms],
  standalone: true,
  imports: [
    MatTabsModule, 
    NgFor, 
    NgIf,
    RouterLinkActive, 
    RouterLink, 
    RouterOutlet, 
    CommonModule, 
    MatIconModule, 
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatChipsModule,
    MatDialogModule,
    TranslateModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatListModule
  ]
})
export class RulesComponent implements OnInit {
  isRtl: boolean = false;
  hasError: boolean = false;
  errorCode: number = 500;
  errorMessage: string = '';
  retryFunction: (() => void) | null = null;
  
  // Catégories prédéfinies pour regrouper les règles
  categories = [
    { id: 'general', name: 'RULES.CATEGORIES.GENERAL', icon: 'info' },
    { id: 'safety', name: 'RULES.CATEGORIES.SAFETY', icon: 'security' },
    { id: 'noise', name: 'RULES.CATEGORIES.NOISE', icon: 'volume_off' },
    { id: 'cleanliness', name: 'RULES.CATEGORIES.CLEANLINESS', icon: 'cleaning_services' },
    { id: 'pets', name: 'RULES.CATEGORIES.PETS', icon: 'pets' },
    { id: 'smoking', name: 'RULES.CATEGORIES.SMOKING', icon: 'smoke_free' },
    { id: 'events', name: 'RULES.CATEGORIES.EVENTS', icon: 'celebration' },
    { id: 'other', name: 'RULES.CATEGORIES.OTHER', icon: 'more_horiz' }
  ];
  
  readonly propertyStore = inject(PropertyStore);
  
  private translateService = inject(TranslateService);
  private languageService = inject(LanguageService);
  private dialog = inject(MatDialog);
  private route = inject(ActivatedRoute);
  private cd = inject(ChangeDetectorRef);
  
  // Effet pour surveiller les erreurs du PropertyStore
  errorEffect = effect(() => {
    const error = this.propertyStore.error();
    if (error) {
      console.log('Erreur détectée dans le store');
      this.hasError = true;
      
      // Extraire le code d'erreur si disponible
      if (typeof error === 'object' && error !== null && 'code' in error) {
        this.errorCode = error.code;
      }
      
      this.retryFunction = () => this.retryPropertyLoad();
      this.cd.markForCheck();
    }
  });
  
  private retryPropertyLoad(): void {
    this.hasError = false;
    this.errorMessage = '';
    const propertyId = this.getPropertyIdFromCurrentRoute();
    if (propertyId) {
      this.propertyStore.getPropertyDetails(propertyId);
    }
  }

  constructor() {}

  ngOnInit(): void {
    // Check if the current language is RTL
    const currentLang = this.translateService.currentLang;
    this.isRtl = this.languageService.getCurrentLanguageInfo() === 'ar';
    
    // Charger les détails de la propriété si nécessaire
    const propertyId = this.getPropertyIdFromCurrentRoute();
    if (propertyId) {
      this.propertyStore.getPropertyDetails(propertyId);
    }
  }
  
  // Méthode utilitaire pour obtenir l'ID de la propriété depuis l'URL
  private getPropertyIdFromCurrentRoute(): string | null {
    let propertyId: string | null = null;
    this.route.params.subscribe(params => {
      propertyId = params['id'];
    });
    return propertyId;
  }
  
  // Méthodes pour gérer les traductions manquantes
  getTranslatedLabel(key: string, defaultValue: string): string {
    const translation = this.translateService.instant(key);
    return translation === key ? defaultValue : translation;
  }
  
  // Obtenir les règles de la maison depuis le store
  getHouseRules(): HouseRule[] {
    const property = this.propertyStore.property() as unknown as PropertyWithRules;
    return property?.houseRules || [];
  }
  
  // Vérifier si des règles sont disponibles
  hasRules(): boolean {
    return this.getHouseRules().length > 0;
  }
  
  // Filtrer les règles par catégorie
  getRulesByCategory(categoryId: string): HouseRule[] {
    return this.getHouseRules().filter(rule => rule.category === categoryId);
  }
  
  // Obtenir les règles importantes
  getImportantRules(): HouseRule[] {
    return this.getHouseRules().filter(rule => rule.isImportant);
  }
  
  // Obtenir le nom traduit d'une catégorie
  getCategoryName(categoryId: string): string {
    const category = this.categories.find(cat => cat.id === categoryId);
    if (category) {
      return this.translateService.instant(category.name);
    }
    return this.translateService.instant('RULES.CATEGORIES.OTHER');
  }
  
  // Obtenir l'icône d'une catégorie
  getCategoryIcon(categoryId: string): string {
    const category = this.categories.find(cat => cat.id === categoryId);
    if (category) {
      return category.icon;
    }
    return 'more_horiz';
  }
  
  // Vérifier si une catégorie a des règles
  hasCategoryRules(categoryId: string): boolean {
    return this.getRulesByCategory(categoryId).length > 0;
  }
  
  // Obtenir toutes les catégories qui ont des règles
  getActiveCategories(): any[] {
    return this.categories.filter(category => this.hasCategoryRules(category.id));
  }
  
  retryOperation(): void {
    if (this.retryFunction) {
      this.retryFunction();
    }
  }
}
