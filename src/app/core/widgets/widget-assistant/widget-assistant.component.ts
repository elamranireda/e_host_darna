import {Component, Input} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {NgClass, NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import {MatButtonModule} from "@angular/material/button";
import {scaleInOutAnimation} from "@vex/animations/scale-in-out.animation";
import {WidgetAssistant} from "../../interfaces/widget-assistant.interface";

@Component({
  selector: 'app-widget-assistant',
  templateUrl: './widget-assistant.component.html',
  styleUrls: ['./widget-assistant.component.scss'],
  standalone: true,
  animations: [scaleInOutAnimation],
  imports: [MatIconModule, NgIf, MatButtonModule, NgForOf, NgClass, NgOptimizedImage]
})
export class WidgetAssistantComponent {
  constructor() {
  }

  showButton: boolean = false;
  isVisible: boolean = true;


  @Input({required: true}) item!: WidgetAssistant;

  close() {
    this.isVisible = false;
  }
}

