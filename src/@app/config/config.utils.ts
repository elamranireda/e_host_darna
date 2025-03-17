import { AppConfigName } from './app-config.interface';
import { signalStoreFeature, withHooks, getState } from '@ngrx/signals';
import { effect } from '@angular/core';

/**
 * Vérifie si une valeur est un AppConfigName valide
 */
export function isValidConfigName(value: any): value is AppConfigName {
  return Object.values(AppConfigName).includes(value as AppConfigName);
}

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