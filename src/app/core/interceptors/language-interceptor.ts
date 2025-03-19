import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class LanguageInterceptor implements HttpInterceptor {
  constructor() {}

  /**
   * Récupère la langue depuis le cookie NEXT_LOCALE
   */
  private getLanguageFromCookie(): string {
    const cookies = document.cookie.split(';');
    const nextLocaleCookie = cookies.find(cookie => cookie.trim().startsWith('NEXT_LOCALE='));
    if (nextLocaleCookie) {
      return nextLocaleCookie.split('=')[1];
    }
    return 'fr'; // Langue par défaut si le cookie n'existe pas
  }

  /**
   * Intercepte chaque requête HTTP pour ajouter l'en-tête Accept-Language
   */
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Récupérer la langue depuis le cookie
    const language = this.getLanguageFromCookie();
    
    // Cloner la requête et ajouter l'en-tête
    const modifiedRequest = request.clone({
      setHeaders: {
        'Accept-Language': language
      }
    });
    
    // Passer la requête modifiée au prochain gestionnaire
    return next.handle(modifiedRequest);
  }
} 