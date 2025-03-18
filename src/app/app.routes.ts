import { LayoutComponent } from './layouts/layout/layout.component';
import { AppRoutes } from '@app/interfaces/app-route.interface';
import {NavigationConfigResolver} from "./core/navigation/navigation-config.resolver";
import { languageConfig } from '@app/config/language.config';
import { LangRedirectComponent } from './core/lang-redirect/lang-redirect.component';

export const appRoutes: AppRoutes = [
  // Route d'accueil sans préfixe - redirection vers error-404
  {
    path: '',
    redirectTo: 'error-404',
    pathMatch: 'full'
  },
  // Routes d'erreur
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
  // Route principale avec paramètre :id
  {
    path: ':id',
    children: [
      // Route de base - détecte et redirige vers la langue appropriée
      {
        path: '',
        component: LangRedirectComponent
      },
      // Routes pour chaque langue avec paramètre :lang
      {
        path: ':lang',
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
    ]
  },
  // Routes d'erreur avec paramètre :id et langue
  {
    path: ':id/:lang/error-404',
    loadComponent: () =>
      import('./pages/errors/error-404/error-404.component').then(
        (m) => m.Error404Component
      )
  },
  {
    path: ':id/:lang/error-500',
    loadComponent: () =>
      import('./pages/errors/error-500/error-500.component').then(
        (m) => m.Error500Component
      )
  },
  // Route wildcard qui capture toutes les routes non définies
  {
    path: '**',
    redirectTo: 'error-404'
  }
];
