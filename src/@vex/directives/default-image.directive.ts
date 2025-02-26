import {Directive, ElementRef, Input} from "@angular/core";
@Directive({
  selector: 'img[defaultImage]',
  host: {
    '(error)': 'onError()',
  },
  standalone: true
})
export class DefaultImageDirective {
  @Input() defaultImage!: string;
    constructor(private el: ElementRef<HTMLImageElement>) { }
    onError() {
      const element = this.el.nativeElement;
      element.src = this.defaultImage;
    }
}
