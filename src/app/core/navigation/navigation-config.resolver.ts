import {inject, Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve} from "@angular/router";
import {NavigationConfigStore} from "../stores/navigation-config.store";
import {PropertyStore} from "../property/property.store";
import {LanguageService} from "@app/services/language-service";
import {AppConfigService} from "@app/config/app-config.service";

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
    
    // Uniquement charger les détails de propriété
    console.log('Chargement des détails de propriété pour ID:', id);
    this.propertyStore.getPropertyDetails(id);
    
    return id;
  }
}
