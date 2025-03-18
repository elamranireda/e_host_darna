import {inject, Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, Router} from "@angular/router";
import {PropertyStore} from "../property/property.store";
import {LanguageService} from "@app/services/language-service";
import {AppConfigService} from "@app/config/app-config.service";

/**
 * Ce resolver est responsable de:
 * 1. Charger les configurations spécifiques à la propriété
 * 2. Charger les détails de la propriété seulement après le chargement des configurations
 */
@Injectable({
  providedIn: 'root'
})
export class NavigationConfigResolver implements Resolve<string> {
  private readonly propertyStore = inject(PropertyStore);
  private readonly appConfigService = inject(AppConfigService);
  private readonly router = inject(Router);

  constructor(private languageService: LanguageService) {
  }

  /**
   * Résout la navigation et les configurations pour une propriété spécifique
   * @param route La route active qui contient l'ID de propriété
   * @returns Une promesse qui se résout avec l'ID de propriété ou une chaîne vide
   */
  async resolve(route: ActivatedRouteSnapshot): Promise<string> {
    // Récupérer l'ID de propriété depuis les paramètres de route
    const propertyId = route.paramMap?.get('id') ?? '';
    
    if (!propertyId) {
      console.warn('Aucun ID de propriété trouvé dans la route - navigation impossible');
      return '';
    }
    
    
    try {
      // 1. Charger les configurations avec l'ID de propriété (attendre la fin)
      await this.appConfigService.loadConfigsWithPropertyId(propertyId);
      
      // 2. Une fois les configurations chargées avec succès, charger les détails de la propriété
      this.propertyStore.getPropertyDetails(propertyId);
      
      return propertyId;
    } catch (error) {
      // La gestion des erreurs est déjà effectuée dans AppConfigService
      // Ce bloc catch est simplement pour éviter que l'erreur ne remonte plus haut
      console.error(`Erreur dans le resolver pour la propriété ${propertyId}:`, error);
      return propertyId;
    }
  }
}
