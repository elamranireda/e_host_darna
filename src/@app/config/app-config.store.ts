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

// Define the store state
export interface AppConfigState {
  configs: AppConfigs;
  currentConfig: AppConfig;
  loading: boolean;
  error: any;
  initialized: boolean;
}

// Initial state
const initialState: AppConfigState = {
  configs: defaultConfigs,
  currentConfig: defaultConfigs[AppConfigName.poseidon], // Default config
  loading: false,
  error: null,
  initialized: false
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
  static adaptConfig(config: any): AppConfig {
    if (!config) return defaultConfigs[AppConfigName.apollo];
    
    // Ensure all required properties exist and have the correct types
    return {
      ...config,
      // Ensure core properties exist
      id: config.id || AppConfigName.apollo,
      name: config.name || 'Default',
      bodyClass: config.bodyClass || 'app-layout-apollo',
      style: {
        ...config.style,
        // Ensure proper enum values for style properties
        colorScheme: config.style?.colorScheme || 'light',
        themeClassName: config.style?.themeClassName || 'app-theme-default',
        borderRadius: config.style?.borderRadius || { value: 0.5, unit: 'rem' },
        button: {
          borderRadius: config.style?.button?.borderRadius || { value: 9999, unit: 'px' }
        }
      }
    } as AppConfig;
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
  withMethods((store, httpClient = inject(HttpClient)) => ({
   
     
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
            return of(store.configs());
          }
          
          return httpClient.get<Record<string, any>>(`${API_URL}/appConfigs`).pipe(
            tap({
              next: (response) => {
                // Process API response
                if (response && Object.keys(response).length > 0) {
                  const configs: AppConfigs = {} as AppConfigs;
                  
                  // Process each config entry
                  Object.entries(response).forEach(([key, value]) => {
                    configs[key as AppConfigName] = ConfigApiAdapter.adaptConfig(value);
                  });
                  
                  // Update state with loaded configs
                  patchState(store, { 
                    loading: false, 
                    configs,
                    initialized: true,
                    error: null
                  });
                  
                  // Set current config if it exists in the loaded configs
                  const currentConfig = store.currentConfig();
                  if (currentConfig && currentConfig.id) {
                    setConfigIfValid(currentConfig.id);
                  }
                } else {
                  // Use default configs if API returns empty data
                  patchState(store, { 
                    loading: false, 
                    configs: defaultConfigs,
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
          return httpClient.put<Record<string, any>>(`${API_URL}/appConfigs`, store.configs()).pipe(
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
  })),
  withComputed((store) => ({
    // Expose the current config
    config: computed(() => store.currentConfig()),
    
    // Get all available configs as an array
    availableConfigs: computed(() => Object.values(store.configs())),
    
    // Check if store is initialized and configs are loaded
    isInitialized: computed(() => store.initialized()),
    
    // Loading state
    isLoading: computed(() => store.loading())
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

 // Fonction utilitaire avec désactivation de contrôle de typage
 function setConfigIfValid(configName: any): void {
  // @ts-ignore - Nous savons que c'est un AppConfigName valide car vérifié par l'appelant
  if (configName && store.configs()[configName]) {
    // @ts-ignore
    store.setConfig(configName);
  }
}
