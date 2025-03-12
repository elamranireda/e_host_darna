import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface UserPreferences {
  firstName: string;
  lastName: string;
  geolocationEnabled: boolean;
  notificationsEnabled: boolean;
  privacyPolicyAccepted: boolean;
  onboardingCompleted: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserPreferencesStore {
  private readonly STORAGE_KEY = 'user_preferences';
  
  private defaultPreferences: UserPreferences = {
    firstName: '',
    lastName: '',
    geolocationEnabled: false,
    notificationsEnabled: false,
    privacyPolicyAccepted: false,
    onboardingCompleted: false
  };

  private preferencesSubject = new BehaviorSubject<UserPreferences>(this.defaultPreferences);
  
  constructor() {
    this.loadFromLocalStorage();
  }

  get preferences$(): Observable<UserPreferences> {
    return this.preferencesSubject.asObservable();
  }

  get preferences(): UserPreferences {
    return this.preferencesSubject.getValue();
  }

  updatePreferences(preferences: Partial<UserPreferences>): void {
    const updatedPreferences = {
      ...this.preferences,
      ...preferences
    };
    this.preferencesSubject.next(updatedPreferences);
    this.saveToLocalStorage(updatedPreferences);
  }

  isOnboardingCompleted(): boolean {
    return this.preferences.onboardingCompleted;
  }

  private loadFromLocalStorage(): void {
    try {
      const storedPreferences = localStorage.getItem(this.STORAGE_KEY);
      if (storedPreferences) {
        const parsedPreferences = JSON.parse(storedPreferences);
        this.preferencesSubject.next({
          ...this.defaultPreferences,
          ...parsedPreferences
        });
      }
    } catch (error) {
      console.error('Error loading user preferences from localStorage', error);
    }
  }

  private saveToLocalStorage(preferences: UserPreferences): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving user preferences to localStorage', error);
    }
  }
} 