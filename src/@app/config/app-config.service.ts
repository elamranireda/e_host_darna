import { Inject, Injectable, OnDestroy, inject, effect } from '@angular/core';
import { BehaviorSubject, Observable, Subject, of } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { DeepPartial } from '../interfaces/deep-partial.type';
import { mergeDeep } from '../utils/merge-deep';
import { AppLayoutService } from '../services/app-layout.service';
import { appConfigs as defaultConfigs } from './app-configs';
import {
  AppColorScheme,
  AppConfig,
  AppConfigName,
  AppConfigs,
  AppThemeProvider
} from './app-config.interface';
import { CSSValue } from '../interfaces/css-value.type';
import { catchError, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { APP_CONFIG, APP_THEMES } from './config.token';
import { AppConfigStore } from './app-config.store';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService implements OnDestroy {
  private _configSubject = new BehaviorSubject<AppConfig>(this.config);
  private _colorVariablesSubject = new BehaviorSubject<Record<string, any>>({});
  private destroy$ = new Subject<void>();
  private readonly configStore = inject(AppConfigStore);

  constructor(
    @Inject(APP_CONFIG) private readonly config: AppConfig,
    @Inject(APP_THEMES) private readonly themes: AppThemeProvider[],
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly layoutService: AppLayoutService
  ) {
    // S'assurer que le thème par défaut est Apollo en mode light
    const defaultConfig = {
      ...this.config,
      id: AppConfigName.apollo,
      style: {
        ...this.config.style,
        colorScheme: AppColorScheme.LIGHT,
      }
    };
    
    // Initialiser avec la configuration par défaut Apollo light
    this._updateConfig(defaultConfig);
    
    // Charger les configurations depuis le store
    this.configStore.loadConfigs();
    
    // Observer les changements de configuration du store 
    effect(() => {
      const storeConfig = this.configStore.config();
      if (storeConfig) {
        this._configSubject.next(storeConfig);
      }
      
      // Observer les changements des variables de couleur du store
      const colorVars = this.configStore.getColorVariables();
      if (colorVars) {
        this._colorVariablesSubject.next(colorVars);
      }
    });
    
    // S'abonner aux changements de configuration émis par le service
    this.config$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(config => this._updateConfig(config));
  }

  ngOnDestroy(): void {
    // Sauvegarder les configurations avant que le service soit détruit
    this.configStore.saveConfigs();
    
    // Nettoyer les abonnements
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Obtenir toutes les configurations disponibles
   */
  get configs(): AppConfig[] {
    return this.configStore.availableConfigs();
  }

  /**
   * Observable qui émet quand les configurations sont chargées
   */
  get configsLoaded$(): Observable<boolean> {
    return of(this.configStore.isInitialized());
  }

  /**
   * Obtenir la configuration courante comme un Observable
   */
  get config$(): Observable<AppConfig> {
    return this._configSubject.asObservable();
  }
  
  /**
   * Obtenir les variables de couleur comme un Observable
   */
  get colorVariables$(): Observable<Record<string, any>> {
    return this._colorVariablesSubject.asObservable();
  }
  
  /**
   * Obtenir les variables de couleur courantes
   */
  get colorVariables(): Record<string, any> {
    return this._colorVariablesSubject.getValue();
  }

  /**
   * Sélectionner une propriété spécifique de la configuration
   */
  select<R>(selector: (config: AppConfig) => R): Observable<R> {
    return this.config$.pipe(map(selector));
  }

  /**
   * Définir la configuration active par son nom
   */
  setConfig(configName: AppConfigName) {
    this.configStore.setConfig(configName);
  }

  /**
   * Mettre à jour la configuration courante avec des changements partiels
   */
  updateConfig(config: DeepPartial<AppConfig>) {
    this.configStore.updateConfig(config);
  }

  /**
   * Force la sauvegarde des configurations vers l'API
   */
  saveConfigs() {
    this.configStore.saveConfigs();
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
