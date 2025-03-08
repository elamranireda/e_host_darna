import {ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, inject, OnInit, Signal, ViewChild} from '@angular/core';
import {scaleIn400ms} from '@app/animations/scale-in.animation';
import {fadeInRight400ms} from '@app/animations/fade-in-right.animation';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {CommonModule, DOCUMENT, NgFor} from '@angular/common';
import {MatTabsModule} from '@angular/material/tabs';
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {MatRippleModule} from "@angular/material/core";
import {SocialTimelineEntryComponent} from "./components/social-timeline-entry/social-timeline-entry.component";
import {fadeInUp400ms} from "@app/animations/fade-in-up.animation";
import {stagger40ms, stagger80ms} from "@app/animations/stagger.animation";
import {MatStepperModule, MatStepper} from "@angular/material/stepper";
import {WidgetAssistantComponent} from "../../../core/widgets/widget-assistant/widget-assistant.component";
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

// Interface pour les éléments de galerie
export interface GalleryItem {
  src: string;
  thumb?: string;
  title?: string;
  description?: string;
  order: number;
}

@Component({
  selector: 'ehost-home',
  templateUrl: './checkin.component.html',
  styleUrls: ['./checkin.component.scss'],
  animations: [fadeInUp400ms, fadeInRight400ms, scaleIn400ms, stagger40ms, stagger80ms],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatTabsModule, NgFor, RouterLinkActive, RouterLink, RouterOutlet, CommonModule, MatIconModule, MatButtonModule, MatRippleModule, MatStepperModule, WidgetAssistantComponent, MatInputModule, SocialTimelineEntryComponent, TranslatePipe]
})
export class CheckinComponent implements OnInit {
  selectCtrl: UntypedFormControl = new UntypedFormControl();
  inputType = 'password';
  visible = false;

  @ViewChild('verticalStepper') verticalStepper!: MatStepper;
  
  // Ajouter un Map pour suivre l'état d'affichage des médias pour chaque instruction
  private mediaState = new Map<string, boolean>();
  
  // Gestion de la galerie
  galleryItems: Map<string, GalleryItem[]> = new Map();
  lightboxOpen = false;
  currentImageIndex = 0;
  currentInstructionKey = '';
  
  readonly propertyStore = inject(PropertyStore);
  readonly accessInstructions = this.propertyStore.accessInstructions;
  private accessInstructionsService = inject(AccessInstructionsService);
  private document = inject(DOCUMENT);

  // Helper methods to use in the template
  isAccessModeItem = this.accessInstructionsService.isAccessModeItem.bind(this.accessInstructionsService);
  isIdentityCheckItem = this.accessInstructionsService.isIdentityCheckItem.bind(this.accessInstructionsService);
  isArrivalInstructionItem = this.accessInstructionsService.isArrivalInstructionItem.bind(this.accessInstructionsService);
  
  // Expose the sorted instructions for use in the template
  getSortedInstructions(instructions: AccessInstructions | null): AccessInstructionItem[] {
    if (!instructions) return [];
    return this.accessInstructionsService.getAllInstructionsSorted(instructions);
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
    }
  }

  constructor(private cd: ChangeDetectorRef) {
  }

  ngOnInit(): void {
  }

  togglePassword() {
    if (this.visible) {
      this.inputType = 'password';
      this.visible = false;
      this.cd.markForCheck();
    } else {
      this.inputType = 'text';
      this.visible = true;
      this.cd.markForCheck();
    }
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
    this.cd.markForCheck();
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
}

