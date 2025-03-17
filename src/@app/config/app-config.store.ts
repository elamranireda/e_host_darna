// @ts-nocheck - Désactive les vérifications de type pour ce fichier
import { computed, effect, inject } from "@angular/core";
import { getState, patchState, signalStore, signalStoreFeature, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { catchError, forkJoin, from, Observable, of, pipe, tap, throwError } from "rxjs";
import { catchError, map, switchMap } from "rxjs/operators";
import { AppConfig, AppConfigName, AppConfigs } from './app-config.interface';
import { appConfigs as defaultConfigs } from './app-configs';
import { HttpClient } from "@angular/common/http";
import { DeepPartial } from '../interfaces/deep-partial.type';
import { mergeDeep } from '../utils/merge-deep';
import { Router } from '@angular/router';
// Importer comme backup uniquement
import { colorVariables as defaultColorVariables } from './color-variables';
// Importer la configuration linguistique comme fallback
import { languageConfig as defaultLanguageConfig, LanguageConfig, LanguageInfo } from './language.config';
import { environment } from '../../environments/environment';

/**
 * Interface d'état du store pour les configurations
 * Centralise toutes les configurations de l'application :
 * - Thèmes et layouts
 * - Variables de couleurs
 * - Configurations linguistiques
 */
export interface AppConfigState {
  configs: AppConfigs;
  currentConfig: AppConfig;
  loading: boolean;
  error: any;
  initialized: boolean;
  colorVariables: Record<string, any>; // Variables de couleur centralisées
  languageConfig: LanguageConfig;      // Configuration linguistique centralisée
}

// Initial state
const initialState: AppConfigState = {
  configs: defaultConfigs,
  currentConfig: defaultConfigs[AppConfigName.apollo], // Default config - Apollo
  loading: false,
  error: null,
  initialized: false,
  colorVariables: defaultColorVariables, // Utiliser les variables statiques comme fallback initial
  languageConfig: defaultLanguageConfig // Utiliser la config linguistique statique comme fallback
};

// URL de l'API depuis l'environnement
const API_URL = environment.apiUrl;

/**
 * Service to adapt API responses to expected format
 */
class ConfigApiAdapter {
  /**
   * Adapts the raw config data to ensure it conforms to the AppConfig interface
   */
  static adaptConfig(config: any, colorVars: Record<string, any>): AppConfig {
    if (!config) {
      throw new Error('Configuration invalide reçue');
    }
    
    // Vérifier les propriétés essentielles
    if (!config.id || !config.style) {
      throw new Error('Propriétés essentielles manquantes dans la configuration reçue');
    }
    
    // Ensure all required properties exist and have the correct types
    const adaptedConfig = {
      ...config,
      // Ensure core properties exist
      name: config.name || config.id,
      bodyClass: config.bodyClass || `app-layout-${config.id}`,
      // Utiliser layout directement
      layout: config.layout || 'horizontal',
      style: {
        ...config.style,
        // Ensure proper enum values for style properties
        colorScheme: config.style?.colorScheme || 'light',
        themeClassName: config.style?.themeClassName || `app-theme-${config.id}`,
        borderRadius: config.style?.borderRadius || { value: 0.5, unit: 'rem' },
        button: {
          borderRadius: config.style?.button?.borderRadius || { value: 9999, unit: 'px' }
        }
      }
    } as AppConfig;
    
    // Si le thème existe, assurons-nous qu'il a la structure attendue
    // Sinon, créons-le avec des valeurs par défaut
    if (config.theme) {
      adaptedConfig.theme = {
        colors: {
          ...config.theme.colors,
          // Ajouter les palettes complètes depuis le store
          palettes: colorVars
        },
        layouts: config.theme.layouts || {
          available: ["apollo", "zeus", "hermes", "poseidon", "ares", "ikaros"],
          default: config.id,
          configs: {}
        }
      };
    } else if (config.id && config.style) {
      // Cas où le thème est absent mais d'autres propriétés essentielles existent
      // Utiliser uniquement les variables de couleur existantes, sans créer de valeurs par défaut
      console.warn(`Thème incomplet pour la configuration ${config.id}, utilisation des couleurs du thème global`);
      adaptedConfig.theme = {
        colors: {
          // Utiliser uniquement les palettes fournies par l'API
          palettes: colorVars
        },
        layouts: {
          available: ["apollo", "zeus", "hermes", "poseidon", "ares", "ikaros"],
          default: config.id,
          configs: {}
        }
      };
    } else {
      // Ne pas créer un thème par défaut si aucune information n'est disponible
      throw new Error(`Aucun thème trouvé pour la configuration ${config.id}. Un thème est obligatoire.`);
    }
    
    return adaptedConfig;
  }
  
  /**
   * Adapte la nouvelle structure centralisée du db.json et construit les configs individuelles
   */
  static adaptFromCentralizedFormat(data: any): { 
    configs: AppConfigs, 
    colorVariables: Record<string, any>,
    languageConfig: LanguageConfig
  } {
    // Vérifier que la structure de base est présente
    if (!data || !data.theme) {
      throw new Error('Structure de configuration invalide dans db.json: theme manquante');
    }

    if (!data.theme.layouts) {
      console.warn('Structure de configuration dans db.json: layouts manquants, utilisation de valeurs par défaut');
      data.theme.layouts = {
        available: ["apollo", "zeus", "hermes", "poseidon", "ares", "ikaros"],
        default: "apollo",
        configs: {}
      };
    }

    if (!data.theme.layouts.configs) {
      console.warn('Structure de configuration dans db.json: configs manquants, utilisation de valeurs par défaut');
      data.theme.layouts.configs = {};
    }

    if (!data.theme.colors) {
      throw new Error('Variables de couleur manquantes dans db.json');
    }
    
    if (!data.languageConfig) {
      throw new Error('Configuration linguistique manquante dans db.json');
    }
    
    const configs: AppConfigs = {} as AppConfigs;
    
    // Récupérer les variables de couleur depuis db.json
    const colorVars = data.theme.colors;
    
    // Vérifier que les couleurs sont valides
    if (!colorVars || Object.keys(colorVars).length === 0) {
      throw new Error('Variables de couleur manquantes ou invalides dans db.json');
    }
    
    // Récupérer la configuration linguistique depuis db.json
    const langConfig = data.languageConfig;
    
    // Vérifier que la config linguistique est valide
    if (!langConfig.defaultLanguage || !langConfig.supportedLanguages || langConfig.supportedLanguages.length === 0) {
      throw new Error('Configuration linguistique invalide dans db.json');
    }
    
    // S'assurer qu'il y a au moins une configuration
    if (Object.keys(data.theme.layouts.configs).length === 0) {
      throw new Error('Aucune configuration trouvée dans db.json. Au moins une configuration est obligatoire.');
    }
    
    // Pour chaque layout dans la section theme.layouts.configs
    Object.entries(data.theme.layouts.configs).forEach(([key, layoutConfig]) => {
      try {
        // Créer une config adaptée pour ce layout
        const config = this.adaptConfig(layoutConfig, colorVars);
        
        // S'assurer que config.theme.colors existe
        if (!config.theme.colors) {
          config.theme.colors = {
            primary: 'indigo',
            accent: 'blue',
            warn: 'red',
            background: 'gray',
            palettes: colorVars
          };
        } else {
          // S'assurer que les palettes sont disponibles dans le thème
          config.theme.colors.palettes = colorVars;
        }
        
        // Ajouter les informations de layouts si elles n'existent pas
        if (!config.theme.layouts) {
          config.theme.layouts = data.theme.layouts || {
            available: ["apollo", "zeus", "hermes", "poseidon", "ares", "ikaros"],
            default: key,
            configs: {}
          };
        }
        
        configs[key as AppConfigName] = config;
      } catch (error) {
        console.error(`Erreur lors de l'adaptation de la configuration ${key}:`, error);
        throw error;
      }
    });
    
    // Vérifier qu'au moins une configuration a été chargée
    if (Object.keys(configs).length === 0) {
      throw new Error('Aucune configuration valide n\'a été chargée depuis db.json');
    }
    
    return { 
      configs, 
      colorVariables: colorVars,
      languageConfig: langConfig
    };
  }
}

/**
 * Vérifie si une valeur est un AppConfigName valide
 */
function isValidConfigName(value: any): value is AppConfigName {
  return Object.values(AppConfigName).includes(value as AppConfigName);
}

/**
 * Store for managing app configurations
 */
export const AppConfigStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, httpClient = inject(HttpClient), router = inject(Router)) => {
    // Fonction utilitaire avec désactivation de contrôle de typage
    function setConfigIfValid(configName: any): void {
      // Vérifier si l'ID de config existe dans les configs
      const configs = store.configs();
      if (configName && configs[configName]) {
        // Appliquer directement avec patchState au lieu d'appeler setConfig
        const config = configs[configName];
        patchState(store, { currentConfig: config });
      }
    }
    
    return {
      /**
       * Reset the store to its initial state
       */
      reset() {
        patchState(store, initialState);
      },
      
      /**
       * Charge les configurations depuis l'API 
       * et redirige vers la page d'erreur en cas d'échec
       */
      loadConfigs: rxMethod<void>(
        pipe(
          tap(() => {
            // Si déjà en cours de chargement, ne rien faire
            if (store.loading()) {
              console.log('Chargement déjà en cours, ignorer la nouvelle demande');
              return;
            }
            
            console.log('Démarrage du chargement des configurations');
            patchState(store, { loading: true, error: null });
          }),
          switchMap(() => {
            // Si déjà initialisé, retourner les données existantes
            if (store.initialized()) {
              console.log('Configurations déjà initialisées, réutilisation');
              return of(true);
            }
            
            console.log('Chargement des configurations depuis l\'API...');
            return httpClient.get<Record<string, any>>(`${API_URL}/appConfigs`).pipe(
              tap({
                next: (response) => {
                  try {
                    // Utiliser l'adaptateur pour le nouveau format
                    const { configs, colorVariables, languageConfig } = ConfigApiAdapter.adaptFromCentralizedFormat(response);
                    
                    // Vérifier que les données requises sont présentes
                    if (!configs || Object.keys(configs).length === 0 || 
                        !colorVariables || Object.keys(colorVariables).length === 0 ||
                        !languageConfig || !languageConfig.supportedLanguages) {
                      console.error('Configuration incomplète chargée depuis API');
                      patchState(store, { 
                        loading: false,
                        error: new Error('Configuration incomplète')
                      });
                      
                      // Rediriger vers la page d'erreur
                      router.navigateByUrl('/error-500');
                      return;
                    }
                    
                    // Update state with loaded configs, color variables and language config
                    patchState(store, { 
                      loading: false, 
                      configs,
                      colorVariables,
                      languageConfig,
                      initialized: true,
                      error: null
                    });
                    
                    // Par défaut, utiliser Apollo comme config par défaut
                    if (configs[AppConfigName.apollo]) {
                      patchState(store, { currentConfig: configs[AppConfigName.apollo] });
                      console.log('Configuration Apollo chargée avec succès');
                    } else {
                      console.error('Configuration Apollo non trouvée');
                      patchState(store, { 
                        loading: false,
                        error: new Error('Configuration Apollo non trouvée')
                      });
                      
                      // Rediriger vers la page d'erreur
                      router.navigateByUrl('/error-500');
                    }
                  } catch (error) {
                    console.error('Erreur lors du traitement des configurations:', error);
                    patchState(store, { 
                      loading: false,
                      error
                    });
                    
                    // Rediriger vers la page d'erreur
                    router.navigateByUrl('/error-500');
                  }
                },
                error: (error: any) => {
                  console.error('Erreur lors du chargement des configurations depuis l\'API:', error);
                  patchState(store, { 
                    loading: false,
                    error
                  });
                  
                  // Rediriger vers la page d'erreur
                  router.navigateByUrl('/error-500');
                }
              }),
              map(() => store.initialized()),
              catchError(error => {
                console.error('Erreur critique lors du chargement des configurations:', error);
                patchState(store, { 
                  loading: false,
                  error
                });
                
                // Rediriger vers la page d'erreur
                router.navigateByUrl('/error-500');
                return of(false);
              })
            );
          })
        )
      ),
      
      /**
       * Alias pour loadConfigs pour compatibilité avec le code existant
       */
      loadAllConfigs() {
        return this.loadConfigs();
      },
      
      /**
       * Set the current active configuration
       */
      setConfig(configName: AppConfigName) {
        const configs = store.configs();
        const config = configs[configName];
        
        if (!config) {
          console.error(`Config with name '${configName}' does not exist! Using default.`);
          return;
        }
        
        patchState(store, { currentConfig: config });
      },
      
      /**
       * Update the current configuration with partial changes
       */
      updateConfig(configPartial: DeepPartial<AppConfig>) {
        const currentConfig = store.currentConfig();
        
        // Vérifier si la configuration actuelle existe
        if (!currentConfig) {
          console.error('No current configuration to update!');
          return;
        }
        
        const updatedConfig = mergeDeep({ ...currentConfig }, configPartial);
        
        // Update the current config
        patchState(store, { currentConfig: updatedConfig });
        
        // Update it in the configs map
        const configs = { ...store.configs() };
        
        // S'assurer que l'ID existe et est valide avant de mettre à jour le map
        if (currentConfig.id && isValidConfigName(currentConfig.id)) {
          configs[currentConfig.id] = updatedConfig;
          patchState(store, { configs });
        } else {
          console.error('Cannot update configs map: invalid config ID', currentConfig.id);
        }
      },

      /**
       * Mettre à jour la configuration linguistique
       */
      updateLanguageConfig(configPartial: Partial<LanguageConfig>) {
        const currentLangConfig = store.languageConfig();
        const updatedLangConfig = { ...currentLangConfig, ...configPartial };
        patchState(store, { languageConfig: updatedLangConfig });
      },
      
      /**
       * Save all configurations to the API in bulk
       * This is typically called when the user closes the app or at specific intervals
       */
      saveConfigs: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { loading: true })),
          switchMap(() => {
            // Convertir le format des configs pour l'API
            const apiConfigs = {
              theme: {
                // Utiliser les variables de couleur du store
                colors: store.colorVariables(),
                layouts: {
                  available: ["apollo", "zeus", "hermes", "poseidon", "ares", "ikaros"],
                  default: "apollo",
                  configs: Object.entries(store.configs()).reduce((acc, [key, config]) => {
                    // Conserver la structure originale pour l'API
                    acc[key] = {
                      ...config,
                      // Ne pas convertir layout en type car nous gardons maintenant layout
                      theme: {
                        colors: {
                          primary: config.theme?.colors?.primary,
                          accent: config.theme?.colors?.accent,
                          warn: config.theme?.colors?.warn,
                          background: config.theme?.colors?.background
                        }
                      }
                    };
                    return acc;
                  }, {})
                }
              },
              // Ajouter la configuration linguistique
              languageConfig: store.languageConfig()
            };
            
            return httpClient.put<Record<string, any>>(`${API_URL}/appConfigs`, apiConfigs).pipe(
              tap({
                next: () => {
                  patchState(store, { loading: false, error: null });
                },
                error: (error: any) => {
                  console.error('Erreur lors de la sauvegarde des configurations vers l\'API:', error);
                  patchState(store, { loading: false, error });
                  // Pour les erreurs de sauvegarde, nous n'avons pas besoin de rediriger
                  // car l'application peut continuer à fonctionner avec les configurations actuelles
                }
              }),
              catchError(error => {
                console.error('Erreur critique lors de la sauvegarde des configurations:', error);
                return throwError(() => error);
              })
            );
          })
        )
      )
    };
  }),
  withComputed((store) => ({
    // Expose the current config
    config: computed(() => store.currentConfig()),
    
    // Get all available configs as an array
    availableConfigs: computed(() => Object.values(store.configs())),
    
    // Check if store is initialized and configs are loaded
    isInitialized: computed(() => store.initialized()),
    
    // Loading state
    isLoading: computed(() => store.loading()),
    
    // Exposer les variables de couleur du store
    getColorVariables: computed(() => store.colorVariables()),
    
    // Exposer la configuration linguistique
    getLanguageConfig: computed(() => store.languageConfig())
  })),
  withLogging()
);

/**
 * Add logging to track store changes during development
 */
export function withLogging() {
  return signalStoreFeature(
    withHooks({
      onInit(store) {
        effect(() => {
          // The effect is re-executed on state change
          const state = getState(store);
          console.log('App Config Store state:', state);
        });
      },
    }),
  );
}
