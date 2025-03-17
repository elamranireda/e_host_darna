// @ts-nocheck - Désactive les vérifications de type pour ce fichier
import { computed, effect, inject } from "@angular/core";
import { getState, patchState, signalStore, signalStoreFeature, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { of, pipe, tap } from "rxjs";
import { switchMap } from "rxjs/operators";
import { AppConfig, AppConfigName, AppConfigs } from './app-config.interface';
import { appConfigs as defaultConfigs } from './app-configs';
import { HttpClient } from "@angular/common/http";
import { DeepPartial } from '../interfaces/deep-partial.type';
import { mergeDeep } from '../utils/merge-deep';
// Importer comme backup uniquement
import { colorVariables as defaultColorVariables } from './color-variables';

// Define the store state
export interface AppConfigState {
  configs: AppConfigs;
  currentConfig: AppConfig;
  loading: boolean;
  error: any;
  initialized: boolean;
  colorVariables: Record<string, any>; // Ajouter les variables de couleur à l'état
}

// Initial state
const initialState: AppConfigState = {
  configs: defaultConfigs,
  currentConfig: defaultConfigs[AppConfigName.apollo], // Default config - Apollo
  loading: false,
  error: null,
  initialized: false,
  colorVariables: defaultColorVariables // Utiliser les variables statiques comme fallback initial
};

// API URL
const API_URL = 'http://localhost:3000';

/**
 * Service to adapt API responses to expected format
 */
class ConfigApiAdapter {
  /**
   * Adapts the raw config data to ensure it conforms to the AppConfig interface
   */
  static adaptConfig(config: any, colorVars: Record<string, any>): AppConfig {
    if (!config) return defaultConfigs[AppConfigName.apollo];
    
    // Ensure all required properties exist and have the correct types
    const adaptedConfig = {
      ...config,
      // Ensure core properties exist
      id: config.id || AppConfigName.apollo,
      name: config.name || 'Default',
      bodyClass: config.bodyClass || 'app-layout-apollo',
      // Utiliser layout directement
      layout: config.layout || 'horizontal',
      style: {
        ...config.style,
        // Ensure proper enum values for style properties
        colorScheme: config.style?.colorScheme || 'light', // Par défaut en mode light
        themeClassName: config.style?.themeClassName || 'app-theme-default',
        borderRadius: config.style?.borderRadius || { value: 0.5, unit: 'rem' },
        button: {
          borderRadius: config.style?.button?.borderRadius || { value: 9999, unit: 'px' }
        }
      }
    } as AppConfig;
    
    // Si le thème existe, assurons-nous qu'il a la structure attendue
    if (config.theme) {
      adaptedConfig.theme = {
        colors: {
          ...config.theme.colors,
          // Ajouter les palettes complètes depuis le store
          palettes: colorVars
        },
        layouts: config.theme.layouts || {
          available: ["apollo", "zeus", "hermes", "poseidon", "ares", "ikaros"],
          default: config.id || "apollo", // Par défaut Apollo
          configs: {}
        }
      };
    }
    
    return adaptedConfig;
  }
  
  /**
   * Adapte la nouvelle structure centralisée du db.json et construit les configs individuelles
   */
  static adaptFromCentralizedFormat(data: any): { configs: AppConfigs, colorVariables: Record<string, any> } {
    const configs: AppConfigs = {} as AppConfigs;
    
    // Récupérer les variables de couleur depuis db.json ou utiliser les valeurs par défaut
    const colorVars = data?.theme?.colors || defaultColorVariables;
    
    // Nouvelle structure : data.theme.layouts.configs et data.theme.colors
    if (data && data.theme && data.theme.layouts && data.theme.layouts.configs) {
      // Pour chaque layout dans la section theme.layouts.configs
      Object.entries(data.theme.layouts.configs).forEach(([key, layoutConfig]) => {
        // Créer une config adaptée pour ce layout
        const config = this.adaptConfig(layoutConfig, colorVars);
        
        // Ajouter les informations de theme et colors
        if (!config.theme) {
          config.theme = {
            colors: {
              primary: 'indigo', // Valeurs par défaut si non spécifiées
              accent: 'blue',
              warn: 'red',
              background: 'gray',
              palettes: colorVars
            },
            layouts: data.theme.layouts || {
              available: ["apollo", "zeus", "hermes", "poseidon", "ares", "ikaros"],
              default: key,
              configs: {}
            }
          };
        } else {
          // S'assurer que les palettes sont disponibles dans le thème
          if (config.theme.colors) {
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
        }
        
        configs[key as AppConfigName] = config;
      });
    } else {
      // Fallback aux configs par défaut si structure non trouvée
      return { configs: defaultConfigs, colorVariables: defaultColorVariables };
    }
    
    return { configs, colorVariables: colorVars };
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
  withMethods((store, httpClient = inject(HttpClient)) => {
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
       * Load configurations from the API
       */
      loadConfigs: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { loading: true })),
          switchMap(() => {
            if (store.initialized()) {
              return of({ configs: store.configs(), colorVariables: store.colorVariables() });
            }
            
            return httpClient.get<Record<string, any>>(`${API_URL}/appConfigs`).pipe(
              tap({
                next: (response) => {
                  // Process API response
                  if (response && Object.keys(response).length > 0) {
                    // Utiliser l'adaptateur pour le nouveau format
                    const { configs, colorVariables } = ConfigApiAdapter.adaptFromCentralizedFormat(response);
                    
                    // Update state with loaded configs and color variables
                    patchState(store, { 
                      loading: false, 
                      configs,
                      colorVariables,
                      initialized: true,
                      error: null
                    });
                    
                    // Par défaut, utiliser Apollo comme config par défaut
                    if (configs[AppConfigName.apollo]) {
                      patchState(store, { currentConfig: configs[AppConfigName.apollo] });
                    } else {
                      // Set current config if it exists in the loaded configs
                      const currentConfig = store.currentConfig();
                      if (currentConfig && currentConfig.id) {
                        setConfigIfValid(currentConfig.id);
                      }
                    }
                  } else {
                    // Use default configs if API returns empty data
                    patchState(store, { 
                      loading: false, 
                      configs: defaultConfigs,
                      colorVariables: defaultColorVariables,
                      initialized: true,
                      error: null
                    });
                  }
                },
                error: (error: any) => {
                  console.error('Error loading configurations from API:', error);
                  patchState(store, { 
                    loading: false, 
                    configs: defaultConfigs,
                    colorVariables: defaultColorVariables,
                    initialized: true,
                    error 
                  });
                }
              })
            );
          })
        )
      ),
      
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
              }
            };
            
            return httpClient.put<Record<string, any>>(`${API_URL}/appConfigs`, apiConfigs).pipe(
              tap({
                next: () => {
                  patchState(store, { loading: false, error: null });
                },
                error: (error: any) => {
                  console.error('Error saving configurations to API:', error);
                  patchState(store, { loading: false, error });
                }
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
    getColorVariables: computed(() => store.colorVariables())
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
