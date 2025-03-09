import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import {NgForOf, NgIf, NgOptimizedImage} from '@angular/common';
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {stagger40ms} from "@app/animations/stagger.animation";
import {scaleIn400ms} from "@app/animations/scale-in.animation";

@Component({
  selector: 'app-access-instruction-content',
  templateUrl: './app-access-instruction-content.component.html',
  styleUrls: ['./app-access-instruction-content.component.scss'],
  animations: [stagger40ms, scaleIn400ms],
  standalone: true,
  imports: [NgIf, MatRippleModule, MatIconModule, NgForOf, NgOptimizedImage]
})
export class AppAccessInstructionContentComponent implements OnInit, OnChanges {
  @Input() avatarUrl!: string;
  @Input() name!: string;
  @Input() time?: string;
  @Input() videoUrl?: string | undefined;
  @Input() imageUrls?: string[];
  @Input() likes!: string;
  @Input() comments!: string;

  safeLink: SafeResourceUrl | null = null;
  
  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.updateSafeLink();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    // Mettre à jour le lien sécurisé quand videoUrl change
    if (changes['videoUrl']) {
      this.updateSafeLink();
    }
  }
  
  private updateSafeLink(): void {
    if (this.videoUrl) {
      this.safeLink = this.sanitizer.bypassSecurityTrustResourceUrl(this.videoUrl);
    } else {
      this.safeLink = null;
    }
  }
}
