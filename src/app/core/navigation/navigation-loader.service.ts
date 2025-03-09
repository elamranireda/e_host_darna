import {Injectable} from '@angular/core';
import {AppLayoutService} from '@app/services/app-layout.service';
import {NavigationItem} from './navigation-item.interface';
import {BehaviorSubject, Observable} from 'rxjs';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {shareReplay, tap} from 'rxjs/operators';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NavigationLoaderService {
  // URL de base pour l'API
  private baseUrl = environment.production ? 'https://api.example.com' : 'http://localhost:3000';
  private navigationEndpoint = `${this.baseUrl}/navigation`;

  private readonly _items: BehaviorSubject<NavigationItem[]> =
    new BehaviorSubject<NavigationItem[]>([]);

  get items$(): Observable<NavigationItem[]> {
    return this._items.asObservable();
  }

  private loadedData: Observable<NavigationItem[]> | null = null;

  constructor(private readonly layoutService: AppLayoutService, private http: HttpClient) {
    this.loadNavigationData();
  }

  /**
   * Charge les données de navigation pour un chemin et une langue spécifiques
   */
  loadNavigation(pathId: string, lang: string): Observable<NavigationItem[]> {
    const headers = new HttpHeaders({
      'Accept-language': lang,
    });
    
    // Requête vers l'API json-server
    return this.http.get<NavigationItem[]>(this.navigationEndpoint, {headers});
  }

  /**
   * Charge les données de navigation depuis l'API
   */
  private loadNavigationData() {
    if (!this.loadedData) {
      this.loadedData = this.http.get<NavigationItem[]>(this.navigationEndpoint).pipe(
        tap(items => this._items.next(items)),
        shareReplay(1)
      );
      
      this.loadedData.subscribe();
    }
  }
  
  /**
   * Force le rechargement des données de navigation
   */
  refresh() {
    // Réinitialiser pour forcer un nouveau chargement
    this.loadedData = null;
    // Recharger les données
    this.loadNavigationData();
  }
}
