import {Injectable} from '@angular/core';
import {VexLayoutService} from '@vex/services/vex-layout.service';
import {NavigationItem} from './navigation-item.interface';
import {BehaviorSubject, Observable} from 'rxjs';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class NavigationLoaderService {
  private onfigUrl = 'assets/navigation-config.json';

  private readonly _items: BehaviorSubject<NavigationItem[]> =
    new BehaviorSubject<NavigationItem[]>([]);

  get items$(): Observable<NavigationItem[]> {
    return this._items.asObservable();
  }

  constructor(private readonly layoutService: VexLayoutService, private http: HttpClient) {
  }

  loadNavigation(pathId: string): Observable<NavigationItem[]> {
    return this.http.get<NavigationItem[]>(`${this.onfigUrl}?pathId=${pathId}`);
  }
}
