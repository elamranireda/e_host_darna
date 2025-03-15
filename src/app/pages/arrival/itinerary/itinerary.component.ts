import {Component, OnDestroy, OnInit, inject, ChangeDetectorRef, effect} from '@angular/core';
import {scaleIn400ms} from '@app/animations/scale-in.animation';
import {fadeInRight400ms} from '@app/animations/fade-in-right.animation';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {CommonModule, NgFor, NgIf} from '@angular/common';
import {MatTabsModule} from '@angular/material/tabs';
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {MatCardModule} from '@angular/material/card';
import {MatDividerModule} from '@angular/material/divider';
import {MatListModule} from '@angular/material/list';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {LanguageService} from '@app/services/language-service';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {Subject} from 'rxjs';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {PropertyStore} from '../../../core/property/property.store';
import {ActivatedRoute} from '@angular/router';
import { PropertyTransportData, TaxiContact, TransportOption } from 'src/app/core/interfaces/property.interface';



@Component({
  selector: 'ehost-itinerary',
  templateUrl: './itinerary.component.html',
  styleUrls: ['./itinerary.component.scss'],
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
    MatListModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    TranslateModule
  ]
})
export class ItineraryComponent implements OnInit, OnDestroy {
  loading: boolean = true;
  error: boolean = false;
  isRtl: boolean = false;
  propertyId: string = '';
  propertyCoordinates: {latitude: number, longitude: number} | null = null;
  
  // Transport options data
  airports: TransportOption[] = [];
  trainStations: TransportOption[] = [];
  busStops: TransportOption[] = [];
  transportApps: TransportOption[] = [];
  taxiContacts: TaxiContact[] = [];
  
  readonly propertyStore = inject(PropertyStore);
  
  private destroy$ = new Subject<void>();
  private translateService = inject(TranslateService);
  private languageService = inject(LanguageService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private route = inject(ActivatedRoute);
  private cd = inject(ChangeDetectorRef);
  
  // Effet pour surveiller les erreurs du PropertyStore
  errorEffect = effect(() => {
    const storeError = this.propertyStore.error();
    if (storeError) {
      console.error('Erreur détectée dans le store:', storeError);
      this.error = true;
      this.loading = false;
      this.cd.markForCheck();
    }
  });

  constructor() {
    // Observer les changements de propriété dans le store
    effect(() => {
      const property = this.propertyStore.property();
      if (property) {
        // Cast property to our local interface
        const propertyWithItinerary = property;
        if (propertyWithItinerary.itineraryInfo) {
          this.processTransportData(propertyWithItinerary.itineraryInfo);
        } else {
          this.handleError('No transport data found for this property');
        }
        this.loading = false;
      }
    });
  }

  ngOnInit(): void {
    // Check if the current language is RTL
    this.isRtl = this.languageService.getCurrentLanguageInfo() === 'ar';
    
    // Charger les détails de la propriété
    this.loading = true;
    this.error = false;
    
    // Obtenir l'ID de la propriété depuis l'URL si disponible
    const propertyIdFromRoute = this.getPropertyIdFromCurrentRoute();
    if (propertyIdFromRoute) {
      this.propertyId = propertyIdFromRoute;
      this.propertyStore.getPropertyDetails(this.propertyId);
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
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  private processTransportData(data: PropertyTransportData): void {
    // Set property coordinates if available
    if (data.coordinates) {
      this.propertyCoordinates = data.coordinates;
    }
    
    // Set transport options if available
    this.airports = data.airports || [];
    this.trainStations = data.trainStations || [];
    this.busStops = data.busStops || [];
    this.transportApps = data.transportApps || [];
    this.taxiContacts = data.taxiContacts || [];
  }
  
  hasAnyTransportData(): boolean {
    return !!(
      this.airports.length ||
      this.trainStations.length ||
      this.busStops.length ||
      this.transportApps.length ||
      this.taxiContacts.length
    );
  }
  
  private handleError(message: string): void {
    this.snackBar.open(
      this.translateService.instant(message),
      this.translateService.instant('COMMON.CLOSE'),
      { duration: 5000 }
    );
  }
  
  retryLoading(): void {
    this.loading = true;
    this.error = false;
    if (this.propertyId) {
      this.propertyStore.getPropertyDetails(this.propertyId);
    } else {
      const propertyId = this.getPropertyIdFromCurrentRoute();
      if (propertyId) {
        this.propertyId = propertyId;
        this.propertyStore.getPropertyDetails(this.propertyId);
      } else {
        this.handleError('No property ID found');
        this.loading = false;
      }
    }
  }
  
  openGoogleMaps(): void {
    if (this.propertyCoordinates) {
      const { latitude, longitude } = this.propertyCoordinates;
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`, '_blank');
    } else {
      this.handleError('No coordinates available for this property');
    }
  }
  
  openWaze(): void {
    if (this.propertyCoordinates) {
      const { latitude, longitude } = this.propertyCoordinates;
      window.open(`https://www.waze.com/ul?ll=${latitude},${longitude}&navigate=yes`, '_blank');
    } else {
      this.handleError('No coordinates available for this property');
    }
  }
  
  openDirectionsTo(destinationName: string): void {
    // Translate the destination name to get actual location name if it's a translation key
    const destination = this.translateService.instant(destinationName);
    
    // Encode the destination for the URL
    const encodedDestination = encodeURIComponent(destination);
    
    // Open Google Maps with directions to the specified location
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedDestination}`, '_blank');
  }
  
  bookRide(): void {
    // Open booking dialog or redirect to booking page
    alert(this.translateService.instant('TRANSPORT.BOOKING.CONFIRMATION'));
  }
}
