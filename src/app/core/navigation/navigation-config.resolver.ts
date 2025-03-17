import {inject, Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve} from "@angular/router";
import {PropertyStore} from "../property/property.store";
import {LanguageService} from "@app/services/language-service";
import {AppConfigService} from "@app/config/app-config.service";
import {AppConfigStore} from "@app/config/app-config.store";

@Injectable({
  providedIn: 'root'
})
export class NavigationConfigResolver implements Resolve<any> {
  readonly propertyStore = inject(PropertyStore);
  readonly appConfigService = inject(AppConfigService);
  readonly appConfigStore = inject(AppConfigStore);

  constructor(private languageService: LanguageService) {
  }

  async resolve(route: ActivatedRouteSnapshot): Promise<string> {
    const id = route.paramMap?.get('id') ?? '';
    console.log('Résolution navigation avec ID:', id);
    
    // Uniquement charger les détails de propriété
    console.log('Chargement des détails de propriété pour ID:', id);
    this.propertyStore.getPropertyDetails(id);
    
    return id;
  }
}
