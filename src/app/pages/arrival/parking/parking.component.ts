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

@Component({
  selector: 'ehost-parking',
  templateUrl: './parking.component.html',
  styleUrls: ['./parking.component.scss'],
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
    MatProgressSpinnerModule
  ]
})
export class ParkingComponent implements OnInit {
  isRtl: boolean = false;
  hasError: boolean = false;
  errorCode: number = 500;
  errorMessage: string = '';
  retryFunction: (() => void) | null = null;
  
  // Textes par défaut pour les traductions manquantes
  readonly defaultLabels = {
    spotNumber: 'Numéro de place',
    access: 'Accès',
    price: 'Prix'
  };
  
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
  
  getSpotNumberLabel(): string {
    return this.getTranslatedLabel('PARKING.SPOT_NUMBER', this.defaultLabels.spotNumber);
  }
  
  getAccessLabel(): string {
    return this.getTranslatedLabel('PARKING.ACCESS', this.defaultLabels.access);
  }
  
  getPriceLabel(): string {
    return this.getTranslatedLabel('PARKING.PRICE', this.defaultLabels.price);
  }
  
  getParkingInstructions(): ParkingInstructions | null {
    const property = this.propertyStore.property();
    return property?.checkInInfo?.parkingInstructions || null;
  }
  
  getParkingSpots(): ParkingSpot[] {
    return this.getParkingInstructions()?.spots || [];
  }
  
  getGeneralInstructions(): string | null {
    return this.getParkingInstructions()?.generalInstructions || null;
  }
  
  reserveSpot(spotId: string): void {
    // Dans une application réelle, cela ouvrirait un dialogue de réservation ou redirigerait vers une page de réservation
    alert(this.translateService.instant('PARKING.RESERVATION.CONFIRMATION'));
  }
  
  retryOperation(): void {
    if (this.retryFunction) {
      this.retryFunction();
    }
  }
}
