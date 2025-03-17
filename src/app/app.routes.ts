import { LayoutComponent } from './layouts/layout/layout.component';
import { AppRoutes } from '@app/interfaces/app-route.interface';
import {NavigationConfigResolver} from "./core/navigation/navigation-config.resolver";

export const appRoutes: AppRoutes = [
  {
    path: 'error-404',
    loadComponent: () =>
      import('./pages/errors/error-404/error-404.component').then(
        (m) => m.Error404Component
      )
  },
  {
    path: 'error-500',
    loadComponent: () =>
      import('./pages/errors/error-500/error-500.component').then(
        (m) => m.Error500Component
      )
  },
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
