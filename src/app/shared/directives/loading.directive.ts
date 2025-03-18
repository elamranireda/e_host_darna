import { Directive, Input, OnChanges, SimpleChanges, ElementRef, OnDestroy, inject, Renderer2 } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Directive({
  selector: '[appLoading]',
  standalone: true
})
export class LoadingDirective implements OnChanges, OnDestroy {
  @Input('appLoading') loading = false;
  @Input() diameter = 40;
  
  private loadingElement: HTMLElement | null = null;
  private originalPositionValue: string | null = null;
  private translateService = inject(TranslateService);
  private renderer = inject(Renderer2);

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['loading']) {
      if (this.loading) {
        this.showLoading();
      } else {
        this.hideLoading();
      }
    }
  }

  private showLoading(): void {
    // Ne rien faire si le loader est déjà visible
    if (this.loadingElement) {
      return;
    }

    // S'assurer que l'élément hôte est positionné correctement
    const computedStyle = window.getComputedStyle(this.el.nativeElement);
    this.originalPositionValue = computedStyle.position;
    if (computedStyle.position === 'static') {
      this.el.nativeElement.style.position = 'relative';
    }

    // Créer le conteneur de loading qui sera superposé
    this.loadingElement = document.createElement('div');
    this.loadingElement.classList.add('loading-container');
    
    // Styles pour l'overlay
    this.loadingElement.style.position = 'absolute';
    this.loadingElement.style.top = '0';
    this.loadingElement.style.left = '0';
    this.loadingElement.style.width = '100%';
    this.loadingElement.style.height = '100%';
    this.loadingElement.style.display = 'flex';
    this.loadingElement.style.flexDirection = 'column';
    this.loadingElement.style.alignItems = 'center';
    this.loadingElement.style.justifyContent = 'center';
    this.loadingElement.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
    this.loadingElement.style.zIndex = '1000';
    
    // Créer un spinner en HTML
    const spinner = document.createElement('div');
    spinner.classList.add('spinner');
    spinner.style.width = `${this.diameter}px`;
    spinner.style.height = `${this.diameter}px`;
    spinner.style.border = '4px solid rgba(0, 0, 0, 0.1)';
    spinner.style.borderRadius = '50%';
    spinner.style.borderTopColor = '#3f51b5';
    spinner.style.animation = 'spin 1s linear infinite';
    
    // Ajouter le texte de chargement
    const textElement = document.createElement('p');
    textElement.style.marginTop = '10px';
    textElement.textContent = this.translateService.instant('COMMON.LOADING');
    
    // Créer le style pour l'animation
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    
    // Assembler les éléments
    this.loadingElement.appendChild(spinner);
    this.loadingElement.appendChild(textElement);
    document.head.appendChild(styleElement);
    
    // Ajouter l'overlay à l'élément hôte
    this.el.nativeElement.appendChild(this.loadingElement);
  }

  private hideLoading(): void {
    if (this.loadingElement && this.loadingElement.parentNode) {
      this.el.nativeElement.removeChild(this.loadingElement);
      this.loadingElement = null;
      
      // Restaurer la position originale si nécessaire
      if (this.originalPositionValue && this.originalPositionValue !== 'relative') {
        this.el.nativeElement.style.position = this.originalPositionValue;
      }
    }
  }

  ngOnDestroy(): void {
    this.hideLoading();
  }
}
