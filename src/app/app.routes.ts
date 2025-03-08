import { LayoutComponent } from './layouts/layout/layout.component';
import { AppRoutes } from '@app/interfaces/app-route.interface';
import {NavigationConfigResolver} from "./core/navigation/navigation-config.resolver";

export const appRoutes: AppRoutes = [
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
      },
      {
        path: 'arrival',
        loadChildren: () => import('./pages/arrival/arrival.routes')
      }
    ]
  }
];
