import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {catchError, map, Observable, of} from "rxjs";
import {Property} from "../interfaces/property.interface";
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})

export class PropertyService {
  // URL API pour accéder aux propriétés
  private baseUrl =`${environment.apiUrl}`;
  
  private propertiesEndpoint = `${this.baseUrl}/properties`;

  constructor(private http: HttpClient) {
  }

  // Récupérer une propriété spécifique par son ID
  getProperty(id: string): Observable<Property> {
    // Utiliser l'API mock en développement
    return this.http.get<Property>(`${this.propertiesEndpoint}/${id}`).pipe(
      catchError(this.handleError<Property>('getProperty'))
    );
  }

  // Récupérer toutes les propriétés
  getAllProperties(): Observable<Property[]> {
    return this.http.get<Property[]>(this.propertiesEndpoint).pipe(
      catchError(this.handleError<Property[]>('getAllProperties', []))
    );
  }

  // Récupérer les propriétés par type (hotel, villa, gite, etc.)
  getPropertiesByType(type: string): Observable<Property[]> {
    if (environment.production) {
      // En production, filtrer manuellement le fichier JSON
      return this.http.get<Property[]>(`${environment.jsonUrl}/properties-data.json`).pipe(
        map(properties => properties.filter(p => p.type === type)),
        catchError(this.handleError<Property[]>('getPropertiesByType', []))
      );
    } else {
      // En dev, utiliser l'API mock avec le paramètre type
      return this.http.get<Property[]>(`${this.propertiesEndpoint}?type=${type}`).pipe(
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
        catchError(this.handleError<Property[]>('searchProperties', []))
      );
    } else {
      // En dev, utiliser l'API mock avec q pour la recherche
      return this.http.get<Property[]>(`${this.propertiesEndpoint}?q=${term}`).pipe(
        catchError(this.handleError<Property[]>('searchProperties', []))
      );
    }
  }

  // Récupérer les commentaires d'une propriété
  getPropertyComments(propertyId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/comments?propertyId=${propertyId}`).pipe(
      catchError(this.handleError<any[]>('getPropertyComments', []))
    );
  }

  // Récupérer les informations du profil
  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/profile`).pipe(
      catchError(this.handleError<any>('getProfile', {}))
    );
  }

  handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
