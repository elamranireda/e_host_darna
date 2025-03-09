import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-media-toggle',
  template: `
    <div class="media-toggle-container" *ngIf="hasImages || hasVideo">
      <div class="media-toggle-buttons">
        <button mat-flat-button
                [color]="isShowingVideo ? 'basic' : 'primary'"
                [class.active]="!isShowingVideo"
                (click)="showImages()"
                [disabled]="!hasImages">
          <mat-icon svgIcon="mat:photo_library" class="icon-sm"></mat-icon>
          <span>{{ 'MEDIA.SHOW_PHOTOS' | translate }}</span>
        </button>
        <button mat-flat-button
                [color]="!isShowingVideo ? 'basic' : 'primary'"
                [class.active]="isShowingVideo"
                (click)="showVideo()"
                [disabled]="!hasVideo">
          <mat-icon svgIcon="mat:videocam" class="icon-sm"></mat-icon>
          <span>{{ 'MEDIA.SHOW_VIDEO' | translate }}</span>
        </button>
      </div>
    </div>
  `,
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaToggleComponent {
  /**
   * Indique si la vidéo est actuellement affichée
   */
  @Input() isShowingVideo: boolean = false;

  /**
   * Indique si des images sont disponibles
   */
  @Input() hasImages: boolean = false;

  /**
   * Indique si une vidéo est disponible
   */
  @Input() hasVideo: boolean = false;

  /**
   * Événement émis lors du changement de type de média
   */
  @Output() mediaTypeChange = new EventEmitter<boolean>();

  /**
   * Bascule vers l'affichage des images
   */
  showImages(): void {
    console.log('Showing images');
    this.mediaTypeChange.emit(false);
  }

  /**
   * Bascule vers l'affichage de la vidéo
   */
  showVideo(): void {
    console.log('Showing video');
    this.mediaTypeChange.emit(true);
  }
} 