import { Component, Inject } from '@angular/core';
import { AppConfigService } from '@app/config/app-config.service';
import {
  MatSlideToggleChange,
  MatSlideToggleModule
} from '@angular/material/slide-toggle';
import { map } from 'rxjs/operators';
import { MatRadioChange, MatRadioModule } from '@angular/material/radio';
import {
  AsyncPipe,
  KeyValuePipe,
  NgClass,
  NgFor,
  NgIf,
  UpperCasePipe
} from '@angular/common';
import { Observable } from 'rxjs';
import {
  AppColorScheme,
  AppConfig,
  AppConfigName,
  AppThemeProvider
} from '@app/config/app-config.interface';
import { CSSValue } from '@app/interfaces/css-value.type';
import { isNil } from '@app/utils/is-nil';
import { defaultRoundedButtonBorderRadius } from '@app/config/constants';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { APP_THEMES } from '@app/config/config.token';

@Component({
  selector: 'app-config-panel',
  templateUrl: './config-panel.component.html',
  styleUrls: ['./config-panel.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    MatIconModule,
    MatRippleModule,
    NgFor,
    MatButtonModule,
    NgClass,
    MatSlideToggleModule,
    MatRadioModule,
    AsyncPipe,
    UpperCasePipe,
    KeyValuePipe
  ]
})
export class ConfigPanelComponent {
  configs: AppConfig[] = this.configService.configs;
  config$: Observable<AppConfig> = this.configService.config$;

  isRTL$: Observable<boolean> = this.config$.pipe(
    map((config) => config.direction === 'rtl')
  );

  colorScheme$: Observable<AppColorScheme> = this.config$.pipe(
    map((config) => config.style.colorScheme)
  );

  borderRadius$: Observable<number> = this.config$.pipe(
    map((config) => config.style.borderRadius.value)
  );

  ConfigName = AppConfigName;
  ColorSchemeName = AppColorScheme;
  selectedTheme$: Observable<string> = this.configService.select(
    (config) => config.style.themeClassName
  );
  isSelectedTheme$: Observable<(theme: string) => boolean> = this.configService
    .select((config) => config.style.themeClassName)
    .pipe(map((themeClassName) => (theme: string) => themeClassName === theme));

  roundedCornerValues: CSSValue[] = [
    {
      value: 0,
      unit: 'rem'
    },
    {
      value: 0.25,
      unit: 'rem'
    },
    {
      value: 0.5,
      unit: 'rem'
    },
    {
      value: 0.75,
      unit: 'rem'
    },
    {
      value: 1,
      unit: 'rem'
    },
    {
      value: 1.25,
      unit: 'rem'
    },
    {
      value: 1.5,
      unit: 'rem'
    },
    {
      value: 1.75,
      unit: 'rem'
    }
  ];

  roundedButtonValue: CSSValue = defaultRoundedButtonBorderRadius;

  constructor(
    private readonly configService: AppConfigService,
    @Inject(APP_THEMES) public readonly themes: AppThemeProvider[]
  ) {}

  setConfig(layout: AppConfigName, colorScheme: AppColorScheme): void {
    this.configService.setConfig(layout);
    this.configService.updateConfig({
      style: {
        colorScheme
      }
    });
  }

  selectTheme(theme: AppThemeProvider): void {
    this.configService.updateConfig({
      style: {
        themeClassName: theme.className
      }
    });
  }

  enableDarkMode(): void {
    this.configService.updateConfig({
      style: {
        colorScheme: AppColorScheme.DARK
      }
    });
  }

  disableDarkMode(): void {
    this.configService.updateConfig({
      style: {
        colorScheme: AppColorScheme.LIGHT
      }
    });
  }

  layoutRTLChange(change: MatSlideToggleChange): void {
    this.configService.updateConfig({
      direction: change.checked ? 'rtl' : 'ltr'
    });
  }

  toolbarPositionChange(change: MatRadioChange): void {
    this.configService.updateConfig({
      toolbar: {
        fixed: change.value === 'fixed'
      }
    });
  }

  footerVisibleChange(change: MatSlideToggleChange): void {
    this.configService.updateConfig({
      footer: {
        visible: change.checked
      }
    });
  }

  footerPositionChange(change: MatRadioChange): void {
    this.configService.updateConfig({
      footer: {
        fixed: change.value === 'fixed'
      }
    });
  }

  isSelectedBorderRadius(borderRadius: CSSValue, config: AppConfig): boolean {
    return (
      borderRadius.value === config.style.borderRadius.value &&
      borderRadius.unit === config.style.borderRadius.unit
    );
  }

  selectBorderRadius(borderRadius: CSSValue): void {
    this.configService.updateConfig({
      style: {
        borderRadius: borderRadius
      }
    });
  }

  isSelectedButtonStyle(
    buttonStyle: CSSValue | undefined,
    config: AppConfig
  ): boolean {
    if (isNil(config.style.button.borderRadius) && isNil(buttonStyle)) {
      return true;
    }

    return buttonStyle?.value === config.style.button.borderRadius?.value;
  }

  selectButtonStyle(borderRadius: CSSValue | undefined): void {
    this.configService.updateConfig({
      style: {
        button: {
          borderRadius: borderRadius
        }
      }
    });
  }

  isDark(colorScheme: AppColorScheme): boolean {
    return colorScheme === AppColorScheme.DARK;
  }
}
