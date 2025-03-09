import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { TranslateModule } from '@ngx-translate/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { 
  AccessInstructionItem, 
  AccessModeItem, 
  IdentityCheckItem, 
  ArrivalInstructionItem,
  InstructionType,
  AccessMethodTypeEnum
} from '../../../../../core/access-instructions/access-instruction-item.interface';
import { AccessInstructionsService } from '../../../../../core/access-instructions/access-instructions.service';
import { AppAccessInstructionContentComponent } from '../app-access-instruction-content/app-access-instruction-content.component';
import { StepNavigationComponent } from '../step-navigation/step-navigation.component';
import { AccessCodeComponent } from '../access-code/access-code.component';
import { MediaToggleComponent } from '../media-toggle/media-toggle.component';
import { GalleryComponent } from '@app/components/gallery/gallery.component';
import { GalleryItem } from '@app/interfaces/gallery-item.interface';
import { InstructionTypeDirective } from '@app/directives/instruction-type.directive';

@Component({
  selector: 'app-instruction-step',
  templateUrl: './instruction-step.component.html',
  styleUrls: ['./instruction-step.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatStepperModule,
    TranslateModule,
    MatTooltipModule,
    AppAccessInstructionContentComponent,
    StepNavigationComponent,
    AccessCodeComponent,
    MediaToggleComponent,
    GalleryComponent,
    InstructionTypeDirective
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InstructionStepComponent implements OnInit {
  @Input() instruction!: AccessInstructionItem;
  @Input() index: number = 0;
  @Input() totalSteps: number = 1;
  @Input() isLastStep: boolean = false;
  
  @Output() navigate = new EventEmitter<'prev' | 'next'>();
  @Output() complete = new EventEmitter<void>();
  
  visible = false;
  inputType = 'password';
  
  // État du média (vidéo ou images)
  mediaState: boolean = false;
  
  // Gestion de la galerie d'images
  galleryItems: GalleryItem[] = [];
  lightboxOpen: boolean = false;
  
  private accessInstructionsService = inject(AccessInstructionsService);
  private snackBar = inject(MatSnackBar);
  private clipboard = inject(Clipboard);
  
  // Pour l'accès à partir du template
  protected readonly sanitizer = inject(DomSanitizer);
  
  constructor(private cd: ChangeDetectorRef) {}
  
  ngOnInit(): void {
    if (this.instruction.images) {
      this.galleryItems = this.instruction.images.map((image, index) => ({
        src: image,
        thumb: image,
        title: `${this.instruction.title} - Image ${index + 1}`,
        description: this.instruction.description || '',
        order: index + 1
      }));
    }
    
    // Définir l'état initial des médias en fonction de ce qui est disponible
    const hasImages = !!this.instruction.images?.length;
    const hasVideo = !!this.instruction.videoUrl;
    
    // Si uniquement la vidéo est disponible, l'afficher automatiquement
    if (hasVideo && !hasImages) {
      this.mediaState = true;
    }
    // Si uniquement les images sont disponibles ou si les deux types de médias sont disponibles,
    // afficher les images par défaut
    else {
      this.mediaState = false;
    }
  }
  
  // Méthodes de gestion des médias
  shouldShowVideo(): boolean {
    return this.isShowingVideo();
  }
  
  shouldShowImages(): boolean {
    return !this.isShowingVideo() && !!this.instruction.images && this.instruction.images.length > 0;
  }
  
  toggleMediaType(showVideo: boolean): void {
    this.mediaState = showVideo;
    this.cd.markForCheck();
  }
  
  hasMedia(): boolean {
    return !!(this.instruction.videoUrl || (this.instruction.images && this.instruction.images.length > 0));
  }
  
  isShowingVideo(): boolean {
    return this.mediaState;
  }
  
  // Méthodes de gestion de la galerie
  closeGallery(): void {
    this.lightboxOpen = false;
    this.cd.markForCheck();
  }
  
  // Méthodes de navigation
  onNavigate(direction: 'prev' | 'next'): void {
    this.navigate.emit(direction);
  }
  
  onComplete(): void {
    this.complete.emit();
  }
  
  // Type guards
  isAccessModeItem = this.accessInstructionsService.isAccessModeItem.bind(this.accessInstructionsService);
  isIdentityCheckItem = this.accessInstructionsService.isIdentityCheckItem.bind(this.accessInstructionsService);
  isArrivalInstructionItem = this.accessInstructionsService.isArrivalInstructionItem.bind(this.accessInstructionsService);
  
  protected readonly AccessMethodTypeEnum = AccessMethodTypeEnum;
  protected readonly InstructionType = InstructionType;
  
  copyToClipboard(text: string | undefined): void {
    if (!text) return;
    
    this.clipboard.copy(text);
    this.snackBar.open('Code copied to clipboard', 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }
  
  togglePassword(): void {
    this.visible = !this.visible;
    this.inputType = this.visible ? 'text' : 'password';
    this.cd.markForCheck();
  }
  
  formatExpiryDate(dateStr: string | undefined): string {
    if (!dateStr) return '';
    
    const date = new Date(dateStr);
    return date.toLocaleString('default', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  hasMultipleGalleryItems(): boolean {
    return this.galleryItems.length > 1;
  }
  
  hasGalleryItems(): boolean {
    return this.galleryItems.length > 0;
  }
  
  getGalleryItem(index: number = 0): GalleryItem | null {
    return this.galleryItems.length > 0 && index >= 0 && index < this.galleryItems.length
      ? this.galleryItems[index]
      : null;
  }
  
  getCurrentImageSrc(): string | undefined {
    return this.getGalleryItem()?.src;
  }
  
  getCurrentImageTitle(): string | undefined {
    return this.getGalleryItem()?.title;
  }
  
  getCurrentImageDescription(): string | undefined {
    return this.getGalleryItem()?.description;
  }
  
  getGalleryItemsCount(): number {
    return this.galleryItems.length;
  }
  
  getAllGalleryItems(): GalleryItem[] {
    return this.galleryItems;
  }
} 