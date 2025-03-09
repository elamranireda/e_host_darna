import {ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, inject, OnInit, Signal, ViewChild} from '@angular/core';
import {scaleIn400ms} from '@app/animations/scale-in.animation';
import {fadeInRight400ms} from '@app/animations/fade-in-right.animation';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {CommonModule, DOCUMENT, NgFor} from '@angular/common';
import {MatTabsModule} from '@angular/material/tabs';
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {MatRippleModule} from "@angular/material/core";
import {AppAccessInstructionContentComponent} from "./components/app-access-instruction-content/app-access-instruction-content.component";
import {fadeInUp400ms} from "@app/animations/fade-in-up.animation";
import {stagger40ms, stagger80ms} from "@app/animations/stagger.animation";
import {MatStepperModule, MatStepper} from "@angular/material/stepper";
import {
  AccessInstructions, 
  AccessMethodTypeEnum, 
  AccessInstructionItem, 
  AccessModeItem, 
  IdentityCheckItem, 
  ArrivalInstructionItem,
  InstructionType
} from "../../../core/access-instructions/access-instruction-item.interface";
import {PropertyStore} from "../../../core/property/property.store";
import {MatInputModule} from "@angular/material/input";
import {UntypedFormControl} from "@angular/forms";
import {AccessInstructionsService} from "../../../core/access-instructions/access-instructions.service";
import { TranslatePipe } from '@ngx-translate/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ErrorMessageComponent } from '../../../core/error-message/error-message.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Clipboard } from '@angular/cdk/clipboard';
import { trigger, transition, style, animate } from '@angular/animations';
import { DatePipe } from '@angular/common';
import { AppCheckinWelcomeComponent } from './components/app-checkin-welcome/app-checkin-welcome.component';
import { LoadingIndicatorComponent } from './components/loading-indicator/loading-indicator.component';
import { effect } from '@angular/core';
import { patchState } from '@ngrx/signals';
import { HttpErrorResponse } from '@angular/common/http';

// Interface pour les éléments de galerie
export interface GalleryItem {
  src: string;
  thumb?: string;
  title?: string;
  description?: string;
  order: number;
}

// Clé pour le stockage local de la progression
const CHECKIN_PROGRESS_KEY = 'checkin-progress';

@Component({
  selector: 'ehost-home',
  templateUrl: './checkin.component.html',
  styleUrls: ['./checkin.component.scss'],
  animations: [
    fadeInUp400ms, 
    fadeInRight400ms, 
    scaleIn400ms, 
    stagger40ms, 
    stagger80ms,
    trigger('fadeInSlideUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatTabsModule, 
    NgFor, 
    RouterLinkActive, 
    RouterLink, 
    RouterOutlet, 
    CommonModule, 
    MatIconModule, 
    MatButtonModule, 
    MatRippleModule, 
    MatStepperModule, 
    AppCheckinWelcomeComponent, 
    MatInputModule, 
    AppAccessInstructionContentComponent, 
    TranslatePipe, 
    MatSnackBarModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    DatePipe,
    LoadingIndicatorComponent,
    ErrorMessageComponent
  ]
})
export class CheckinComponent implements OnInit {
  selectCtrl: UntypedFormControl = new UntypedFormControl();
  inputType = 'password';
  visible = false;

  // Variables pour la gestion d'erreurs
  hasError = false;
  errorMessage = '';
  retryFunction: (() => void) | null = null;

  // Variable pour le suivi de progression
  totalSteps = 0;
  currentStep = 0;
  checkInComplete = false;

  @ViewChild('verticalStepper') verticalStepper!: MatStepper;
  
  // Ajouter un Map pour suivre l'état d'affichage des médias pour chaque instruction
  private mediaState = new Map<string, boolean>();
  
  // Gestion de la galerie
  galleryItems: Map<string, GalleryItem[]> = new Map();
  lightboxOpen = false;
  currentImageIndex = 0;
  currentInstructionKey = '';

  // Préchargement des images
  private preloadedImages: HTMLImageElement[] = [];
  
  readonly propertyStore = inject(PropertyStore);
  readonly accessInstructions = this.propertyStore.accessInstructions;
  private accessInstructionsService = inject(AccessInstructionsService);
  private document = inject(DOCUMENT);
  private snackBar = inject(MatSnackBar);
  private clipboard = inject(Clipboard);

  // Helper methods to use in the template
  isAccessModeItem = this.accessInstructionsService.isAccessModeItem.bind(this.accessInstructionsService);
  isIdentityCheckItem = this.accessInstructionsService.isIdentityCheckItem.bind(this.accessInstructionsService);
  isArrivalInstructionItem = this.accessInstructionsService.isArrivalInstructionItem.bind(this.accessInstructionsService);
  
  // Expose the sorted instructions for use in the template
  getSortedInstructions(instructions: AccessInstructions | null): AccessInstructionItem[] {
    if (!instructions) return [];
    const sortedInstructions = this.accessInstructionsService.getAllInstructionsSorted(instructions);
    this.totalSteps = sortedInstructions.length;
    return sortedInstructions;
  }
  
  // Get instructions of specific types, already sorted
  getAccessModeItems(instructions: AccessInstructions | null): AccessModeItem[] {
    if (!instructions) return [];
    return this.accessInstructionsService.getAccessModeItems(instructions);
  }
  
  getIdentityCheckItems(instructions: AccessInstructions | null): IdentityCheckItem[] {
    if (!instructions) return [];
    return this.accessInstructionsService.getIdentityCheckItems(instructions);
  }
  
  getArrivalInstructionItems(instructions: AccessInstructions | null): ArrivalInstructionItem[] {
    if (!instructions) return [];
    return this.accessInstructionsService.getArrivalInstructionItems(instructions);
  }

  // Méthode pour sélectionner une étape
  selectStep(index: number): void {
    if (this.verticalStepper) {
      this.verticalStepper.selectedIndex = index;
      this.currentStep = index + 1;
      this.saveProgress();
    }
  }

  // Nouvelle propriété pour stocker le code d'erreur
  errorCode: number = 500;

  // Effet pour surveiller les erreurs du PropertyStore
  errorEffect = effect(() => {
    const error = this.propertyStore.error();
    if (error) {
      console.log('Erreur détectée dans le store');
      this.hasError = true;
      
      // Extraire le code d'erreur si disponible
      if (typeof error === 'object' && error !== null && 'code' in error) {
        this.errorCode = error.code;
      } else if (error instanceof HttpErrorResponse) {
        this.errorCode = error.status;
      } else {
        // Code d'erreur par défaut si non spécifié
        this.errorCode = 500;
      }
      
      // Fonction de réessai
      this.retryFunction = () => this.retryPropertyLoad();
      this.cd.markForCheck();
    } else {
      // Réinitialiser l'état d'erreur si l'erreur est résolue
      this.hasError = false;
    }
  });

  // Méthode pour réessayer de charger les données de la propriété
  private retryPropertyLoad(): void {
    this.hasError = false;
    const propertyId = this.getPropertyIdFromCurrentRoute();
    if (propertyId) {
      this.propertyStore.getPropertyDetails(propertyId);
    }
  }

  constructor(private cd: ChangeDetectorRef) {
    // Vérifier la disponibilité du service dès l'initialisation
    this.checkServiceAvailability();
  }

  /**
   * Vérifie si le service json-server est disponible
   * En cas d'échec, définit une erreur
   */
  private checkServiceAvailability(): void {
    // Vérifier si json-server est accessible
    fetch('http://localhost:3000/properties', { method: 'HEAD' })
      .then(response => {
        if (!response.ok) {
          throw new Error('Le service API n\'est pas disponible');
        }
      })
      .catch(error => {
        console.error('Erreur de connexion au serveur:', error);
        this.hasError = true;
        // Pour les erreurs de connexion, le code est 0
        this.errorCode = 0;
        this.retryFunction = () => {
          this.checkServiceAvailability();
          if (!this.hasError) {
            const propertyId = this.getPropertyIdFromCurrentRoute();
            if (propertyId) {
              this.propertyStore.getPropertyDetails(propertyId);
            }
          }
        };
        this.cd.markForCheck();
      });
  }

  ngOnInit(): void {
    this.totalSteps = 0;
    this.currentStep = 0;

    // Initialisation des valeurs
    if (this.accessInstructions()) {
      this.totalSteps = this.getSortedInstructions(this.accessInstructions()).length;
    }

    // Écouter les changements d'étape
    this.initStepChangeListener();

    // Charger les données sauvegardées
    this.loadSavedProgress();

    // Précharger les images pour améliorer les performances
    this.preloadAllImages();
  }

  // Initialise l'écouteur pour les changements d'étape
  private initStepChangeListener(): void {
    // Attendre que le stepper soit initialisé
    setTimeout(() => {
      if (this.verticalStepper) {
        this.verticalStepper.selectionChange.subscribe(event => {
          this.currentStep = event.selectedIndex + 1;
          this.saveProgress();
        });
      }
    }, 0);
  }

  // Charge la progression sauvegardée
  private loadSavedProgress(): void {
    try {
      const savedProgress = localStorage.getItem(CHECKIN_PROGRESS_KEY);
      if (savedProgress) {
        const { propertyId, step } = JSON.parse(savedProgress);
        if (propertyId === this.propertyStore.property()?.id) {
          // Attendre que le stepper soit initialisé
          setTimeout(() => {
            if (this.verticalStepper) {
              this.verticalStepper.selectedIndex = step;
              this.currentStep = step + 1;
              this.cd.markForCheck();
            }
          }, 0);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la progression:', error);
      localStorage.removeItem(CHECKIN_PROGRESS_KEY);
    }
  }

  // Sauvegarde la progression actuelle
  @HostListener('window:beforeunload')
  saveProgress(): void {
    try {
      if (this.propertyStore.property() && this.verticalStepper) {
        localStorage.setItem(CHECKIN_PROGRESS_KEY, JSON.stringify({
          propertyId: this.propertyStore.property()?.id,
          step: this.verticalStepper.selectedIndex
        }));
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la progression:', error);
    }
  }

  // Précharge toutes les images des instructions
  private preloadAllImages(): void {
    const instructions = this.accessInstructions();
    if (!instructions) return;

    const allInstructions = this.getSortedInstructions(instructions);
    allInstructions.forEach(instruction => {
      if (instruction.images && instruction.images.length > 0) {
        instruction.images.forEach(imageSrc => {
          const img = new Image();
          img.src = imageSrc;
          this.preloadedImages.push(img);
        });
      }
    });
  }

  // Copie le texte dans le presse-papiers
  copyToClipboard(text: string | undefined): void {
    if (!text) return;
    
    const success = this.clipboard.copy(text);
    if (success) {
      this.snackBar.open('Code copié dans le presse-papiers', 'Fermer', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      });
    } else {
      this.snackBar.open('Échec de la copie', 'Fermer', {
        duration: 3000,
      });
    }
  }

  // Formate la date d'expiration
  formatExpiryDate(dateStr: string | undefined): string {
    if (!dateStr) return 'Non spécifié';
    
    try {
      const date = new Date(dateStr);
      return new DatePipe(this.document.defaultView?.navigator.language || 'fr')
        .transform(date, 'dd MMMM yyyy à HH:mm') || dateStr;
    } catch (error) {
      return dateStr;
    }
  }

  // Calcule le pourcentage de complétion
  getCompletionPercentage(): number {
    if (this.totalSteps === 0) return 0;
    if (this.checkInComplete) return 100;
    
    const currentStep = this.currentStep;
    return Math.round((currentStep / this.totalSteps) * 100);
  }

  // Action de complétion du check-in
  completeCheckin(): void {
    this.checkInComplete = true;
    localStorage.removeItem(CHECKIN_PROGRESS_KEY);
    
    this.snackBar.open('Check-in terminé avec succès!', 'Fermer', {
      duration: 5000,
      panelClass: 'success-snackbar'
    });
    
    // Redirection ou autre action après complétion
  }

  /**
   * Fonction appelée lorsque l'utilisateur clique sur le bouton "Réessayer" dans le composant d'erreur
   */
  retryOperation(): void {
    console.log('retryOperation appelé');
    
    // Réinitialiser l'état d'erreur
    this.hasError = false;
    
    // Réinitialiser l'état d'erreur dans le store
    this.propertyStore.setError(null);
    
    // Vérifier d'abord la disponibilité du service
    this.checkServiceAvailability();
    
    // Exécuter la fonction de réessai si elle existe
    if (this.retryFunction) {
      console.log('Exécution de la fonction de réessai');
      this.retryFunction();
    }
    
    // Forcer la détection de changements
    this.cd.detectChanges();
  }

  togglePassword() {
    if (this.visible) {
      this.inputType = 'password';
      this.visible = false;
    } else {
      this.inputType = 'text';
      this.visible = true;
      
      // Auto-masquage après 10 secondes pour la sécurité
      setTimeout(() => {
        this.inputType = 'password';
        this.visible = false;
        this.cd.markForCheck();
      }, 10000);
    }
    this.cd.markForCheck();
  }

  protected readonly AccessMethodTypeEnum = AccessMethodTypeEnum;
  protected readonly InstructionType = InstructionType;

  // Méthode pour déterminer si une vidéo doit être affichée
  shouldShowVideo(instruction: AccessInstructionItem): boolean {
    // Si l'utilisateur a explicitement choisi, respecter ce choix
    const key = `${instruction.step}-${instruction.title}`;
    if (this.mediaState.has(key)) {
      return this.mediaState.get(key)!;
    }
    
    // Sinon, utiliser la logique par défaut
    return !!instruction.videoUrl && 
           (!instruction.images || 
            instruction.images.length === 0 || 
            this.isComplexInstruction(instruction));
  }

  // Méthode pour déterminer si les images doivent être affichées
  shouldShowImages(instruction: AccessInstructionItem): boolean {
    // Si l'utilisateur a explicitement choisi, respecter ce choix
    const key = `${instruction.step}-${instruction.title}`;
    if (this.mediaState.has(key)) {
      return !this.mediaState.get(key)!;
    }
    
    // Sinon, utiliser la logique par défaut
    return !!instruction.images && 
           instruction.images.length > 0 && 
           (!instruction.videoUrl || 
            !this.isComplexInstruction(instruction));
  }

  // Méthode pour déterminer si une instruction est complexe (nécessite une vidéo plutôt que des images)
  private isComplexInstruction(instruction: AccessInstructionItem): boolean {
    // Une instruction est considérée comme complexe si:
    // - C'est une instruction d'accès avec une méthode spécifique
    // - Elle a une liste d'étapes détaillée
    return (this.isAccessModeItem(instruction) && instruction.methodType === AccessMethodTypeEnum.SMART_LOCK) || 
           (!!instruction.list && instruction.list.length > 3);
  }

  // Méthode pour basculer entre vidéo et images
  toggleMediaType(instruction: AccessInstructionItem, showVideo: boolean): void {
    const key = `${instruction.step}-${instruction.title}`;
    this.mediaState.set(key, showVideo);
  }

  // Vérifier si l'instruction a des médias (vidéo ou images)
  hasMedia(instruction: AccessInstructionItem): boolean {
    return (!!instruction.videoUrl || (!!instruction.images && instruction.images.length > 0));
  }

  // Vérifier si la vidéo est actuellement affichée
  isShowingVideo(instruction: AccessInstructionItem): boolean {
    const key = `${instruction.step}-${instruction.title}`;
    if (!this.mediaState.has(key)) {
      // Valeur par défaut si aucun choix n'a été fait
      return this.shouldShowVideo(instruction);
    }
    return this.mediaState.get(key)!;
  }
   
  // Méthodes pour la galerie avancée
  
  // Préparer les éléments de la galerie pour une instruction
  prepareGalleryItems(instruction: AccessInstructionItem): GalleryItem[] {
    const instructionKey = `${instruction.step}-${instruction.title}`;
    
    if (!this.galleryItems.has(instructionKey) && instruction.images && instruction.images.length > 0) {
      const items: GalleryItem[] = instruction.images.map((img, index) => ({
        src: img,
        thumb: img,
        title: `${instruction.title} - ${this.translateStep()} ${index + 1}/${instruction.images?.length}`,
        description: this.translateFollowSequence(),
        order: index + 1
      }));
      
      this.galleryItems.set(instructionKey, items);
    }
    
    return this.galleryItems.get(instructionKey) || [];
  }
  
  // Ouvrir la galerie en mode lightbox
  openGallery(instruction: AccessInstructionItem, index: number = 0): void {
    if (!instruction || !instruction.images || instruction.images.length === 0) return;
    
    const instructionKey = `${instruction.step}-${instruction.title}`;
    this.currentInstructionKey = instructionKey;
    this.currentImageIndex = Math.min(index, instruction.images.length - 1); // Ensure index is valid
    this.lightboxOpen = true;
    
    // Ensure gallery items are prepared
    this.prepareGalleryItems(instruction);
    
    // Désactiver le défilement du corps lorsque la galerie est ouverte
    if (this.document?.body) {
      this.document.body.style.overflow = 'hidden';
    }
    
    // Précharger les images adjacentes pour une navigation fluide
    this.preloadAdjacentImages();
    
    this.cd.markForCheck();
  }
  
  // Précharge les images adjacentes à l'image actuellement affichée
  private preloadAdjacentImages(): void {
    const items = this.getAllGalleryItems();
    if (items.length <= 1) return;
    
    const nextIndex = (this.currentImageIndex + 1) % items.length;
    const prevIndex = (this.currentImageIndex - 1 + items.length) % items.length;
    
    // Préchargement des images suivante et précédente
    const nextImg = new Image();
    nextImg.src = items[nextIndex].src;
    
    const prevImg = new Image();
    prevImg.src = items[prevIndex].src;
  }
  
  // Fermer la galerie lightbox
  closeGallery(): void {
    this.lightboxOpen = false;
    // Réactiver le défilement
    if (this.document?.body) {
      this.document.body.style.overflow = '';
    }
    this.cd.markForCheck();
  }
  
  // Naviguer dans la galerie
  navigate(direction: 'prev' | 'next'): void {
    if (!this.hasMultipleGalleryItems()) return;
    
    const itemsCount = this.getGalleryItemsCount();
    
    if (direction === 'prev') {
      this.currentImageIndex = (this.currentImageIndex - 1 + itemsCount) % itemsCount;
    } else {
      this.currentImageIndex = (this.currentImageIndex + 1) % itemsCount;
    }
    
    // Précharger les images adjacentes pour une navigation fluide
    setTimeout(() => this.preloadAdjacentImages(), 0);
    
    this.cd.markForCheck();
  }
  
  // Écouter les touches du clavier pour la navigation
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (!this.lightboxOpen) return;
    
    if (event.key === 'Escape') {
      this.closeGallery();
    } else if (event.key === 'ArrowLeft') {
      this.navigate('prev');
    } else if (event.key === 'ArrowRight') {
      this.navigate('next');
    }
  }
  
  // Méthodes d'aide pour les traductions
  translateStep(): string {
    // En production, utilisez le service de traduction
    return 'Étape';
  }
  
  translateFollowSequence(): string {
    // En production, utilisez le service de traduction
    return 'Suivez les étapes dans l\'ordre indiqué';
  }

  // Méthodes auxiliaires pour l'accès sécurisé à la galerie
  
  // Vérifier si la galerie a plusieurs éléments
  hasMultipleGalleryItems(): boolean {
    if (!this.currentInstructionKey || !this.galleryItems) return false;
    const items = this.galleryItems.get(this.currentInstructionKey);
    return !!items && items.length > 1;
  }
  
  // Vérifier si la galerie a au moins un élément
  hasGalleryItems(): boolean {
    if (!this.currentInstructionKey || !this.galleryItems) return false;
    const items = this.galleryItems.get(this.currentInstructionKey);
    return !!items && items.length > 0;
  }
  
  // Obtenir un élément spécifique de la galerie avec gestion d'erreur
  getGalleryItem(index: number = this.currentImageIndex): GalleryItem | null {
    if (!this.currentInstructionKey || !this.galleryItems) return null;
    const items = this.galleryItems.get(this.currentInstructionKey);
    if (!items || items.length === 0 || index >= items.length) return null;
    return items[index];
  }
  
  // Obtenir la source de l'image courante
  getCurrentImageSrc(): string | undefined {
    return this.getGalleryItem()?.src;
  }
  
  // Obtenir le titre de l'image courante
  getCurrentImageTitle(): string | undefined {
    return this.getGalleryItem()?.title;
  }
  
  // Obtenir la description de l'image courante
  getCurrentImageDescription(): string | undefined {
    return this.getGalleryItem()?.description;
  }
  
  // Obtenir le nombre total d'éléments dans la galerie
  getGalleryItemsCount(): number {
    if (!this.currentInstructionKey || !this.galleryItems) return 0;
    const items = this.galleryItems.get(this.currentInstructionKey);
    return items?.length || 0;
  }
  
  // Obtenir tous les éléments de la galerie courante
  getAllGalleryItems(): GalleryItem[] {
    if (!this.currentInstructionKey || !this.galleryItems) return [];
    return this.galleryItems.get(this.currentInstructionKey) || [];
  }

  // Méthode utilitaire pour obtenir l'ID de la propriété depuis l'URL
  private getPropertyIdFromCurrentRoute(): string | null {
    const url = window.location.pathname;
    const segments = url.split('/').filter(segment => segment.length > 0);
    
    if (segments.length >= 2) {
      return segments[1]; // L'ID est généralement le deuxième segment après le segment de base
    }
    
    return null;
  }
}


