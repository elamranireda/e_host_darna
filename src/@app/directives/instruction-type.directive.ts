import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { InstructionType } from '../../app/core/access-instructions/access-instruction-item.interface';

@Directive({
  selector: '[appInstructionType]',
  standalone: true
})
export class InstructionTypeDirective implements OnInit {
  @Input('appInstructionType') type!: InstructionType;

  private readonly typeClasses: Record<InstructionType, string> = {
    [InstructionType.ACCESS_MODE]: 'instruction-access',
    [InstructionType.IDENTITY_CHECK]: 'instruction-identity',
    [InstructionType.ARRIVAL_INSTRUCTION]: 'instruction-arrival'
  };

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    if (!this.type) {
      console.warn('InstructionTypeDirective: No type provided');
      return;
    }

    const className = this.typeClasses[this.type];
    if (className) {
      this.renderer.addClass(this.el.nativeElement, className);
      
      // Ajouter une classe de base pour tous les types d'instructions
      this.renderer.addClass(this.el.nativeElement, 'instruction-item');
    }
  }
} 