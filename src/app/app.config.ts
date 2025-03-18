import {ApplicationConfig, importProvidersFrom} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {appRoutes} from './app.routes';
import {provideAnimations} from '@angular/platform-browser/animations';
import {HttpClient, HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {provideRouter, withInMemoryScrolling, withPreloading, PreloadAllModules} from '@angular/router';
import {MatDialogModule} from '@angular/material/dialog';
import {MatBottomSheetModule} from '@angular/material/bottom-sheet';
import {MatNativeDateModule} from '@angular/material/core';
import {provideIcons} from './core/icons/icons.provider';
import {provideLuxon} from './core/luxon/luxon.provider';
import {provideApp} from '@app/app.provider';
import {provideNavigation} from './core/navigation/navigation.provider';
import {appConfigs} from '@app/config/app-configs';
import {provideQuillConfig} from 'ngx-quill';
import {TranslateHttpLoader} from "@ngx-translate/http-loader";
import {TranslateLoader, TranslateModule, TranslateService} from "@ngx-translate/core";
import { ErrorInterceptor } from './core/interceptors/error-interceptor';
import { BreadcrumbHistoryService } from './core/services/breadcrumb-history.service';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import localeAr from '@angular/common/locales/ar';
import localeEn from '@angular/common/locales/en';

// Pré-enregistrer les locales pour améliorer les performances
registerLocaleData(localeFr);
registerLocaleData(localeAr);
registerLocaleData(localeEn);

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom(
      TranslateModule.forRoot(
        {
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient]
          }
        }
      ),
      BrowserModule,
      MatDialogModule,
      MatBottomSheetModule,
      MatNativeDateModule
    ),
    TranslateService,
    BreadcrumbHistoryService,
    provideRouter(
      appRoutes,
      // Activer la précharge des modules pour réduire le temps de chargement des routes
      withPreloading(PreloadAllModules),
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled'
      })
    ),
    provideAnimations(),
    // Fournir notre intercepteur d'erreur
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    },

    provideApp({
      /**
       * The config that will be used by default.
       * This is used until configurations are loaded from the API.
       * The configurations are loaded and managed by the AppConfigService.
       */
      config: appConfigs.poseidon,
      /**
       * Only themes that are available in the config in tailwind.config.ts should be listed here.
       * Any theme not listed here will not be available in the config panel.
       */
      availableThemes: [
        {
          name: 'Default',
          className: 'app-theme-default'
        },
        {
          name: 'Teal',
          className: 'app-theme-teal'
        },
        {
          name: 'Green',
          className: 'app-theme-green'
        },
        {
          name: 'Purple',
          className: 'app-theme-purple'
        },
        {
          name: 'Red',
          className: 'app-theme-red'
        },
        {
          name: 'Orange',
          className: 'app-theme-orange'
        }
      ]
    }),
    provideNavigation(),
    provideIcons(),
    provideLuxon(),
    provideQuillConfig({
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline', 'strike'],
          ['blockquote', 'code-block'],
          [{list: 'ordered'}, {list: 'bullet'}],
          [{header: [1, 2, 3, 4, 5, 6, false]}],
          ['clean'],
          ['link', 'image']
        ]
      }
    })
  ]
};
