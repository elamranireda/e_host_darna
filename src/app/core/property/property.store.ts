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
import {of, pipe, tap,} from "rxjs";
import {switchMap} from "rxjs/operators";
import {Property} from "../interfaces/property.interface";
import {PropertyService} from "./property.service";

export interface PropertyState {
  property: Property | null;
  loading: boolean;
  error: any;
}


const initialState: PropertyState = {
  property: null,
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
    getPropertyDetails: rxMethod<string>(
      pipe(
        tap(() => patchState(store, {loading: true})),
        switchMap((propertyId) => {
          if (store.property()) return of(null);
          return propertyService.getProperty(propertyId).pipe(
            tap({
              next: (item: Property) => {
                patchState(store, {loading: false, property: {...store.property(), ...item}})
              },
              error: (error: any) => {
                patchState(store, {loading: false, error});
                console.error(error);
              },
            })
          )
        })
      )
    ),

  })),
  withIpponLogging(),
  withComputed((store) => ({
    accessInstructions: computed(() => store.property()?.checkInInfo.accessInstructions ?? null)
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
