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
       * Charge toutes les configurations depuis l'API
       * Point d'entrée principal pour le chargement des configurations
       */
      loadAllConfigs(propertyId?: string | null) {
        return this.loadConfigs(propertyId);
      },
      
      /**
       * Méthode privée qui charge les configurations depuis l'API
       * @param propertyId ID de propriété optionnel à utiliser pour les appels API
       * @returns Une promesse qui est résolue ou rejetée en fonction du résultat de l'appel API
       */
      loadConfigs(propertyId?: string | null): Promise<void> {
        const store = getState(this);
        
        return new Promise<void>((resolve, reject) => {
          // Si déjà en cours de chargement, ne pas relancer
          if (store.loading) {
            resolve(); // Résoudre immédiatement
            return;
          }
          
          // Marquer comme en cours de chargement
          patchState(this, { loading: true, error: null });

          // Utiliser le service API avec l'ID de propriété si disponible
          configApiService.loadConfigs(propertyId)
            .pipe(
              catchError(error => {
                console.error('Erreur HTTP lors du chargement des configurations:', error);
                
                // Mettre à jour l'état avec l'erreur mais utiliser les configurations par défaut
                patchState(this, { 
                  loading: false, 
                  error,
                  configs: defaultConfigs,
                  currentConfig: defaultConfigs[AppConfigName.apollo],
                  colorVariables: defaultColorVariables,
                  languageConfig: defaultLanguageConfig,
                  // Ne pas marquer comme initialisé en cas d'erreur
                  initialized: false 
                });
                
                // Propager l'erreur pour qu'elle soit traitée par le service appelant
                reject(error);
                
                // Ceci ne sera jamais exécuté mais est nécessaire pour la syntaxe RxJS
                return throwError(() => error);
              })
            )
            .subscribe({
              next: (response) => {
                
                // Mettre à jour l'état avec les données reçues
                patchState(this, {
                  loading: false,
                  configs: response.configs || defaultConfigs,
                  currentConfig: response.currentConfig || defaultConfigs[AppConfigName.apollo],
                  colorVariables: response.colorVariables || defaultColorVariables,
                  languageConfig: response.languageConfig || defaultLanguageConfig,
                  navigationItems: response.navigationItems || [],
                  initialized: true,
                  error: null
                });
                
                resolve();
              },
              error: (error) => {
                console.error('Erreur dans la souscription:', error);
                reject(error);
              }
            });
        });
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
              store.languageConfig(),
              store.navigationItems()
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
          navigationItems: items
        });
      
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
    navigationItems: computed(() => store.navigationItems())
  })),
  withLogging()
);
