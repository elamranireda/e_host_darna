// @ts-nocheck - Désactive les vérifications de type pour ce fichier
import { computed, effect, inject } from "@angular/core";
import { getState, patchState, signalStore, signalStoreFeature, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { catchError, of, pipe, tap, throwError } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { AppConfig, AppConfigName, AppConfigs } from './app-config.interface';
import { appConfigs as defaultConfigs } from './app-configs';
import { DeepPartial } from '../interfaces/deep-partial.type';
import { mergeDeep } from '../utils/merge-deep';
import { Router } from '@angular/router';
// Importer comme backup uniquement
import { colorVariables as defaultColorVariables } from './color-variables';
// Importer la configuration linguistique comme fallback
import { languageConfig as defaultLanguageConfig, LanguageConfig } from './language.config';
// Importer les classes et fonctions externalisées
import { isValidConfigName, withLogging } from './config.utils';
import { ConfigApiService } from './config-api.service';
// Importer les types de navigation
import { NavigationItem } from '../../app/core/navigation/navigation-item.interface';

/**
 * Interface d'état du store pour les configurations
 * Centralise toutes les configurations de l'application :
 * - Thèmes et layouts
 * - Variables de couleurs
 * - Configurations linguistiques
 * - Navigation
 */
export interface AppConfigState {
  configs: AppConfigs;
  currentConfig: AppConfig;
  loading: boolean;
  error: any;
  initialized: boolean;
  colorVariables: Record<string, any>; // Variables de couleur centralisées
  languageConfig: LanguageConfig;      // Configuration linguistique centralisée
  navigationItems: NavigationItem[];   // Items de navigation centralisés
  navigationLoading: boolean;          // État de chargement spécifique à la navigation
  navigationError: any;                // Erreur spécifique à la navigation
}

// Initial state
const initialState: AppConfigState = {
  configs: defaultConfigs,
  currentConfig: defaultConfigs[AppConfigName.apollo], // Default config - Apollo
  loading: false,
  error: null,
  initialized: false,
  colorVariables: defaultColorVariables, // Utiliser les variables statiques comme fallback initial
  languageConfig: defaultLanguageConfig, // Utiliser la config linguistique statique comme fallback
  navigationItems: [],                   // Initialiser avec une liste vide
  navigationLoading: false,
  navigationError: null
};

/**
 * Store for managing app configurations
 */
export const AppConfigStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, configApiService = inject(ConfigApiService), router = inject(Router)) => {
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
            patchState(store, { loading: true, navigationLoading: true, error: null, navigationError: null });
          }),
          switchMap(() => {
            // Si déjà initialisé, retourner les données existantes
            if (store.initialized()) {
              console.log('Configurations déjà initialisées, réutilisation');
              return of(true);
            }
            
            return configApiService.loadConfigsAndNavigation().pipe(
              tap({
                next: ({ configs, colorVariables, languageConfig, navigationItems }) => {
                  try {
                    // Mettre à jour la navigation
                    patchState(store, {
                      navigationLoading: false,
                      navigationError: null,
                      navigationItems
                    });
                    
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
                      navigationLoading: false,
                      error,
                      navigationError: error
                    });
                    
                    // Rediriger vers la page d'erreur
                    router.navigateByUrl('/error-500');
                  }
                },
                error: (error: any) => {
                  console.error('Erreur lors du chargement des configurations depuis l\'API:', error);
                  patchState(store, { 
                    loading: false,
                    navigationLoading: false,
                    error,
                    navigationError: error
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
                  navigationLoading: false,
                  error,
                  navigationError: error
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
            return configApiService.saveConfigs(
              store.configs(),
              store.colorVariables(),
              store.languageConfig()
            ).pipe(
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
      ),
      
      /**
       * Définit les items de navigation directement
       * Utile pour les tests ou pour charger la navigation depuis une autre source
       */
      setNavigationItems(items: NavigationItem[]) {
        if (!items) {
          console.warn('Tentative de définir des items de navigation null ou undefined');
          return;
        }
        
        patchState(store, {
          navigationItems: items,
          navigationLoading: false,
          navigationError: null
        });
        
        console.log('Items de navigation définis manuellement:', items.length, 'items');
      }
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
    getLanguageConfig: computed(() => store.languageConfig()),
    
    // Exposer les items de navigation
    navigationItems: computed(() => store.navigationItems()),
    
    // État de chargement de la navigation
    isNavigationLoading: computed(() => store.navigationLoading())
  })),
  withLogging()
);
