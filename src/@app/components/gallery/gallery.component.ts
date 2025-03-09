import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { GalleryItem } from '@app/interfaces/gallery-item.interface';

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
  @Input() items: GalleryItem[] = [];
  @Input() gridCols: number = 3;
  @Input() thumbnailSize: number = 150;
  @Input() lightboxOpen: boolean = false;
  @Output() lightboxClosed = new EventEmitter<void>();

  currentImageIndex: number = 0;

  hasItems(): boolean {
    return this.items.length > 0;
  }

  hasMultipleItems(): boolean {
    return this.items.length > 1;
  }

  openLightbox(index: number): void {
    this.currentImageIndex = index;
    this.lightboxOpen = true;
  }

  closeLightbox(): void {
    this.lightboxOpen = false;
    this.lightboxClosed.emit();
  }

  navigate(direction: 'prev' | 'next'): void {
    if (!this.hasMultipleItems()) return;

    if (direction === 'prev') {
      this.currentImageIndex = (this.currentImageIndex - 1 + this.items.length) % this.items.length;
    } else {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.items.length;
    }
  }

  getCurrentItem(): GalleryItem | null {
    return this.items[this.currentImageIndex] || null;
  }

  getItemsCount(): number {
    return this.items.length;
  }
} 