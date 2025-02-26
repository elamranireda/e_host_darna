import {inject, Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve} from "@angular/router";
import {NavigationConfigStore} from "../stores/navigation-config.store";
import {PropertyStore} from "../property/property.store";
import {LanguageService} from "@vex/services/language-service";

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
    this.navigationConfigStore.getNavigationConfigFromApi({
      path: id,
      lang: this.languageService.getCurrentLanguageInfo()
    });
    this.propertyStore.getPropertyDetails(id);
    return id
  }
}
