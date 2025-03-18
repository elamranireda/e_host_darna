import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { AppConfigService } from '@app/config/app-config.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'vex-error404',
  templateUrl: './error-404.component.html',
  styleUrls: ['./error-404.component.scss'],
  standalone: true,
  imports: [MatIconModule, MatButtonModule, RouterModule, TranslateModule]
})
export class Error404Component implements OnInit {
  // ID de propriété actuel si disponible
  propertyId: string | null = null;
  
  constructor(
    private router: Router,
    private location: Location,
    private configService: AppConfigService,
    private translateService: TranslateService
  ) {}

  ngOnInit() {
    // Récupérer l'ID de propriété depuis le service de configuration
    this.propertyId = this.configService.propertyId;
  }
  
  /**
   * Retourne à la page précédente si possible
   */
  goBack(): void {
    this.location.back();
  }
  
  /**
   * Navigue vers la page d'accueil de la propriété si un ID existe,
   * sinon navigue vers la racine du site
   */
  goHome(): void {
    if (this.propertyId) {
      this.router.navigateByUrl(`/${this.propertyId}`);
    } else {
      this.router.navigateByUrl('/');
    }
  }
}
