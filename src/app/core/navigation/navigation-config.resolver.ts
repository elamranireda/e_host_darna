import {inject, Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve} from "@angular/router";
import {NavigationConfigStore} from "../stores/navigation-config.store";
import {PropertyStore} from "../property/property.store";
import {LanguageService} from "@app/services/language-service";
import {NavigationDropdown, NavigationItem, NavigationLink, NavigationSubheading} from "./navigation-item.interface";

@Injectable({
  providedIn: 'root'
})
export class NavigationConfigResolver implements Resolve<any> {
  readonly navigationConfigStore = inject(NavigationConfigStore)
  readonly propertyStore = inject(PropertyStore)

  constructor(private languageService: LanguageService) {
  }

  resolve(route: ActivatedRouteSnapshot): string {
    const id = route.paramMap?.get('id') ?? '';
    console.log(this.languageService.getCurrentLanguageInfo())
    
    // Charger la configuration depuis json-server et passer l'ID au store pour le remplacement
    this.navigationConfigStore.getNavigationConfigFromApi({
      path: id,
      lang: this.languageService.getCurrentLanguageInfo(),
      propertyId: id // Passer l'ID pour le remplacement
    });
    
    this.propertyStore.getPropertyDetails(id);
    return id
  }
}
