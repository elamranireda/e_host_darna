import {Component, OnInit, inject, ChangeDetectorRef, effect} from '@angular/core';
import {scaleIn400ms} from '@app/animations/scale-in.animation';
import {fadeInRight400ms} from '@app/animations/fade-in-right.animation';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {CommonModule, NgFor, NgIf} from '@angular/common';
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {MatCardModule} from '@angular/material/card';
import {MatDividerModule} from '@angular/material/divider';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {LanguageService} from '@app/services/language-service';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {PropertyStore} from '../../../core/property/property.store';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'ehost-times',
  templateUrl: './times.component.html',
  styleUrls: ['./times.component.scss'],
  animations: [scaleIn400ms, fadeInRight400ms],
  standalone: true,
  imports: [
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
    TranslateModule,
    MatProgressSpinnerModule
  ]
})
export class TimesComponent implements OnInit {
  isRtl: boolean = false;
  hasError: boolean = false;
  errorCode: number = 500;
  errorMessage: string = '';
  retryFunction: (() => void) | null = null;
  
  readonly propertyStore = inject(PropertyStore);
  
  private translateService = inject(TranslateService);
  private languageService = inject(LanguageService);
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
  
  // Obtenir l'heure de début de check-in
  getCheckInStartTime(): string {
    const property = this.propertyStore.property();
    return property?.checkInInfo?.checkInStart || '';
  }
  
  // Obtenir l'heure de fin de check-in
  getCheckInEndTime(): string {
    const property = this.propertyStore.property();
    return property?.checkInInfo?.checkInEnd || '';
  }
  
  // Obtenir l'heure de check-out
  getCheckOutTime(): string {
    const property = this.propertyStore.property();
    return property?.checkInInfo?.checkOutTime || '';
  }
  
  // Obtenir les heures d'ouverture de la réception (si disponible)
  getReceptionHours(): string {
    const property = this.propertyStore.property();
    return property?.operatingHours?.reception || '';
  }
  
  // Vérifier si les horaires d'ouverture de la réception sont disponibles
  hasReceptionHours(): boolean {
    return !!this.getReceptionHours();
  }
  
  // Vérifier si le property a des horaires de check-in/check-out
  hasCheckInOutTimes(): boolean {
    return !!this.getCheckInStartTime() && !!this.getCheckOutTime();
  }
  
  retryOperation(): void {
    if (this.retryFunction) {
      this.retryFunction();
    }
  }
} 