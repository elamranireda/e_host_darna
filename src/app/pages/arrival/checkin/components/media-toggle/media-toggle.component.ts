import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-media-toggle',
  templateUrl: './media-toggle.component.html',
  styleUrls: ['./media-toggle.component.scss'],
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
   * Vérifie si les boutons de basculement doivent être affichés
   */
  get shouldShowToggle(): boolean {
    return this.hasImages && this.hasVideo;
  }

  /**
   * Bascule vers l'affichage des images
   */
  showImages(): void {
    if (this.hasImages) {
      this.mediaTypeChange.emit(false);
    }
  }

  /**
   * Bascule vers l'affichage de la vidéo
   */
  showVideo(): void {
    if (this.hasVideo) {
      this.mediaTypeChange.emit(true);
    }
  }
} 