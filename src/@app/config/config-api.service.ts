import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ConfigApiAdapter } from './config-api.adapter';
import { NavigationItem } from '../../app/core/navigation/navigation-item.interface';
import { AppConfig, AppConfigs } from './app-config.interface';
import { LanguageConfig } from './language.config';
import { NavigationService } from 'src/app/core/navigation/navigation.service';

// URL de l'API depuis l'environnement
const API_URL = environment.apiUrl;

// Interface d'erreur enrichie pour la gestion des erreurs
interface EnhancedError extends Error {
  originalError?: any;
  isHttpError?: boolean;
  httpStatus?: number;
}

/**
 * Service pour gérer les opérations d'API liées à la configuration
 * Responsable de charger et sauvegarder les configurations
 */
@Injectable({
  providedIn: 'root'
})
export class ConfigApiService {
  constructor(private http: HttpClient, private readonly navigationService: NavigationService) {}

  /**
   * Charge les configurations depuis l'API avec ID de propriété
   * @param propertyId ID de propriété à utiliser dans l'appel API
   */
  loadConfigs(propertyId?: string | null): Observable<{
    configs: AppConfigs, 
    colorVariables: Record<string, any>,
    languageConfig: LanguageConfig,
    navigationItems: NavigationItem[],
    currentConfig: AppConfig
  }> {
    
    // Construire l'URL avec l'ID de propriété si disponible
    const url = `${API_URL}/properties/${propertyId}/config`
    
    return this.http.get<Record<string, any>>(url).pipe(
      // Ajouter un délai pour éviter les appels trop rapides et permettre de voir les erreurs
      tap(response => {
      }),
      map(appConfig => {
        try {
          // Vérifier d'abord si nous avons une réponse valide
          if (!appConfig) {
            throw new Error('Réponse API vide ou invalide');
          }
          
          // Adapter la configuration de l'application
          const { configs, colorVariables, languageConfig, navigationItems } = ConfigApiAdapter.adaptFromCentralizedFormat(appConfig);
          
          // Vérifier que les données requises sont présentes
          if (!configs || Object.keys(configs).length === 0) {
            throw new Error('Configurations manquantes ou invalides');
          }
          
          if (!colorVariables || Object.keys(colorVariables).length === 0) {
            throw new Error('Variables de couleur manquantes ou invalides');
          }
          
          if (!languageConfig || !languageConfig.supportedLanguages) {
            throw new Error('Configuration linguistique manquante ou invalide');
          }
          
          // Par défaut, utiliser Apollo comme config courante
          const currentConfig = configs['apollo'] || Object.values(configs)[0];
          
          return {
            configs,
            colorVariables,
            languageConfig,
            navigationItems: this.navigationService.getNavigationWithReplacedIds(navigationItems || [], propertyId || ''),
            currentConfig
          };
        } catch (error) {
          console.error('Erreur lors du traitement de la réponse API:', error);
          // Transformer l'erreur de transformation en erreur observable
          throw error;
        }
      }),
      // Capture centralisée de toutes les erreurs possibles
      catchError(error => {
        // Message d'erreur personnalisé selon le type d'erreur
        let errorMessage = 'Erreur lors du chargement des configurations';
        let httpStatus = 0;
        
        if (error instanceof HttpErrorResponse) {
          // Erreur HTTP
          httpStatus = error.status;
          errorMessage = `Erreur HTTP ${error.status}: ${error.statusText || 'Erreur serveur'}`;
          console.error(errorMessage, error);
        } else if (error instanceof Error) {
          // Erreur JavaScript
          errorMessage = `Erreur de traitement: ${error.message}`;
          console.error(errorMessage, error);
        } else {
          // Autre type d'erreur
          errorMessage = `Erreur inconnue: ${JSON.stringify(error)}`;
          console.error(errorMessage, error);
        }
        
        // Créer un objet d'erreur enrichi
        const enhancedError: EnhancedError = new Error(errorMessage);
        enhancedError.originalError = error;
        enhancedError.isHttpError = error instanceof HttpErrorResponse;
        enhancedError.httpStatus = httpStatus;
        
        return throwError(() => enhancedError);
      })
    );
  }

  /**
   * Charge les configurations depuis l'API, y compris la navigation
   * @deprecated Utiliser loadConfigs à la place
   */
  loadConfigsAndNavigation(): Observable<{
    configs: AppConfigs, 
    colorVariables: Record<string, any>,
    languageConfig: LanguageConfig,
    navigationItems: NavigationItem[]
  }> {
    return this.loadConfigs().pipe(
      map(({ configs, colorVariables, languageConfig, navigationItems }) => ({
        configs,
        colorVariables,
        languageConfig,
        navigationItems
      }))
    );
  }

  /**
   * Sauvegarde les configurations vers l'API, y compris la navigation
   */
  saveConfigs(
    configs: AppConfigs, 
    colorVariables: Record<string, any>,
    languageConfig: LanguageConfig,
    navigationItems: NavigationItem[]
  ): Observable<any> {
    // Convertir le format des configs pour l'API
    const apiConfigs = {
      theme: {
        // Utiliser les variables de couleur du store
        colors: colorVariables,
        layouts: {
          available: ["apollo", "zeus", "hermes", "poseidon", "ares", "ikaros"],
          default: "apollo",
          configs: Object.entries(configs).reduce<Record<string, any>>((acc, [key, config]) => {
            // Conserver la structure originale pour l'API
            acc[key] = {
              ...config,
              theme: {
                colors: {
                  primary: config.theme?.colors?.primary,
                  accent: config.theme?.colors?.accent,
                  warn: config.theme?.colors?.warn,
                  background: config.theme?.colors?.background
                }
              }
            };
            return acc;
          }, {})
        }
      },
      // Ajouter la configuration linguistique
      languageConfig: languageConfig,
      // Ajouter la configuration de navigation
      navigationConfig: navigationItems
    };
    
    return this.http.put<Record<string, any>>(`${API_URL}/appConfigs`, apiConfigs).pipe(
      catchError(error => {
        console.error('Erreur critique lors de la sauvegarde des configurations:', error);
        return throwError(() => error);
      })
    );
  }
  
} 