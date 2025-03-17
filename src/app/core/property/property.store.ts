import {
  getState,
  patchState,
  signalStore,
  signalStoreFeature,
  withComputed,
  withHooks,
  withMethods,
  withState
} from '@ngrx/signals';
import {computed, effect, inject} from "@angular/core";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {of, pipe, tap, catchError} from "rxjs";
import {switchMap} from "rxjs/operators";
import {Property} from "../interfaces/property.interface";
import {PropertyService} from "./property.service";

export interface PropertyState {
  property: Property | null;
  properties: Property[];
  filteredProperties: Property[];
  selectedType: string | null;
  searchTerm: string | null;
  loading: boolean;
  error: any;
}


const initialState: PropertyState = {
  property: null,
  properties: [],
  filteredProperties: [],
  selectedType: null,
  searchTerm: null,
  loading: false,
  error: null
}

export const PropertyStore = signalStore(
  {providedIn: 'root'},
  withState(initialState),
  withMethods((store, propertyService = inject(PropertyService)) => ({
    reset() {
      patchState(store, initialState);
    },
    setError(error: any) {
      patchState(store, { loading: false, error });
    },
    getPropertyDetails: rxMethod<string>(
      pipe(
        tap(() => {
          console.log('Démarrage du chargement des détails de propriété');
          patchState(store, {loading: true});
        }),
        switchMap((propertyId) => {
          // Ne pas charger si on a déjà cette propriété et qu'elle est valide
          if (store.property() && store.property()?.id === propertyId) {
            console.log('Propriété déjà chargée, réutilisation:', propertyId);
            return of(store.property());
          }
          
          console.log('Récupération des détails de propriété depuis l\'API pour ID:', propertyId);
          return propertyService.getProperty(propertyId).pipe(
            tap({
              next: (item: Property) => {
                if (item) {
                  console.log('Propriété chargée avec succès:', item.id);
                  patchState(store, {loading: false, property: item, error: null});
                } else {
                  console.error('Propriété reçue est nulle ou invalide');
                  patchState(store, {
                    loading: false, 
                    error: new Error('Propriété non trouvée ou invalide')
                  });
                }
              },
              error: (error: any) => {
                console.error('Erreur lors du chargement de la propriété:', error);
                patchState(store, {loading: false, error});
              },
            }),
            catchError((error) => {
              console.error('Erreur critique lors du chargement de la propriété:', error);
              patchState(store, {loading: false, error});
              // Retourner un observable vide pour permettre la continuation du flux
              return of(null);
            })
          );
        })
      )
    ),
    getAllProperties: rxMethod<void>(
      pipe(
        tap(() => patchState(store, {loading: true})),
        switchMap(() => {
          return propertyService.getAllProperties().pipe(
            tap({
              next: (properties: Property[]) => {
                patchState(store, {
                  loading: false, 
                  properties,
                  filteredProperties: properties
                });
              },
              error: (error: any) => {
                patchState(store, {loading: false, error});
          
              },
            })
          )
        })
      )
    ),
    filterByType: rxMethod<string | null>(
      pipe(
        tap((type) => patchState(store, {loading: true, selectedType: type})),
        switchMap((type) => {
          if (!type) {
            return propertyService.getAllProperties();
          }
          return propertyService.getPropertiesByType(type);
        }),
        tap({
          next: (properties: Property[]) => {
            patchState(store, {
              loading: false,
              filteredProperties: properties
            });
          },
          error: (error: any) => {
            patchState(store, {loading: false, error});
            console.error(error);
          },
        })
      )
    ),
    searchProperties: rxMethod<string | null>(
      pipe(
        tap((term) => patchState(store, {loading: true, searchTerm: term})),
        switchMap((term) => {
          if (!term) {
            // Si un type est sélectionné, on maintient le filtre par type
            if (store.selectedType()) {
              return propertyService.getPropertiesByType(store.selectedType()!);
            } else {
              return propertyService.getAllProperties();
            }
          }
   
          return propertyService.searchProperties(term);
        }),
        tap({
          next: (properties: Property[]) => {
            patchState(store, {
              loading: false,
              filteredProperties: properties
            });
          },
          error: (error: any) => {
            patchState(store, {loading: false, error});
            console.error(error);
          },
        })
      )
    ),
  })),
  withIpponLogging(),
  withComputed((store) => ({
    accessInstructions: computed(() => store.property()?.checkInInfo.accessInstructions ?? null),
    // Nouvelles propriétés calculées
    propertyTypes: computed(() => {
      const types = new Set<string>();
      store.properties().forEach(property => {
        if (property.type) types.add(property.type);
      });
      return Array.from(types);
    }),
    isFiltered: computed(() => !!store.selectedType() || !!store.searchTerm())
  }))
);

export function withIpponLogging() {
  return signalStoreFeature(
    withHooks({
      onInit(store) {
        effect(() => {
          // The effect is re-executed on state change.
          const state = getState(store);
          console.log('Property state', state);
        });
      },
    }),
  );
}
