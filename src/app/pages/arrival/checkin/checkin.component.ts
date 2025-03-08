import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit, Signal} from '@angular/core';
import {scaleIn400ms} from '@vex/animations/scale-in.animation';
import {fadeInRight400ms} from '@vex/animations/fade-in-right.animation';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {CommonModule, NgFor} from '@angular/common';
import {MatTabsModule} from '@angular/material/tabs';
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {MatRippleModule} from "@angular/material/core";
import {SocialTimelineEntryComponent} from "./components/social-timeline-entry/social-timeline-entry.component";
import {fadeInUp400ms} from "@vex/animations/fade-in-up.animation";
import {stagger40ms, stagger80ms} from "@vex/animations/stagger.animation";
import {MatStepperModule} from "@angular/material/stepper";
import {WidgetAssistantComponent} from "../../../core/widgets/widget-assistant/widget-assistant.component";
import {AccessInstructions, AccessMethodeTypeEnum} from "../../../core/interfaces/access-instruction-item.interface";
import {PropertyStore} from "../../../core/property/property.store";
import {MatInputModule} from "@angular/material/input";
import {UntypedFormControl} from "@angular/forms";


@Component({
  selector: 'ehost-home',
  templateUrl: './checkin.component.html',
  styleUrls: ['./checkin.component.scss'],
  animations: [fadeInUp400ms, fadeInRight400ms, scaleIn400ms, stagger40ms, stagger80ms],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatTabsModule, NgFor, RouterLinkActive, RouterLink, RouterOutlet, CommonModule, MatIconModule, MatButtonModule, MatRippleModule, SocialTimelineEntryComponent, MatStepperModule, WidgetAssistantComponent, MatInputModule]
})
export class CheckinComponent implements OnInit {
  selectCtrl: UntypedFormControl = new UntypedFormControl();
  inputType = 'password';
  visible = false;

  readonly propertyStrore = inject(PropertyStore);
  accessInstructions: Signal<AccessInstructions | null> = this.propertyStrore.accessInstructions;

  constructor(private cd: ChangeDetectorRef) {
  }

  ngOnInit(): void {
  }

  togglePassword() {
    if (this.visible) {
      this.inputType = 'password';
      this.visible = false;
      this.cd.markForCheck();
    } else {
      this.inputType = 'text';
      this.visible = true;
      this.cd.markForCheck();
    }
  }

  protected readonly AccessMethodeTypeEnum = AccessMethodeTypeEnum;
}

