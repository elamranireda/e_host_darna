import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ConfigApiAdapter } from './config-api.adapter';
import { NavigationItem } from '../../app/core/navigation/navigation-item.interface';
import { AppConfig, AppConfigs } from './app-config.interface';
import { LanguageConfig } from './language.config';

// URL de l'API depuis l'environnement
const API_URL = environment.apiUrl;

/**
 * Service pour gérer les opérations d'API liées à la configuration
 * Responsable de charger et sauvegarder les configurations
 */
@Injectable({
  providedIn: 'root'
})
export class ConfigApiService {
  constructor(private http: HttpClient) {}

  /**
   * Charge les configurations et la navigation depuis l'API
   */
  loadConfigsAndNavigation(): Observable<{
    configs: AppConfigs, 
    colorVariables: Record<string, any>,
    languageConfig: LanguageConfig,
    navigationItems: NavigationItem[]
  }> {
    console.log('Chargement des configurations et de la navigation depuis l\'API...');
    
    // Effectuer les deux requêtes en parallèle
    return forkJoin({
      appConfig: this.http.get<Record<string, any>>(`${API_URL}/appConfigs`),
      navigation: this.http.get<NavigationItem[]>(`${API_URL}/navigation`)
    }).pipe(
      map(({ appConfig, navigation }) => {
        // Adapter la configuration de l'application
        const { configs, colorVariables, languageConfig } = ConfigApiAdapter.adaptFromCentralizedFormat(appConfig);
        
        // Vérifier que les données requises sont présentes
        if (!configs || Object.keys(configs).length === 0 || 
            !colorVariables || Object.keys(colorVariables).length === 0 ||
            !languageConfig || !languageConfig.supportedLanguages) {
          throw new Error('Configuration incomplète chargée depuis API');
        }
        
        // Vérifier que la navigation est présente
        if (!navigation || !Array.isArray(navigation)) {
          console.warn('Navigation manquante ou invalide depuis API');
          return { configs, colorVariables, languageConfig, navigationItems: [] };
        }
        
        console.log('Navigation chargée avec succès:', navigation.length, 'items');
        return {
          configs,
          colorVariables,
          languageConfig,
          navigationItems: navigation
        };
      }),
      catchError(error => {
        console.error('Erreur lors du chargement des configurations depuis l\'API:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Sauvegarde les configurations vers l'API
   */
  saveConfigs(
    configs: AppConfigs, 
    colorVariables: Record<string, any>,
    languageConfig: LanguageConfig
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
      languageConfig: languageConfig
    };
    
    return this.http.put<Record<string, any>>(`${API_URL}/appConfigs`, apiConfigs).pipe(
      catchError(error => {
        console.error('Erreur critique lors de la sauvegarde des configurations:', error);
        return throwError(() => error);
      })
    );
  }
} 