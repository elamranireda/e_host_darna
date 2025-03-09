import { Directive, ElementRef, HostListener, Input, Renderer2, inject, AfterViewInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

@Directive({
  selector: '[appClipboard]',
  standalone: true
})
export class ClipboardDirective implements AfterViewInit {
  @Input('appClipboard') textToCopy: string = '';
  @Input() clipboardSuccessMessage: string = 'CONTACT.CLIPBOARD.COPIED';
  @Input() clipboardTitle: string = '';
  
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);
  private snackBar = inject(MatSnackBar);
  private translateService = inject(TranslateService);
  
  constructor() {
    // Ajouter une classe pour indiquer que l'élément est copiable
    this.renderer.addClass(this.el.nativeElement, 'cursor-pointer');
    this.renderer.addClass(this.el.nativeElement, 'can-copy');
  }
  
  ngAfterViewInit() {
    // Créer et ajouter l'icône après l'initialisation de la vue
    const iconSpan = this.renderer.createElement('span');
    this.renderer.addClass(iconSpan, 'copy-icon');
    this.renderer.addClass(iconSpan, 'text-gray-400');
    this.renderer.addClass(iconSpan, 'text-sm');
    this.renderer.addClass(iconSpan, 'ml-2');
    
    const iconElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    iconElement.setAttribute('width', '16');
    iconElement.setAttribute('height', '16');
    iconElement.setAttribute('viewBox', '0 0 24 24');
    iconElement.setAttribute('fill', 'currentColor');
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z');
    
    iconElement.appendChild(path);
    iconSpan.appendChild(iconElement);
    
    this.renderer.appendChild(this.el.nativeElement, iconSpan);
  }
  
  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    // Empêcher la propagation de l'événement pour éviter les effets indésirables
    event.stopPropagation();
    
    const textToCopy = this.textToCopy || this.el.nativeElement.innerText;
    
    // Utiliser l'API du presse-papier
    navigator.clipboard.writeText(textToCopy).then(() => {
      this.showCopyAnimation();
      this.showFeedback();
    }).catch(err => {
      console.error('Impossible de copier le texte: ', err);
    });
  }
  
  private showCopyAnimation(): void {
    // Ajouter une animation temporaire
    this.renderer.addClass(this.el.nativeElement, 'copy-success');
    setTimeout(() => {
      this.renderer.removeClass(this.el.nativeElement, 'copy-success');
    }, 1000);
  }
  
  private showFeedback(): void {
    let title = '';
    let message = '';
    
    if (this.clipboardTitle) {
      title = this.translateService.instant(this.clipboardTitle);
    }
    
    message = title 
      ? `${title} ${this.translateService.instant(this.clipboardSuccessMessage)}` 
      : this.translateService.instant(this.clipboardSuccessMessage);
    
    this.snackBar.open(message, this.translateService.instant('COMMON.CLOSE'), {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }
} 