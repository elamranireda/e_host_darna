import { Component, OnInit, TemplateRef } from '@angular/core';
import { AppPopoverContent, AppPopoverRef } from './app-popover-ref';
import { popoverAnimation } from '../../animations/popover.animation';
import {
  NgComponentOutlet,
  NgSwitch,
  NgSwitchCase,
  NgTemplateOutlet
} from '@angular/common';

@Component({
  selector: 'app-popover',
  templateUrl: './app-popover.component.html',
  styleUrls: ['./app-popover.component.scss'],
  animations: [popoverAnimation],
  standalone: true,
  imports: [NgSwitch, NgSwitchCase, NgTemplateOutlet, NgComponentOutlet]
})
export class AppPopoverComponent implements OnInit {
  renderMethod: 'template' | 'component' | 'text' = 'component';
  content: AppPopoverContent;
  context: any;

  constructor(private popoverRef: AppPopoverRef) {}

  ngOnInit() {
    this.content = this.popoverRef.content;

    if (typeof this.content === 'string') {
      this.renderMethod = 'text';
    }

    if (this.content instanceof TemplateRef) {
      this.renderMethod = 'template';
      this.context = {
        close: this.popoverRef.close.bind(this.popoverRef)
      };
    }
  }
}
