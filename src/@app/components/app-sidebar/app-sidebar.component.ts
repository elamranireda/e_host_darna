import { Component, Inject, Input, OnDestroy } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  templateUrl: './app-sidebar.component.html',
  styleUrls: ['./app-sidebar.component.scss'],
  host: {
    class: 'app-sidebar'
  },
  standalone: true
})
export class AppSidebarComponent implements OnDestroy {
  @Input() position: 'left' | 'right' = 'left';
  @Input() invisibleBackdrop: boolean = false;

  constructor(@Inject(DOCUMENT) private document: Document) {}

  private _opened: boolean = false;

  get opened() {
    return this._opened;
  }

  @Input() set opened(opened: boolean) {
    this._opened = opened;
    opened ? this.enableScrollblock() : this.disableScrollblock();
  }

  get positionLeft() {
    return this.position === 'left';
  }

  get positionRight() {
    return this.position === 'right';
  }

  enableScrollblock() {
    if (!this.document.body.classList.contains('app-scrollblock')) {
      this.document.body.classList.add('app-scrollblock');
    }
  }

  disableScrollblock() {
    if (this.document.body.classList.contains('app-scrollblock')) {
      this.document.body.classList.remove('app-scrollblock');
    }
  }

  open() {
    this.opened = true;
  }

  close() {
    this.opened = false;
  }

  ngOnDestroy(): void {}
}
