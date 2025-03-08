import {
  ENVIRONMENT_INITIALIZER,
  EnvironmentProviders,
  importProvidersFrom,
  inject,
  Provider
} from '@angular/core';
import {
  MAT_FORM_FIELD_DEFAULT_OPTIONS,
  MatFormFieldDefaultOptions
} from '@angular/material/form-field';
import { MATERIAL_SANITY_CHECKS } from '@angular/material/core';
import { AppSplashScreenService } from '@app/services/app-splash-screen.service';
import { AppLayoutService } from '@app/services/app-layout.service';
import { AppDemoService } from '@app/services/app-demo.service';
import { AppPlatformService } from '@app/services/app-platform.service';
import { AppConfig, AppThemeProvider } from '@app/config/app-config.interface';
import { APP_CONFIG, APP_THEMES } from '@app/config/config.token';
import { AppHighlightModule } from '@app/components/app-highlight/app-highlight.module';

export function provideApp(options: {
  config: AppConfig;
  availableThemes: AppThemeProvider[];
}): (Provider | EnvironmentProviders)[] {
  return [
    importProvidersFrom(AppHighlightModule),
    {
      provide: APP_CONFIG,
      useValue: options.config
    },
    {
      provide: APP_THEMES,
      useValue: options.availableThemes
    },
    {
      provide: MATERIAL_SANITY_CHECKS,
      useValue: {
        doctype: true,
        theme: false,
        version: true
      }
    },
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {
        appearance: 'outline'
      } satisfies MatFormFieldDefaultOptions
    },
    {
      provide: ENVIRONMENT_INITIALIZER,
      useValue: () => inject(AppSplashScreenService),
      multi: true
    },
    {
      provide: ENVIRONMENT_INITIALIZER,
      useValue: () => inject(AppLayoutService),
      multi: true
    },
    {
      provide: ENVIRONMENT_INITIALIZER,
      useValue: () => inject(AppPlatformService),
      multi: true
    },
    {
      provide: ENVIRONMENT_INITIALIZER,
      useValue: () => inject(AppDemoService),
      multi: true
    }
  ];
}
