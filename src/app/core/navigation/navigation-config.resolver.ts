import {inject, Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve} from "@angular/router";
import {NavigationConfigStore} from "../stores/navigation-config.store";

@Injectable({
  providedIn: 'root'
})
export class NavigationConfigResolver implements Resolve<any> {
  readonly navigationConfigStore = inject(NavigationConfigStore)

  constructor() {
  }

  resolve(route: ActivatedRouteSnapshot): string {
    const id = route.paramMap?.get('id') ?? '';
    this.navigationConfigStore.getNavigationConfigFromApi(id)
    return id
  }
}
