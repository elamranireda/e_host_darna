import { Component, Input, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-breadcrumb',
  template: ` <ng-content></ng-content> `,
  styles: [],
  host: {
    class:
      'app-breadcrumb body-2 text-hint leading-none hover:text-primary-600 no-underline transition duration-400 ease-out-swift',
    '[class.cursor-pointer]': 'clickable'
  },
  standalone: true,
  imports: [RouterLink]
})
export class AppBreadcrumbComponent {
  // Permet de définir si le breadcrumb est cliquable
  @Input() clickable: boolean = true;
  
  // Host Listener pour gérer les événements de clic si nécessaire
  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    // L'événement sera géré par le routerLink si présent
    // On peut ajouter une logique supplémentaire ici si nécessaire
  }
}
