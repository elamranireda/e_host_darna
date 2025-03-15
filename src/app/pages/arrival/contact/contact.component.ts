import {Component, OnInit, inject, effect, AfterViewInit, ViewChild, ElementRef} from '@angular/core';
import {scaleIn400ms} from '@app/animations/scale-in.animation';
import {fadeInRight400ms} from '@app/animations/fade-in-right.animation';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {CommonModule, NgFor} from '@angular/common';
import {MatTabsModule} from '@angular/material/tabs';
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {PropertyStore} from "../../../core/property/property.store";
import {ActivatedRoute} from "@angular/router";
import {Property} from "../../../core/interfaces/property.interface";
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {LanguageService} from "@app/services/language-service";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {ClipboardDirective} from "../../../shared/directives/clipboard.directive";
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ErrorMessageComponent } from '../../../core/error-message/error-message.component';
import { ToolbarService } from '../../../core/services/toolbar.service';

// Déclaration des types Google Maps pour éviter les erreurs TypeScript
declare global {
  interface Window {
    google: any;
  }
}

@Component({
  selector: 'ehost-home',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  animations: [scaleIn400ms, fadeInRight400ms],
  standalone: true,
  imports: [
    MatTabsModule, 
    NgFor, 
    RouterLinkActive, 
    RouterLink, 
    RouterOutlet, 
    CommonModule, 
    MatIconModule, 
    MatButtonModule,
    TranslateModule,
    MatSnackBarModule,
    ClipboardDirective,
    MatProgressSpinnerModule,
    ErrorMessageComponent
  ]
})
export class ContactComponent implements OnInit, AfterViewInit {
  loading: boolean = true;
  hasError: boolean = false;
  errorMessage: string = '';
  property: Property | null = null;
  
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  map: any = null;
  
  // Propriétés calculées qui renvoient les données de property avec structure par défaut
  get socialMedia() {
    return this.property?.socialMedia || [];
  }
  
  get languages() {
    return this.property?.languages || [];
  }
  
  get operatingHours() {
    return this.property?.operatingHours || {
      reception: '',
      checkout: '',
      checkin: ''
    };
  }
  
  get contactInfo() {
    return this.property?.contactInfo || {
      phone: '',
      email: '',
      website: ''
    };
  }

  readonly propertyStore = inject(PropertyStore);
  private route = inject(ActivatedRoute);
  private translateService = inject(TranslateService);
  private languageService = inject(LanguageService);
  private toolbarService = inject(ToolbarService);

  constructor() {
    effect(() => {
      const propertyData = this.propertyStore.property();
      console.log('propertyData', propertyData);
      if (propertyData) {
        this.property = propertyData;
        this.loading = false;
        setTimeout(() => {
          this.initMap();
        }, 100);
      }
    });
  }

  ngOnInit(): void {
    this.loadGoogleMapsScript();
    
    // Mettre à jour le titre de la barre d'outils
    const contactTitle = this.translateService.instant('ARRIVAL.CONTACT');
    const arrivalTitle = this.translateService.instant('ARRIVAL');
    this.toolbarService.updateToolbar(contactTitle, [
      this.translateService.instant('WELCOME'),
      arrivalTitle,
      contactTitle
    ]);
  }
  
  ngAfterViewInit(): void {
    // La carte sera initialisée une fois que les données de propriété sont disponibles
  }
  
  // Méthode pour charger le script Google Maps
  loadGoogleMapsScript(): void {
    if (window.google && window.google.maps) {
      // Si Google Maps est déjà chargé
      return;
    }
    
    const googleMapsApiKey = 'YOUR_API_KEY'; // Remplacez par votre clé API Google Maps
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&callback=Function.prototype`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }
  
  // Initialiser la carte Google Maps
  initMap(): void {
    if (!this.property || !this.property.location || !this.mapContainer || !window.google) return;
    
    try {
      const lat = typeof this.property.location.latitude === 'string' 
        ? parseFloat(this.property.location.latitude) 
        : this.property.location.latitude;
        
      const lng = typeof this.property.location.longitude === 'string' 
        ? parseFloat(this.property.location.longitude) 
        : this.property.location.longitude;
      
      const mapOptions = {
        center: { lat, lng },
        zoom: 15,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP
      };
      
      this.map = new window.google.maps.Map(this.mapContainer.nativeElement, mapOptions);
      
      // Ajouter un marqueur pour la propriété
      new window.google.maps.Marker({
        position: { lat, lng },
        map: this.map,
        title: this.property.name
      });
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la carte:', error);
    }
  }

  // Method to generate Google Maps link
  getGoogleMapsLink(): string {
    if (!this.property?.location) return '';
    const lat = this.property.location.latitude;
    const lng = this.property.location.longitude;
    return `https://www.google.com/maps?q=${lat},${lng}`;
  }
  
  // Method to open directions in Google Maps
  openDirections(): void {
    if (!this.property?.location) return;
    const lat = this.property.location.latitude;
    const lng = this.property.location.longitude;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  }
  
  // Method to open navigation in Waze
  openWaze(): void {
    if (!this.property?.location) return;
    const lat = this.property.location.latitude;
    const lng = this.property.location.longitude;
    window.open(`https://waze.com/ul?ll=${lat},${lng}&navigate=yes`, '_blank');
  }
  
  // Change language
  changeLanguage(lang: string): void {
    this.languageService.changeLanguage(lang);
  }
  
  // Get current language
  getCurrentLanguage(): string {
    return this.translateService.currentLang;
  }

  // Retry operation method
  retryOperation(): void {
    this.hasError = false; // Reset error state
    this.loading = true; // Set loading to true while fetching data
    this.ngOnInit(); // Call ngOnInit to retry fetching the property details
  }
}
