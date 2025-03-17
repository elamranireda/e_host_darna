import {NavigationDropdown, NavigationItem, NavigationLink, NavigationSubheading} from "../navigation/navigation-item.interface";
import {getState, patchState, signalStore, signalStoreFeature, withHooks, withMethods, withState} from '@ngrx/signals';
import {NavigationLoaderService} from "../navigation/navigation-loader.service";
import {effect, inject} from "@angular/core";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {of, pipe, tap,} from "rxjs";
import {switchMap} from "rxjs/operators";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";

export interface NavigationConfigState {
  items: NavigationItem[];
  loading: boolean;
  error: any;
}

const initialState: NavigationConfigState = {
  items: [],
  loading: false,
  error: null
}

/**
 * Remplace récursivement les :id dans les routes par l'ID de propriété réel
 */
function replaceIdInItems(items: NavigationItem[], propertyId: string): NavigationItem[] {
  if (!propertyId || !items || items.length === 0) {
    return items;
  }
  
  return items.map(item => {
    const newItem = { ...item };
    
    // Remplacer l'ID dans la route si elle existe
    if (isLink(newItem) || isDropdown(newItem)) {
      if (newItem.route) {
        // Remplacer le paramètre :id par l'ID réel
        newItem.route = newItem.route.replace(/:id/g, propertyId);
      }
    }
    
    // Traiter les enfants de manière récursive
    if (isDropdown(newItem) && newItem.children) {
      newItem.children = replaceIdInItems(newItem.children, propertyId) as (NavigationLink | NavigationDropdown)[];
    } else if (isSubheading(newItem) && newItem.children) {
      newItem.children = replaceIdInItems(newItem.children, propertyId) as (NavigationLink | NavigationDropdown)[];
    }
    
    return newItem;
  });
}

// Fonctions d'aide pour vérifier le type d'un élément de navigation
function isLink(item: NavigationItem): item is NavigationLink {
  return item.type === 'link';
}

function isDropdown(item: NavigationItem): item is NavigationDropdown {
  return item.type === 'dropdown';
}

function isSubheading(item: NavigationItem): item is NavigationSubheading {
  return item.type === 'subheading';
}

export const NavigationConfigStore = signalStore(
  {providedIn: 'root'},
  withState(initialState),
  withMethods((store, httpClient = inject(HttpClient)) => {
    // URL de base pour l'API
    const baseUrl = environment.production ? 'https://api.example.com' : 'http://localhost:3000';
    const navigationEndpoint = `${baseUrl}/navigation`;
    
    return {
      reset() {
        patchState(store, initialState);
      },
      getNavigationConfigFromApi: rxMethod<{path: string, lang: string, propertyId?: string}>(
        pipe(
          tap(() => patchState(store, {loading: true})),
          switchMap((input) => {
            // Utiliser directement HttpClient au lieu de passer par le service
            // pour éviter les dépendances circulaires
            const headers = { 'Accept-language': input.lang };
            
            return httpClient.get<NavigationItem[]>(navigationEndpoint, { headers }).pipe(
              tap({
                next: (items: NavigationItem[]) => {
                  if (!items || items.length === 0) {
                    console.warn('Aucun élément de navigation reçu de l\'API');
                    patchState(store, {loading: false});
                    return;
                  }
                  
                  // Remplacer les :id par l'ID réel si propertyId est fourni
                  let processedItems = items;
                  if (input.propertyId) {
                    processedItems = replaceIdInItems(items, input.propertyId);
                  }
                  
                  // Remplacer complètement les items au lieu de les concaténer
                  patchState(store, {loading: false, items: processedItems, error: null});
                  console.log('Navigation chargée avec succès depuis API:', processedItems.length, 'items');
                },
                error: (error: any) => {
                  patchState(store, {loading: false, error});
                  console.error('Erreur lors du chargement de la navigation:', error);
                },
              })
            );
          })
        )
      ),
      
      /**
       * Définir directement la configuration de navigation sans passer par l'API
       * Utile lorsque la navigation est déjà disponible dans AppConfigStore
       */
      setNavigationConfig(config: {items: NavigationItem[], propertyId?: string}) {
        console.log('Définition directe de la configuration de navigation');
        
        // Traiter les items si propertyId est fourni
        let processedItems = config.items;
        if (config.propertyId) {
          processedItems = replaceIdInItems(config.items, config.propertyId);
        }
        
        // Mettre à jour le store
        patchState(store, {
          loading: false,
          items: processedItems,
          error: null
        });
        
        console.log('Configuration de navigation définie avec succès:', processedItems.length, 'items');
      }
    };
  }),
  withIpponLogging()
);

export function withIpponLogging() {
  return signalStoreFeature(
    withHooks({
      onInit(store) {
        effect(() => {
          // The effect is re-executed on state change.
          const state = getState(store);
          console.log('navigation items state', state);
        });
      },
    }),
  );
}
