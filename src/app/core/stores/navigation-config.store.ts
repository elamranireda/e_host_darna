import {NavigationItem} from "../navigation/navigation-item.interface";
import {getState, patchState, signalStore, signalStoreFeature, withHooks, withMethods, withState} from '@ngrx/signals';
import {NavigationLoaderService} from "../navigation/navigation-loader.service";
import {effect, inject} from "@angular/core";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {of, pipe, tap,} from "rxjs";
import {switchMap} from "rxjs/operators";

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

export const NavigationConfigStore = signalStore(
  {providedIn: 'root'},
  withState(initialState),
  withMethods((store, navigationService = inject(NavigationLoaderService)) => ({
    reset() {
      patchState(store, initialState);
    },
    getNavigationConfigFromApi: rxMethod<string>(
      pipe(
        tap(() => patchState(store, {loading: true})),
        switchMap((homeId) => {
          console.log(store.items().length)
          if (store.items().length > 0) return of(null);
          return navigationService.loadNavigation(homeId).pipe(
            tap({
              next: (items: NavigationItem[]) => {
                console.log('here');
                patchState(store, {loading: false, items: [...store.items(), ...items]})
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
