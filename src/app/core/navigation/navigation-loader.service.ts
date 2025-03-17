import {Injectable, inject} from '@angular/core';
import {AppLayoutService} from '@app/services/app-layout.service';
import {NavigationItem} from './navigation-item.interface';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {catchError, shareReplay, tap, take, switchMap} from 'rxjs/operators';
import {environment} from '../../../environments/environment';
import {AppConfigService} from '@app/config/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class NavigationLoaderService {
  // URL de base pour l'API
  private baseUrl = environment.production ? 'https://api.example.com' : 'http://localhost:3000';
  private navigationEndpoint = `${this.baseUrl}/navigation`;

  private readonly _items: BehaviorSubject<NavigationItem[]> =
    new BehaviorSubject<NavigationItem[]>([]);
  private readonly appConfigService = inject(AppConfigService);

  get items$(): Observable<NavigationItem[]> {
    return this._items.asObservable();
  }

  private loadedData: Observable<NavigationItem[]> | null = null;

  constructor(private readonly layoutService: AppLayoutService, private http: HttpClient) {
    console.log('Initialisation de NavigationLoaderService - vérification si navigation disponible');
    // Observer l'état de la configuration pour récupérer la navigation lorsqu'elle est disponible
    this.syncWithAppConfig();
  }

  /**
   * Synchronise avec la configuration de l'application pour obtenir la navigation
   */
  private syncWithAppConfig(): void {
    // Si la configuration est déjà initialisée, récupérer la navigation maintenant
    if (this.appConfigService.initialized) {
      this.getNavigationFromConfig();
    }

    // Sinon, attendre l'initialisation de la configuration
    const checkInterval = setInterval(() => {
      if (this.appConfigService.initialized && this._items.getValue().length === 0) {
        this.getNavigationFromConfig();
        clearInterval(checkInterval); // Arrêter l'intervalle une fois que nous avons obtenu la navigation
      }
    }, 500);

    // Nettoyer l'intervalle après 10 secondes au maximum
    setTimeout(() => {
      clearInterval(checkInterval);
    }, 10000);
  }

  /**
   * Récupère la navigation depuis la configuration
   */
  private getNavigationFromConfig(): void {
    // Utiliser config$ pour s'assurer que nous obtenons la configuration actuelle
    this.appConfigService.config$.pipe(take(1)).subscribe({
      next: currentConfig => {
        if (currentConfig && currentConfig.navigation && currentConfig.navigation.items) {
          console.log('Navigation récupérée depuis AppConfigService, nombre d\'items:', currentConfig.navigation.items.length);
          this._items.next(currentConfig.navigation.items);
        } else {
          console.warn('Navigation non disponible dans AppConfigService, chargement direct');
          // Si la navigation n'est pas disponible dans la configuration, la charger directement
          this.loadNavigationData();
        }
      },
      error: error => {
        console.error('Erreur lors de la récupération de la configuration:', error);
        this.loadNavigationData();
      }
    });
  }

  /**
   * Charge les données de navigation pour un chemin et une langue spécifiques
   * Cette méthode est appelée par le resolver uniquement si nécessaire
   */
  loadNavigation(pathId: string, lang: string): Observable<NavigationItem[]> {
    console.log('Tentative de chargement de navigation pour', pathId, lang);
    
    // Vérifier d'abord si la navigation est déjà disponible localement
    if (this._items.getValue().length > 0) {
      console.log('Réutilisation de la navigation locale');
      return of(this._items.getValue());
    }
    
    // Si non disponible, vérifier dans AppConfigService via l'Observable
    return this.appConfigService.config$.pipe(
      take(1),
      switchMap(currentConfig => {
        if (currentConfig && currentConfig.navigation && currentConfig.navigation.items) {
          console.log('Réutilisation de la navigation depuis AppConfigService');
          const navItems = currentConfig.navigation.items;
          this._items.next(navItems);
          return of(navItems);
        }
        
        console.log('Navigation non disponible dans AppConfigService, chargement depuis API');
        // Si non disponible dans la config, charger depuis l'API
        const headers = new HttpHeaders({
          'Accept-language': lang,
        });
        
        return this.http.get<NavigationItem[]>(this.navigationEndpoint, {headers}).pipe(
          tap(items => {
            console.log('Navigation chargée depuis API:', items.length, 'items');
            // Mettre à jour le BehaviorSubject local
            this._items.next(items);
          }),
          catchError(error => {
            console.error('Erreur lors du chargement de la navigation:', error);
            return of([]);
          })
        );
      })
    );
  }

  /**
   * Charge les données de navigation depuis l'API
   * Cette méthode est appelée uniquement si la navigation n'est pas disponible dans AppConfigStore
   */
  private loadNavigationData() {
    if (!this.loadedData) {
      console.log('Chargement direct de la navigation depuis API');
      this.loadedData = this.http.get<NavigationItem[]>(this.navigationEndpoint).pipe(
        tap(items => {
          console.log('Navigation chargée directement depuis API:', items.length, 'items');
          this._items.next(items);
        }),
        shareReplay(1)
      );
      
      this.loadedData.subscribe({
        error: error => console.error('Erreur lors du chargement direct de la navigation:', error)
      });
    }
  }
  
  /**
   * Force le rechargement des données de navigation
   */
  refresh() {
    // Réinitialiser pour forcer un nouveau chargement
    this.loadedData = null;
    
    // Vérifier d'abord si la navigation est disponible dans AppConfigService via l'Observable
    this.appConfigService.config$.pipe(take(1)).subscribe({
      next: currentConfig => {
        if (currentConfig && currentConfig.navigation && currentConfig.navigation.items) {
          console.log('Refresh: utilisation de la navigation depuis AppConfigService');
          this._items.next(currentConfig.navigation.items);
        } else {
          // Sinon, recharger depuis l'API
          console.log('Refresh: chargement direct depuis API');
          this.loadNavigationData();
        }
      },
      error: () => {
        // En cas d'erreur, charger directement depuis l'API
        console.log('Refresh: erreur avec AppConfigService, chargement direct depuis API');
        this.loadNavigationData();
      }
    });
  }
}
