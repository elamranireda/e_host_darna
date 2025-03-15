import {Component, OnInit, inject} from '@angular/core';
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

// Models for transportation options
interface TransportOption {
  name: string;
  distance: string;
  estimatedBudget: string;
  estimatedTime: string;
  icon: string;
}

interface TaxiContact {
  name: string;
  phone: string;
  rating: number;
  languages: string[];
}

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
    TranslateModule
  ]
})
export class ItineraryComponent implements OnInit {
  loading: boolean = true;
  isRtl: boolean = false;
  
  private translateService = inject(TranslateService);
  private languageService = inject(LanguageService);
  private dialog = inject(MatDialog);
  
  // Sample data for transportation options
  airports: TransportOption[] = [
    {
      name: 'TRANSPORT.AIRPORTS.AIRPORT1.NAME',
      distance: 'TRANSPORT.AIRPORTS.AIRPORT1.DISTANCE',
      estimatedBudget: 'TRANSPORT.AIRPORTS.AIRPORT1.BUDGET',
      estimatedTime: 'TRANSPORT.AIRPORTS.AIRPORT1.TIME',
      icon: 'flight'
    },
    {
      name: 'TRANSPORT.AIRPORTS.AIRPORT2.NAME',
      distance: 'TRANSPORT.AIRPORTS.AIRPORT2.DISTANCE',
      estimatedBudget: 'TRANSPORT.AIRPORTS.AIRPORT2.BUDGET',
      estimatedTime: 'TRANSPORT.AIRPORTS.AIRPORT2.TIME',
      icon: 'flight'
    }
  ];
  
  trainStations: TransportOption[] = [
    {
      name: 'TRANSPORT.TRAIN_STATIONS.STATION1.NAME',
      distance: 'TRANSPORT.TRAIN_STATIONS.STATION1.DISTANCE',
      estimatedBudget: 'TRANSPORT.TRAIN_STATIONS.STATION1.BUDGET',
      estimatedTime: 'TRANSPORT.TRAIN_STATIONS.STATION1.TIME',
      icon: 'train'
    },
    {
      name: 'TRANSPORT.TRAIN_STATIONS.STATION2.NAME',
      distance: 'TRANSPORT.TRAIN_STATIONS.STATION2.DISTANCE',
      estimatedBudget: 'TRANSPORT.TRAIN_STATIONS.STATION2.BUDGET',
      estimatedTime: 'TRANSPORT.TRAIN_STATIONS.STATION2.TIME',
      icon: 'train'
    }
  ];
  
  busStops: TransportOption[] = [
    {
      name: 'TRANSPORT.BUS_STOPS.STOP1.NAME',
      distance: 'TRANSPORT.BUS_STOPS.STOP1.DISTANCE',
      estimatedBudget: 'TRANSPORT.BUS_STOPS.STOP1.BUDGET',
      estimatedTime: 'TRANSPORT.BUS_STOPS.STOP1.TIME',
      icon: 'directions_bus'
    },
    {
      name: 'TRANSPORT.BUS_STOPS.STOP2.NAME',
      distance: 'TRANSPORT.BUS_STOPS.STOP2.DISTANCE',
      estimatedBudget: 'TRANSPORT.BUS_STOPS.STOP2.BUDGET',
      estimatedTime: 'TRANSPORT.BUS_STOPS.STOP2.TIME',
      icon: 'directions_bus'
    }
  ];
  
  transportApps: TransportOption[] = [
    {
      name: 'TRANSPORT.APPS.APP1.NAME',
      distance: 'N/A',
      estimatedBudget: 'TRANSPORT.APPS.APP1.BUDGET',
      estimatedTime: 'TRANSPORT.APPS.APP1.TIME',
      icon: 'smartphone'
    },
    {
      name: 'TRANSPORT.APPS.APP2.NAME',
      distance: 'N/A',
      estimatedBudget: 'TRANSPORT.APPS.APP2.BUDGET',
      estimatedTime: 'TRANSPORT.APPS.APP2.TIME',
      icon: 'smartphone'
    }
  ];
  
  taxiContacts: TaxiContact[] = [
    {
      name: 'TRANSPORT.TAXI.CONTACT1.NAME',
      phone: 'TRANSPORT.TAXI.CONTACT1.PHONE',
      rating: 4.8,
      languages: ['COMMON.LANGUAGES.FRENCH', 'COMMON.LANGUAGES.ENGLISH', 'COMMON.LANGUAGES.ARABIC']
    },
    {
      name: 'TRANSPORT.TAXI.CONTACT2.NAME',
      phone: 'TRANSPORT.TAXI.CONTACT2.PHONE',
      rating: 4.7,
      languages: ['COMMON.LANGUAGES.FRENCH', 'COMMON.LANGUAGES.ARABIC']
    }
  ];

  constructor() {
  }

  ngOnInit(): void {
    // Check if the current language is RTL
    const currentLang = this.translateService.currentLang;
    this.isRtl = this.languageService.getCurrentLanguageInfo() === 'ar';
    this.loading = false;
  }
  
  openGoogleMaps(): void {
    window.open('https://www.google.com/maps/dir/?api=1&destination=YOUR_DESTINATION_COORDINATES', '_blank');
  }
  
  openWaze(): void {
    window.open('https://www.waze.com/ul?ll=YOUR_DESTINATION_COORDINATES&navigate=yes', '_blank');
  }
  
  openDirectionsTo(destinationName: string): void {
    // Translate the destination name to get actual location name if it's a translation key
    const destination = this.translateService.instant(destinationName);
    
    // Assuming you have the property coordinates in your service or component
    // If not, you can use the name directly for Google Maps search
    const encodedDestination = encodeURIComponent(destination);
    
    // Open Google Maps with directions to the specified location
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedDestination}`, '_blank');
  }
  
  bookRide(): void {
    // Open booking dialog or redirect to booking page
    alert(this.translateService.instant('TRANSPORT.BOOKING.CONFIRMATION'));
  }
}
