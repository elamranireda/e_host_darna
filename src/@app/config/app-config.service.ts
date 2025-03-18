import {
  Inject,
  Injectable,
  OnDestroy,
  inject,
  effect,
  runInInjectionContext,
  Injector
} from '@angular/core';
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
  AppThemeProvider
} from './app-config.interface';
import { CSSValue } from '../interfaces/css-value.type';
import {
  filter,
  map,
  take,
  takeUntil,
  tap
} from 'rxjs/operators';
import { APP_CONFIG, APP_THEMES } from './config.token';
import { AppConfigStore } from './app-config.store';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { LanguageConfig, LanguageInfo } from './language.config';
import { Router } from '@angular/router';
import { AppSplashScreenService } from '../services/app-splash-screen.service';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService implements OnDestroy {
  private _configSubject = new BehaviorSubject<AppConfig | null>(null);
  private _colorVariablesSubject = new BehaviorSubject<Record<
    string,
    any
  > | null>(null);
  private _languageConfigSubject = new BehaviorSubject<LanguageConfig | null>(
    null
  );
  private destroy$ = new Subject<void>();
  private readonly configStore = inject(AppConfigStore);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  private _loading = true;
  private _initialized = false;
  private _loadAttemptFailed = false;
  private _configChangeEffect: ReturnType<typeof effect> | null = null;
  private readonly splashScreenService = inject(AppSplashScreenService);
  private _propertyId: string | null = null;

  constructor(
    @Inject(APP_CONFIG) private readonly config: AppConfig,
    @Inject(APP_THEMES) private readonly themes: AppThemeProvider[],
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly layoutService: AppLayoutService
  ) {
    // Configurer l'effet d'observation des changements dans le contexte du constructeur
    this._configChangeEffect = effect(() => {
      // Cet effet ne sera actif qu'après l'initialisation
      if (this._initialized) {
        const newConfig = this.configStore.config();
        if (newConfig) {
          this._configSubject.next(newConfig);
          this._updateConfig(newConfig);
        }

        const newColorVars = this.configStore.getColorVariables();
        if (newColorVars) {
          this._colorVariablesSubject.next(newColorVars);
        }

        const newLangConfig = this.configStore.getLanguageConfig();
        if (newLangConfig) {
          this._languageConfigSubject.next(newLangConfig);
        }
      }
    });

  }

  /**
   * Méthode publique pour charger les configurations avec un ID de propriété spécifique
   * @param propertyId L'ID de la propriété à utiliser pour les appels API
   * @returns Une promesse qui se résout lorsque les configurations sont chargées
   */
  public loadConfigsWithPropertyId(propertyId: string): Promise<void> {
    console.log(`Chargement des configurations avec ID de propriété: ${propertyId}`);
    this._propertyId = propertyId;
    
    // Si déjà initialisé, recharger les configurations avec le nouvel ID
    if (this._initialized) {
      console.log('Rechargement des configurations avec le nouvel ID de propriété');
      return this._loadConfigs(propertyId);
    }
    
    // Sinon, chargement initial avec l'ID
    return this._loadConfigs(propertyId);
  }

  /**
   * Charge les configurations depuis le store ou l'API
   * @param propertyId ID de propriété optionnel à utiliser pour les appels API
   * @returns Une promesse qui se résout lorsque les configurations sont chargées
   */
  private _loadConfigs(propertyId?: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      console.log(`Démarrage du chargement des configurations${propertyId ? ' pour la propriété ' + propertyId : ''}...`);
      this._loading = true;
      this._propertyId = propertyId || this._propertyId;

      // Vérifier si déjà initialisé pour un rechargement
      if (this._initialized && !propertyId) {
        console.log('Configurations déjà initialisées, réutilisation');
        this._loading = false;

        // Cacher le splash screen seulement si pas d'erreur
        try {
          this.splashScreenService.hide();
        } catch (error) {
          console.warn('Impossible de cacher le splash screen:', error);
        }

        resolve();
        return;
      }

      // Lancer le chargement des configurations avec l'ID de propriété si disponible
      try {
        // Fonction appelée en cas d'échec de l'appel API
        const handleApiFailure = (error: any) => {
          console.error('Échec de l\'appel API lors du chargement des configurations:', error);
          
          // Cacher immédiatement le splash screen
          try {
            this.splashScreenService.hide();
          } catch (splashError) {
            console.warn('Impossible de cacher le splash screen après erreur API:', splashError);
          }
          
          // Rediriger vers la page d'erreur
          setTimeout(() => {
            this.router.navigateByUrl('/error-500');
          }, 0);
          
          // Rejeter la promesse
          reject(error);
        };
        
        // Appeler la méthode du store qui retourne maintenant une promesse
        this.configStore.loadAllConfigs(this._propertyId)
          .then(() => {
            // Utiliser runInInjectionContext pour créer un contexte d'injection valide
            runInInjectionContext(this.injector, () => {
              // Observer l'état d'initialisation
              toObservable(this.configStore.initialized)
                .pipe(
                  filter((initialized) => initialized === true),
                  take(1),
                  takeUntil(this.destroy$)
                )
                .subscribe({
                  next: () => {
                    console.log(`Configurations chargées avec succès depuis le store${this._propertyId ? ' pour la propriété ' + this._propertyId : ''}`);
                    
                    try {
                      this._processConfigs();
                      
                      // Cacher le splash screen après chargement réussi
                      this.splashScreenService.hide();
                      console.log('Splashscreen masqué après chargement réussi');
                    } catch (error) {
                      console.error('Erreur lors du traitement des configurations:', error);
                      // Ne pas cacher le splashscreen en cas d'erreur, gérer l'erreur
                      this._handleLoadError(error, reject);
                      return;
                    }
                    
                    resolve();
                  },
                  error: (error: Error) => {
                    console.error('Erreur lors du chargement des configurations:', error);
                    // En cas d'erreur, rediriger vers error-500
                    this._handleLoadError(error, reject);
                  }
                });
            });
          })
          .catch(handleApiFailure);
      } catch (error) {
        console.error('Exception lors du démarrage du chargement:', error);
        this._handleLoadError(error, reject);
      }

      // Timeout de sécurité réduit (5 secondes)
      setTimeout(() => {
        if (this._loading && !this._initialized && !this._loadAttemptFailed) {
          const timeoutError = new Error('Délai de chargement des configurations dépassé');
          console.error(timeoutError.message);
          // En cas de timeout, rediriger vers error-500
          this._handleLoadError(timeoutError, reject);
        }
      }, 5000);
    });
  }

  private _processConfigs(): void {
    try {
      // Récupérer les configurations depuis le store - utiliser null comme fallback
      const storeConfig = this.configStore.config() || null;
      const colorVars = this.configStore.getColorVariables() || {};
      const langConfig = this.configStore.getLanguageConfig() || {
        defaultLanguage: 'en',
        fallbackLanguage: 'en',
        supportedLanguages: [
          { code: 'en', name: 'English', flag: 'en', rtl: false }
        ]
      };

      // Journalisation détaillée pour le débogage
      console.log('Traitement des configurations chargées:', {
        hasConfig: !!storeConfig,
        configId: storeConfig?.id,
        hasColors: !!colorVars && Object.keys(colorVars).length > 0,
        colorsCount: colorVars ? Object.keys(colorVars).length : 0,
        hasLang: !!langConfig && !!langConfig.supportedLanguages,
        langCount: langConfig?.supportedLanguages?.length || 0
      });

      // Utiliser la configuration disponible ou une configuration par défaut
      const configToUse = storeConfig || this.config;

      // Mettre à jour les sujets avec ce que nous avons, même si incomplet
      this._configSubject.next(configToUse);

      if (colorVars && Object.keys(colorVars).length > 0) {
        this._colorVariablesSubject.next(colorVars);
      } else {
        console.warn(
          "Variables de couleur manquantes ou vides - utilisation d'un objet vide"
        );
        this._colorVariablesSubject.next({});
      }

      if (
        langConfig &&
        langConfig.supportedLanguages &&
        langConfig.supportedLanguages.length > 0
      ) {
        this._languageConfigSubject.next(langConfig);
      } else {
        console.warn(
          'Configuration linguistique manquante ou invalide - utilisation de valeurs par défaut'
        );
        this._languageConfigSubject.next({
          defaultLanguage: 'en',
          fallbackLanguage: 'en',
          supportedLanguages: [
            { code: 'en', name: 'English', flag: 'en', rtl: false }
          ]
        });
      }

      // Mise à jour initiale de la configuration
      this._updateConfig(configToUse);

      // Configuration terminée
      this._loading = false;
      this._initialized = true;

      console.log('Initialisation des configurations terminée avec succès');
    } catch (error) {
      console.error('Erreur lors du traitement des configurations:', error);
      // Tenter de continuer avec les valeurs par défaut
      this._loading = false;
      this._initialized = true; // Marquer comme initialisé malgré l'erreur
      this._configSubject.next(this.config);
      this._colorVariablesSubject.next({});
      this._languageConfigSubject.next({
        defaultLanguage: 'en',
        fallbackLanguage: 'en',
        supportedLanguages: [
          { code: 'en', name: 'English', flag: 'en', rtl: false }
        ]
      });
      this._updateConfig(this.config);
      console.warn(
        'Initialisation des configurations terminée avec des valeurs par défaut'
      );
    }
  }

  /**
   * Gère les erreurs de chargement des configurations
   * @param error L'erreur rencontrée
   * @param rejectPromise Fonction de rejet de promesse à appeler
   */
  private _handleLoadError(error?: any, rejectPromise?: (error: any) => void): void {
    if (!this._loadAttemptFailed) {
      this._loadAttemptFailed = true;
      this._loading = false;
      console.error(
        "Échec du chargement des configurations, redirection vers la page d'erreur",
        error
      );

      // Ne pas cacher le splash screen tout de suite pour éviter un flash de contenu
      // La redirection va décharger la page actuelle de toute façon

      // Attendre un court instant avant de rediriger
      // pour permettre à l'interface de se stabiliser
      setTimeout(() => {
        try {
          // Rediriger vers la page d'erreur
          this.router.navigateByUrl('/error-500');
          console.log('Redirection vers error-500 effectuée');
          
          // Masquer le splashscreen seulement après un délai
          // pour éviter un flash de l'UI entre la redirection
          setTimeout(() => {
            try {
              this.splashScreenService.hide();
            } catch (hideError) {
              console.warn('Impossible de cacher le splash screen:', hideError);
            }
          }, 500);
        } catch (routerError) {
          console.error('Erreur lors de la redirection vers error-500:', routerError);
          // Tentative de masquer le splashscreen en dernier recours
          try {
            this.splashScreenService.hide();
          } catch (hideError) {
            console.warn('Impossible de cacher le splash screen:', hideError);
          }
        }
      }, 100);
      
      // Rejeter la promesse si une fonction de rejet a été fournie
      if (rejectPromise) {
        rejectPromise(error || new Error('Échec du chargement des configurations'));
      }
    }
  }

  ngOnDestroy(): void {
    if (this._initialized) {
      this.configStore.saveConfigs();
    }

    // Nettoyer l'effet si nécessaire
    if (this._configChangeEffect) {
      this._configChangeEffect.destroy();
      this._configChangeEffect = null;
    }

    this.destroy$.next();
    this.destroy$.complete();
  }

  get loading(): boolean {
    return this._loading;
  }

  get initialized(): boolean {
    return this._initialized;
  }

  get configs(): AppConfig[] {
    if (this._loading) {
      return [];
    }

    const configs = this.configStore.availableConfigs();

    if (
      !this._loading &&
      this._initialized &&
      (!configs || configs.length === 0)
    ) {
      console.error('Aucune configuration disponible après initialisation');
      this._handleLoadError();
      return [];
    }

    return configs;
  }

  get configsLoaded$(): Observable<boolean> {
    return of(this._initialized);
  }

  get config$(): Observable<AppConfig> {
    return this._configSubject.asObservable().pipe(
      filter((config) => config !== null),
      map((config) => config as AppConfig)
    );
  }

  get colorVariables$(): Observable<Record<string, any>> {
    return this._colorVariablesSubject.asObservable().pipe(
      filter((colorVars) => colorVars !== null),
      map((colorVars) => colorVars as Record<string, any>)
    );
  }

  get colorVariables(): Record<string, any> {
    if (this._loading) {
      return {};
    }

    const colorVars = this._colorVariablesSubject.getValue();

    if (!this._loading && this._initialized && !colorVars) {
      console.error(
        'Variables de couleur non disponibles après initialisation'
      );
      this._handleLoadError();
      return {};
    }

    return colorVars || {};
  }

  get languageConfig$(): Observable<LanguageConfig> {
    return this._languageConfigSubject.asObservable().pipe(
      filter((langConfig) => langConfig !== null),
      map((langConfig) => langConfig as LanguageConfig)
    );
  }

  get languageConfig(): LanguageConfig {
    if (this._loading) {
      return {
        defaultLanguage: '',
        fallbackLanguage: '',
        supportedLanguages: []
      };
    }

    const langConfig = this._languageConfigSubject.getValue();

    if (!this._loading && this._initialized && !langConfig) {
      console.error(
        'Configuration linguistique non disponible après initialisation'
      );
      this._handleLoadError();
      return {
        defaultLanguage: '',
        fallbackLanguage: '',
        supportedLanguages: []
      };
    }

    return (
      langConfig || {
        defaultLanguage: '',
        fallbackLanguage: '',
        supportedLanguages: []
      }
    );
  }

  updateLanguageConfig(config: Partial<LanguageConfig>): void {
    if (!this._initialized) {
      console.warn(
        'Tentative de mise à jour de la configuration linguistique avant initialisation'
      );
      return;
    }
    this.configStore.updateLanguageConfig(config);
  }

  getSupportedLanguageCodes(): string[] {
    return this.languageConfig.supportedLanguages.map((lang) => lang.code);
  }

  isLanguageSupported(langCode: string): boolean {
    return this.languageConfig.supportedLanguages.some(
      (lang) => lang.code === langCode
    );
  }

  getLanguageInfo(langCode: string): LanguageInfo | undefined {
    return this.languageConfig.supportedLanguages.find(
      (lang) => lang.code === langCode
    );
  }

  getRtlLanguages(): string[] {
    return this.languageConfig.supportedLanguages
      .filter((lang) => lang.rtl)
      .map((lang) => lang.code);
  }

  isRtlLanguage(langCode: string): boolean {
    const langInfo = this.getLanguageInfo(langCode);
    return langInfo ? langInfo.rtl : false;
  }

  select<R>(selector: (config: AppConfig) => R): Observable<R> {
    return this.config$.pipe(map(selector));
  }

  setConfig(configName: AppConfigName) {
    if (!this._initialized) {
      console.warn(
        'Tentative de définition de la configuration avant initialisation'
      );
      return;
    }
    this.configStore.setConfig(configName);
  }

  updateConfig(config: DeepPartial<AppConfig>) {
    if (!this._initialized) {
      console.warn(
        'Tentative de mise à jour de la configuration avant initialisation'
      );
      return;
    }
    this.configStore.updateConfig(config);
  }

  saveConfigs() {
    if (!this._initialized) {
      console.warn(
        'Tentative de sauvegarde des configurations avant initialisation'
      );
      return;
    }
    this.configStore.saveConfigs();
  }

  private _updateConfig(config: AppConfig): void {
    try {
      // Vérifier que la configuration a les propriétés minimales nécessaires
      if (!config) {
        console.error('Tentative de mise à jour avec une configuration nulle');
        return;
      }

      // Appliquer les classes de mise en page
      if (config.bodyClass) {
        this._setLayoutClass(config.bodyClass);
      } else {
        console.warn('bodyClass manquante dans la configuration');
      }

      // Appliquer le style si disponible
      if (config.style) {
        this._setStyle(config.style);
      } else {
        console.warn('style manquant dans la configuration');
      }

      // Appliquer d'autres paramètres
      this._setDensity();

      if (config.direction) {
        this._setDirection(config.direction);
      } else {
        // Valeur par défaut
        this._setDirection('ltr');
      }

      if (config.sidenav && config.sidenav.state) {
        this._setSidenavState(config.sidenav.state);
      } else {
        // Valeur par défaut
        console.warn(
          'État de sidenav manquant, utilisation de "expanded" par défaut'
        );
        this._setSidenavState('expanded');
      }

      this._emitResize();
    } catch (error) {
      console.error(
        'Erreur lors de la mise à jour de la configuration:',
        error
      );
      // Ne pas rediriger en cas d'erreur mineure si déjà initialisé
      if (!this._initialized) {
        console.warn("Erreur pendant l'initialisation, tentative de continuer");
        // Marquer comme initialisé même en cas d'erreur pour éviter des redirections en boucle
        this._loading = false;
        this._initialized = true;
      }
    }
  }

  private _setStyle(style: AppConfig['style']): void {
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

    this.document.body.classList.remove(...this.themes.map((t) => t.className));
    this.document.body.classList.add(style.themeClassName);

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
    try {
      // Supprimer les classes de mise en page existantes
      const configs = this.configStore.availableConfigs();
      if (configs && configs.length > 0) {
        configs.forEach((c) => {
          if (
            c.bodyClass &&
            this.document.body.classList.contains(c.bodyClass)
          ) {
            this.document.body.classList.remove(c.bodyClass);
          }
        });
      }

      // Ajouter la nouvelle classe
      if (bodyClass) {
        this.document.body.classList.add(bodyClass);
      }
    } catch (error) {
      console.warn(
        'Erreur lors de la définition de la classe de mise en page:',
        error
      );
    }
  }

  // Getter pour l'ID de propriété actuel
  get propertyId(): string | null {
    return this._propertyId;
  }
}
