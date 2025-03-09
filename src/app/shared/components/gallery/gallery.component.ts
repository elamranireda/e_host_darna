import { 
  ChangeDetectionStrategy, 
  Component, 
  EventEmitter, 
  HostListener, 
  Input, 
  Output, 
  inject 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { GalleryItem } from '../../interfaces/gallery-item.interface';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GalleryComponent {
  /**
   * Liste des éléments de la galerie
   */
  @Input() items: GalleryItem[] = [];

  /**
   * Nombre de colonnes dans la grille (responsive)
   */
  @Input() gridCols: number = 4;

  /**
   * Taille des vignettes en pixels
   */
  @Input() thumbnailSize: number = 150;

  /**
   * État d'ouverture du lightbox
   */
  @Input() lightboxOpen: boolean = false;

  /**
   * Événement émis lors de la fermeture du lightbox
   */
  @Output() lightboxClosed = new EventEmitter<void>();

  /**
   * Index de l'image actuellement affichée
   */
  currentImageIndex: number = 0;

  /**
   * Images préchargées pour une navigation fluide
   */
  private preloadedImages: HTMLImageElement[] = [];

  /**
   * Ouvre le lightbox avec une image spécifique
   */
  openLightbox(index: number = 0): void {
    this.currentImageIndex = Math.min(Math.max(0, index), this.items.length - 1);
    this.lightboxOpen = true;
    this.preloadAdjacentImages();
    document.body.style.overflow = 'hidden';
  }

  /**
   * Ferme le lightbox
   */
  closeLightbox(): void {
    this.lightboxOpen = false;
    document.body.style.overflow = '';
    this.lightboxClosed.emit();
  }

  /**
   * Navigation dans la galerie
   */
  navigate(direction: 'prev' | 'next'): void {
    if (!this.hasMultipleItems()) return;

    if (direction === 'prev') {
      this.currentImageIndex = this.currentImageIndex > 0 
        ? this.currentImageIndex - 1 
        : this.items.length - 1;
    } else {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.items.length;
    }

    this.preloadAdjacentImages();
  }

  /**
   * Précharge les images adjacentes
   */
  private preloadAdjacentImages(): void {
    if (this.items.length <= 1) return;

    const nextIndex = (this.currentImageIndex + 1) % this.items.length;
    const prevIndex = this.currentImageIndex > 0 
      ? this.currentImageIndex - 1 
      : this.items.length - 1;

    [nextIndex, prevIndex].forEach(index => {
      const img = new Image();
      img.src = this.items[index].src;
      this.preloadedImages.push(img);
    });
  }

  /**
   * Gestion des événements clavier
   */
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (!this.lightboxOpen) return;

    switch (event.key) {
      case 'ArrowLeft':
        this.navigate('prev');
        break;
      case 'ArrowRight':
        this.navigate('next');
        break;
      case 'Escape':
        this.closeLightbox();
        break;
    }
  }

  /**
   * Vérifie s'il y a plusieurs éléments dans la galerie
   */
  hasMultipleItems(): boolean {
    return this.items.length > 1;
  }

  /**
   * Vérifie s'il y a des éléments dans la galerie
   */
  hasItems(): boolean {
    return this.items.length > 0;
  }

  /**
   * Obtient l'élément actuellement affiché
   */
  getCurrentItem(): GalleryItem | null {
    return this.hasItems() ? this.items[this.currentImageIndex] : null;
  }

  /**
   * Obtient le nombre total d'éléments
   */
  getItemsCount(): number {
    return this.items.length;
  }
} 