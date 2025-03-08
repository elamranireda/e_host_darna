import { Injectable } from '@angular/core';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { NavigationEnd, Router } from '@angular/router';
import { AppConfigService } from '@app/config/app-config.service';
import { filter } from 'rxjs/operators';

import {
  AppColorScheme,
  AppConfigName,
  AppTheme
} from '@app/config/app-config.interface';

@Injectable({
  providedIn: 'root'
})
export class AppDemoService {
  constructor(
    private readonly router: Router,
    private readonly configService: AppConfigService
  ) {
    /**
     * Config Related Subscriptions
     * You can remove this if you don't need the functionality of being able to enable specific configs with queryParams
     * Example: example.com/?layout=apollo&style=default
     */
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        )
      )
      .subscribe((event) => {
        const route = this.router.routerState.root.snapshot;
        if (route.queryParamMap.has('layout')) {
          this.configService.setConfig(
            route.queryParamMap.get('layout') as AppConfigName
          );
        }

        if (route.queryParamMap.has('style')) {
          this.configService.updateConfig({
            style: {
              colorScheme: route.queryParamMap.get('style') as AppColorScheme
            }
          });
        }

        // TODO: Adjust primaryColor queryParam and see where it was used?
        const theme: AppTheme | null = route.queryParamMap.get(
          'theme'
        ) as AppTheme | null;
        if (theme) {
          this.configService.updateConfig({
            style: {
              themeClassName: theme
            }
          });
        }

        if (route.queryParamMap.has('rtl')) {
          this.configService.updateConfig({
            direction: coerceBooleanProperty(route.queryParamMap.get('rtl'))
              ? 'rtl'
              : 'ltr'
          });
        }
      });
  }
}
