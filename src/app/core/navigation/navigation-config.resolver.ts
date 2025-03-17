import {inject, Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve} from "@angular/router";
import {NavigationConfigStore} from "../stores/navigation-config.store";
import {PropertyStore} from "../property/property.store";
import {LanguageService} from "@app/services/language-service";
import {NavigationDropdown, NavigationItem, NavigationLink, NavigationSubheading} from "./navigation-item.interface";
import {AppConfigService} from "@app/config/app-config.service";
import {firstValueFrom, from, of} from "rxjs";
import {switchMap, take} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class NavigationConfigResolver implements Resolve<any> {
  readonly navigationConfigStore = inject(NavigationConfigStore);
  readonly propertyStore = inject(PropertyStore);
  readonly appConfigService = inject(AppConfigService);

  constructor(private languageService: LanguageService) {
  }

  async resolve(route: ActivatedRouteSnapshot): Promise<string> {
    const id = route.paramMap?.get('id') ?? '';
    console.log('Résolution navigation avec ID:', id);
    console.log('Info langue:', this.languageService.getCurrentLanguageInfo());
    
    try {
      // Attendre brièvement pour permettre aux configurations de se charger si possible
      if (!this.appConfigService.initialized) {
        console.log('AppConfig pas encore initialisé, tentative d\'attente...');
        try {
          // Attendre au maximum 2 secondes pour le chargement de la configuration
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Délai d\'attente pour AppConfig dépassé')), 2000)
          );
          
          await Promise.race([
            firstValueFrom(this.appConfigService.configsLoaded$),
            timeoutPromise
          ]);
          
          console.log('AppConfig initialisé avec succès');
        } catch (error) {
          console.warn('Impossible d\'attendre l\'initialisation de AppConfig, continuation du processus:', error);
          // Continuer même en cas d'échec
        }
      }
      
      // Vérifier si la navigation est déjà disponible dans AppConfig
      let navigationFound = false;
      
      // Tenter d'obtenir la navigation depuis AppConfigService
      try {
        // Obtenir la configuration actuelle (on évite d'utiliser une méthode qui n'existe pas)
        const currentConfig = await firstValueFrom(this.appConfigService.config$);
        
        if (currentConfig && currentConfig.navigation && currentConfig.navigation.items) {
          console.log('Navigation déjà disponible dans AppConfig, réutilisation');
          // Mettre à jour le NavigationConfigStore avec les données existantes
          this.navigationConfigStore.setNavigationConfig({
            items: currentConfig.navigation.items,
            propertyId: id
          });
          navigationFound = true;
        }
      } catch (error) {
        console.warn('Erreur lors de l\'accès à la configuration:', error);
      }
      
      // Si la navigation n'a pas été trouvée, la charger depuis l'API
      if (!navigationFound) {
        console.log('Navigation non disponible dans AppConfig, chargement depuis l\'API');
        this.navigationConfigStore.getNavigationConfigFromApi({
          path: id,
          lang: this.languageService.getCurrentLanguageInfo(),
          propertyId: id
        });
      }
    } catch (error) {
      console.warn('Erreur lors de la vérification/récupération de la navigation:', error);
      // En cas d'erreur, tenter de charger la navigation normalement
      this.navigationConfigStore.getNavigationConfigFromApi({
        path: id,
        lang: this.languageService.getCurrentLanguageInfo(),
        propertyId: id
      });
    }
    
    // Toujours charger les détails de propriété, indépendamment de l'état des configurations
    console.log('Chargement des détails de propriété pour ID:', id);
    this.propertyStore.getPropertyDetails(id);
    
    return id;
  }
}
