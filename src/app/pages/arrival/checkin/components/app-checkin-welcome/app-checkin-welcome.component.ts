import {Component, Input} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {NgClass, NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import {MatButtonModule} from "@angular/material/button";
import {scaleInOutAnimation} from "@app/animations/scale-in-out.animation";

@Component({
  selector: 'app-checkin-welcome',
  templateUrl: './app-checkin-welcome.component.html',
  styleUrls: ['./app-checkin-welcome.component.scss'],
  standalone: true,
  animations: [scaleInOutAnimation],
  imports: [MatIconModule, NgIf, MatButtonModule, NgForOf, NgClass, NgOptimizedImage]
})
export class AppCheckinWelcomeComponent {
  constructor() {
  }

  showButton: boolean = false;
  isVisible: boolean = true;


  @Input({required: true}) item!: AppCheckinWelcomeItem;

  close() {
    this.isVisible = false;
  }
}

export interface AppCheckinWelcomeItem {
  title?: string;
  subtitle?: string;
  icon?: string;
  colorClass?: string;
  items: {
    order: number;
    value: string;
  }[];
  button?: {
    action: string;
    icon: string;
  },
  completed?: boolean;
}
