import {Component, OnInit, inject, ChangeDetectorRef, effect} from '@angular/core';
import {scaleIn400ms} from '@app/animations/scale-in.animation';
import {fadeInRight400ms} from '@app/animations/fade-in-right.animation';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {CommonModule, NgFor, NgIf} from '@angular/common';
import {MatTabsModule} from '@angular/material/tabs';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatDividerModule} from '@angular/material/divider';
import {MatChipsModule} from '@angular/material/chips';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {LanguageService} from '@app/services/language-service';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {PropertyStore} from '../../../core/property/property.store';
import {ActivatedRoute} from '@angular/router';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatListModule} from '@angular/material/list';

// Interface pour les instructions d'arrivée tardive
export interface LateArrivalInstruction {
  id: string;
  type: string;
  title: string;
  description: string;
  contactName?: string;
  contactPhone?: string;
  hours?: string;
  priority: number;
  icon?: string;
}

// Interface pour la propriété avec les instructions d'arrivée tardive
interface PropertyWithLateArrival {
  id: string;
  name: string;
  lateArrivalInstructions?: LateArrivalInstruction[];
  [key: string]: any;
}

@Component({
  selector: 'ehost-late-arrival',
  templateUrl: './late-arrival.component.html',
  styleUrls: ['./late-arrival.component.scss'],
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
export class LateArrivalComponent implements OnInit {
  isRtl: boolean = false;
  hasError: boolean = false;
  errorCode: number = 500;
  errorMessage: string = '';
  retryFunction: (() => void) | null = null;
  
  // Types d'instructions prédéfinis
  instructionTypes = [
    { id: 'key', name: 'LATE_ARRIVAL.TYPES.KEY', icon: 'key' },
    { id: 'keycode', name: 'LATE_ARRIVAL.TYPES.KEYCODE', icon: 'dialpad' },
    { id: 'smartlock', name: 'LATE_ARRIVAL.TYPES.SMARTLOCK', icon: 'phonelink_lock' },
    { id: 'contact', name: 'LATE_ARRIVAL.TYPES.CONTACT', icon: 'contact_phone' },
    { id: 'meetandgreet', name: 'LATE_ARRIVAL.TYPES.MEET_AND_GREET', icon: 'handshake' },
    { id: 'other', name: 'LATE_ARRIVAL.TYPES.OTHER', icon: 'more_horiz' }
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
  
  // Vérifier si un objet est un tableau
  private isArray(obj: any): boolean {
    return Array.isArray(obj);
  }
  
  // Obtenir les instructions d'arrivée tardive depuis le store
  getLateArrivalInstructions(): LateArrivalInstruction[] {
    const property = this.propertyStore.property() as unknown as PropertyWithLateArrival;
    
    // Si les instructions sont disponibles dans la propriété, retourner celles triées par priorité
    if (property?.lateArrivalInstructions && this.isArray(property.lateArrivalInstructions)) {
      return [...property.lateArrivalInstructions].sort((a, b) => a.priority - b.priority);
    }
    
    // Sinon, vérifier si les instructions sont dans checkInInfo.accessInstructions
    if (property && property['checkInInfo'] && property['checkInInfo']['accessInstructions']) {
      const accessInstructions = property['checkInInfo']['accessInstructions'];
      
      // Vérifier que accessInstructions est bien un tableau
      if (this.isArray(accessInstructions)) {
        // Convertir les instructions d'accès au format LateArrivalInstruction[]
        return accessInstructions.map((instruction: any, index: number) => ({
          id: `instruction-${index}`,
          type: instruction.type || 'other',
          title: instruction.description || '',
          description: instruction.details || '',
          priority: instruction.priority || (index + 1),
          icon: this.getIconForInstructionType(instruction.type || 'other')
        }));
      } else {
        console.warn('accessInstructions is not an array:', accessInstructions);
      }
    }
    
    return [];
  }
  
  // Vérifier si des instructions sont disponibles
  hasInstructions(): boolean {
    try {
      return this.getLateArrivalInstructions().length > 0;
    } catch (error) {
      console.error('Error in hasInstructions:', error);
      return false;
    }
  }
  
  // Obtenir l'icône pour un type d'instruction
  getIconForInstructionType(type: string): string {
    const instructionType = this.instructionTypes.find(t => t.id === type);
    return instructionType?.icon || 'more_horiz';
  }
  
  // Obtenir le nom traduit d'un type d'instruction
  getInstructionTypeName(type: string): string {
    const instructionType = this.instructionTypes.find(t => t.id === type);
    if (instructionType) {
      return this.translateService.instant(instructionType.name);
    }
    return this.translateService.instant('LATE_ARRIVAL.TYPES.OTHER');
  }
  
  // Obtenir le contact téléphonique pour les instructions
  getContactPhone(instruction: LateArrivalInstruction): string | null {
    return instruction.contactPhone || null;
  }
  
  // Ouvrir l'application téléphone pour appeler un contact
  callContact(phoneNumber: string): void {
    window.location.href = `tel:${phoneNumber}`;
  }
  
  // Gérer la tentative de réessai en cas d'erreur
  retryOperation(): void {
    if (this.retryFunction) {
      this.retryFunction();
    }
  }
} 