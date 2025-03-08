import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {catchError, delay, map, Observable, of} from "rxjs";
import {Property} from "../interfaces/property.interface";
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})

export class PropertyService {
  // URL dynamique basée sur l'environnement
  private apiUrl = environment.production 
    ? `${environment.jsonUrl}/properties-data.json` 
    : `${environment.apiUrl}/properties`;

  constructor(private http: HttpClient) {
  }

  // Récupérer une propriété spécifique par son ID
  getProperty(id: string): Observable<Property> {
    if (environment.production) {
      // Utiliser le fichier JSON local en production
      return this.http.get<Property[]>(`${environment.jsonUrl}/properties-data.json`).pipe(
        map(properties => {
          const property = properties.find(p => p.id === id);
          if (!property) {
            throw new Error(`Property with id ${id} not found`);
          }
          return property;
        }),
        delay(1000),
        catchError(this.handleError<Property>('getProperty'))
      );
    } else {
      // Utiliser l'API mock en développement
      return this.http.get<Property>(`${this.apiUrl}/${id}`).pipe(
        delay(1000),
        catchError(this.handleError<Property>('getProperty'))
      );
    }
  }

  // Récupérer toutes les propriétés
  getAllProperties(): Observable<Property[]> {
    return this.http.get<Property[]>(`${this.apiUrl}`).pipe(
      delay(1000),
      catchError(this.handleError<Property[]>('getAllProperties', []))
    );
  }

  // Récupérer les propriétés par type (hotel, villa, gite, etc.)
  getPropertiesByType(type: string): Observable<Property[]> {
    if (environment.production) {
      // En production, filtrer manuellement le fichier JSON
      return this.http.get<Property[]>(`${environment.jsonUrl}/properties-data.json`).pipe(
        map(properties => properties.filter(p => p.type === type)),
        delay(1000),
        catchError(this.handleError<Property[]>('getPropertiesByType', []))
      );
    } else {
      // En dev, utiliser l'API mock avec le paramètre type
      return this.http.get<Property[]>(`${this.apiUrl}?type=${type}`).pipe(
        delay(1000),
        catchError(this.handleError<Property[]>('getPropertiesByType', []))
      );
    }
  }

  // Rechercher des propriétés par mot clé (dans le nom ou la description)
  searchProperties(term: string): Observable<Property[]> {
    if (!term.trim()) {
      return this.getAllProperties();
    }
    
    if (environment.production) {
      // En production, recherche manuelle dans le fichier JSON
      return this.http.get<Property[]>(`${environment.jsonUrl}/properties-data.json`).pipe(
        map(properties => properties.filter(property => 
          property.name.toLowerCase().includes(term.toLowerCase()) || 
          property.description.toLowerCase().includes(term.toLowerCase())
        )),
        delay(1000),
        catchError(this.handleError<Property[]>('searchProperties', []))
      );
    } else {
      // En dev, utiliser l'API mock avec q pour la recherche
      return this.http.get<Property[]>(`${this.apiUrl}?q=${term}`).pipe(
        delay(1000),
        catchError(this.handleError<Property[]>('searchProperties', []))
      );
    }
  }

  handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
