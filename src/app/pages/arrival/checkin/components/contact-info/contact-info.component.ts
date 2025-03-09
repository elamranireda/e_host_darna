import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { scaleIn400ms } from '@app/animations/scale-in.animation';
import { fadeInRight400ms } from '@app/animations/fade-in-right.animation';
import { CheckinContactItem } from '../../../../../core/access-instructions/access-instruction-item.interface';

@Component({
  selector: 'app-contact-info',
  templateUrl: './contact-info.component.html',
  styleUrls: ['./contact-info.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    TranslateModule
  ],
  animations: [
    scaleIn400ms,
    fadeInRight400ms
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactInfoComponent {
  /**
   * Liste des contacts à afficher
   */
  @Input() contacts: CheckinContactItem[] = [];
  
  /**
   * Titre de la section contacts
   */
  @Input() title: string = 'CHECKIN.CONTACT_TITLE';
} 