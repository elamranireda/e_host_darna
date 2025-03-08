import { Directive } from '@angular/core';

@Directive({
  selector: '[appPageLayoutHeader],app-page-layout-header',
  host: {
    class: 'app-page-layout-header'
  },
  standalone: true
})
export class AppPageLayoutHeaderDirective {
  constructor() {}
}
