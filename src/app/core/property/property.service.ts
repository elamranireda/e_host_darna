import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {catchError, delay, Observable, of} from "rxjs";
import {Property} from "../interfaces/property.interfac";

@Injectable({
  providedIn: 'root'
})

export class PropertyService {
  private apiUrl = `assets/properties-data.json`;

  constructor(private http: HttpClient) {
  }

  getProperty(id: string): Observable<Property> {
    return this.http.get<Property>(`${this.apiUrl}`).pipe(delay(2000),
      catchError(this.handleError<Property>('getProperty')));
  }

  handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
