import {Injectable} from '@angular/core';
import {VexLayoutService} from '@vex/services/vex-layout.service';
import {NavigationItem} from './navigation-item.interface';
import {BehaviorSubject, Observable} from 'rxjs';
import {HttpClient, HttpHeaders} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class NavigationLoaderService {
  private configUrl = 'assets/navigation-config.json';

  private readonly _items: BehaviorSubject<NavigationItem[]> =
    new BehaviorSubject<NavigationItem[]>([]);

  get items$(): Observable<NavigationItem[]> {
    return this._items.asObservable();
  }

  constructor(private readonly layoutService: VexLayoutService, private http: HttpClient) {
  }

  loadNavigation(pathId: string, lang: string): Observable<NavigationItem[]> {
    const headers = new HttpHeaders({
      'Accept-language': lang,
    })
    return this.http.get<NavigationItem[]>(`${this.configUrl}?pathId=${pathId}`, {headers});
  }
}
