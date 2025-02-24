import { LayoutComponent } from './layouts/layout/layout.component';
import { VexRoutes } from '@vex/interfaces/vex-route.interface';
import {NavigationConfigResolver} from "./core/navigation/navigation-config.resolver";

export const appRoutes: VexRoutes = [
  {
    path: ':id',
    component: LayoutComponent,
    resolve: {
      navigationConfig: NavigationConfigResolver
    },
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            './pages/home/home.component'
            ).then((m) => m.HomeComponent)
      }
    ]
  }
];
