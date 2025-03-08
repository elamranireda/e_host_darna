import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { DeepPartial } from '../interfaces/deep-partial.type';
import { mergeDeep } from '../utils/merge-deep';
import { AppLayoutService } from '../services/app-layout.service';
import { appConfigs } from './app-configs';
import {
  AppColorScheme,
  AppConfig,
  AppConfigName,
  AppConfigs,
  AppThemeProvider
} from './app-config.interface';
import { CSSValue } from '../interfaces/css-value.type';
import { map } from 'rxjs/operators';
import { APP_CONFIG, APP_THEMES } from './config.token';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  readonly configMap: AppConfigs = appConfigs;
  readonly configs: AppConfig[] = Object.values(this.configMap);
  private _configSubject = new BehaviorSubject<AppConfig>(this.config);

  constructor(
    @Inject(APP_CONFIG) private readonly config: AppConfig,
    @Inject(APP_THEMES) private readonly themes: AppThemeProvider[],
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly layoutService: AppLayoutService
  ) {
    this.config$.subscribe((config) => this._updateConfig(config));
  }

  get config$(): Observable<AppConfig> {
    return this._configSubject.asObservable();
  }

  select<R>(selector: (config: AppConfig) => R): Observable<R> {
    return this.config$.pipe(map(selector));
  }

  setConfig(configName: AppConfigName) {
    const settings = this.configMap[configName];

    if (!settings) {
      throw new Error(`Config with name '${configName}' does not exist!`);
    }

    this._configSubject.next(settings);
  }

  updateConfig(config: DeepPartial<AppConfig>) {
    this._configSubject.next(
      mergeDeep({ ...this._configSubject.getValue() }, config)
    );
  }

  private _updateConfig(config: AppConfig): void {
    this._setLayoutClass(config.bodyClass);
    this._setStyle(config.style);
    this._setDensity();
    this._setDirection(config.direction);
    this._setSidenavState(config.sidenav.state);
    this._emitResize();
  }

  private _setStyle(style: AppConfig['style']): void {
    /**
     * Set light/dark mode
     */
    switch (style.colorScheme) {
      case AppColorScheme.LIGHT:
        this.document.body.classList.remove(AppColorScheme.DARK);
        this.document.body.classList.add(AppColorScheme.LIGHT);
        break;

      case AppColorScheme.DARK:
        this.document.body.classList.remove(AppColorScheme.LIGHT);
        this.document.body.classList.add(AppColorScheme.DARK);
        break;
    }

    /**
     * Set theme class
     */
    this.document.body.classList.remove(...this.themes.map((t) => t.className));
    this.document.body.classList.add(style.themeClassName);

    /**
     * Border Radius
     */
    this.document.body.style.setProperty(
      '--app-border-radius',
      `${style.borderRadius.value}${style.borderRadius.unit}`
    );

    const buttonBorderRadius: CSSValue =
      style.button.borderRadius ?? style.borderRadius;
    this.document.body.style.setProperty(
      '--app-button-border-radius',
      `${buttonBorderRadius.value}${buttonBorderRadius.unit}`
    );
  }

  private _setDensity(): void {
    if (!this.document.body.classList.contains('app-mat-dense-default')) {
      this.document.body.classList.add('app-mat-dense-default');
    }
  }

  /**
   * Emit event so charts and other external libraries know they have to resize on layout switch
   * @private
   */
  private _emitResize(): void {
    if (window) {
      window.dispatchEvent(new Event('resize'));
      setTimeout(() => window.dispatchEvent(new Event('resize')), 200);
    }
  }

  private _setDirection(direction: 'ltr' | 'rtl') {
    this.document.body.dir = direction;
  }

  private _setSidenavState(sidenavState: 'expanded' | 'collapsed'): void {
    sidenavState === 'expanded'
      ? this.layoutService.expandSidenav()
      : this.layoutService.collapseSidenav();
  }

  private _setLayoutClass(bodyClass: string): void {
    this.configs.forEach((c) => {
      if (this.document.body.classList.contains(c.bodyClass)) {
        this.document.body.classList.remove(c.bodyClass);
      }
    });

    this.document.body.classList.add(bodyClass);
  }
}
