import { Route } from '@angular/router';

export interface AppRouteData {
  scrollDisabled?: boolean;
  toolbarShadowEnabled?: boolean;
  footerVisible?: boolean;

  [key: string]: any;
}

export interface AppRoute extends Route {
  data?: AppRouteData;
  children?: AppRoute[];
}

export type AppRoutes = AppRoute[];
