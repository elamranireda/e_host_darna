import {Component, inject} from '@angular/core';
import { NavigationService } from '../../../core/navigation/navigation.service';
import { NavigationItemComponent } from './navigation-item/navigation-item.component';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { NavigationItem } from '../../../core/navigation/navigation-item.interface';
import { NavigationLoaderService } from 'src/app/core/navigation/navigation-loader.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
  standalone: true,
  imports: [NgFor, NavigationItemComponent, AsyncPipe, NgIf]
})
export class NavigationComponent {
  protected navigationService = inject(NavigationLoaderService);
}
