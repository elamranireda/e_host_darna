import {inject, Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, Router} from "@angular/router";
import {PropertyStore} from "../property/property.store";
import {LanguageService} from "@app/services/language-service";
import {AppConfigService} from "@app/config/app-config.service";
import {AppConfigStore} from "@app/config/app-config.store";
import { AppSplashScreenService } from '@app/services/app-splash-screen.service';

@Injectable({
  providedIn: 'root'
})
export class NavigationConfigResolver implements Resolve<any> {
  readonly propertyStore = inject(PropertyStore);
  readonly appConfigService = inject(AppConfigService);
  readonly appConfigStore = inject(AppConfigStore);
  readonly router = inject(Router);
  readonly splashScreenService = inject(AppSplashScreenService);

  constructor(private languageService: LanguageService) {
  }

  async resolve(route: ActivatedRouteSnapshot): Promise<string> {
    const id = route.paramMap?.get('id') ?? '';
    console.log('Résolution navigation avec ID:', id);
    
    if (id) {
      try {
        // 1. Charger les configurations avec l'ID de propriété
        console.log('Chargement des configurations pour la propriété:', id);
        await this.appConfigService.loadConfigsWithPropertyId(id);
        
        // 2. Charger les détails de la propriété
        console.log('Chargement des détails de propriété pour ID:', id);
        this.propertyStore.getPropertyDetails(id);
        
        console.log('Configuration et navigation chargées avec succès pour la propriété:', id);
        return id;
      } catch (error) {
        console.error('Erreur lors du chargement des configurations dans le resolver:', error);
        
        // S'assurer que le splash screen est masqué
        try {
          this.splashScreenService.hide();
        } catch (splashError) {
          console.warn('Impossible de masquer le splash screen depuis le resolver:', splashError);
        }
        
        // Redirection de secours au cas où le service n'a pas redirigé
        if (!this.router.navigated) {
          console.log('Redirection de secours vers la page d\'erreur depuis le resolver');
          setTimeout(() => {
            this.router.navigateByUrl('/error-500');
          }, 0);
        }
        
        return id; // Retourner l'ID même en cas d'erreur pour éviter d'autres erreurs
      }
    } else {
      console.warn('Aucun ID de propriété trouvé dans la route');
      return '';
    }
  }
}
