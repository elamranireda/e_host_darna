import {
  Component,
  HostBinding,
  Input,
  ViewEncapsulation
} from '@angular/core';

@Component({
  selector: 'app-page-layout',
  template: '<ng-content></ng-content>',
  host: {
    class: 'app-page-layout'
  },
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./app-page-layout.component.scss'],
  standalone: true
})
export class AppPageLayoutComponent {
  @Input() mode: 'card' | 'simple' = 'simple';

  constructor() {}

  @HostBinding('class.app-page-layout-card')
  get isCard() {
    return this.mode === 'card';
  }

  @HostBinding('class.app-page-layout-simple')
  get isSimple() {
    return this.mode === 'simple';
  }
}
