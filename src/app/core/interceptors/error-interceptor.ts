import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { PropertyStore } from '../property/property.store';
import { inject } from '@angular/core';

interface ErrorInfo {
  code: number;
  message: string;
}

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private propertyStore = inject(PropertyStore);

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Préparer l'objet d'information d'erreur
        const errorInfo: ErrorInfo = {
          code: error.status,
          message: 'Une erreur est survenue lors de la communication avec le serveur.'
        };
        
        // Déterminer le message d'erreur approprié en fonction du code
        if (error.status === 0) {
          errorInfo.message = 'Impossible de communiquer avec le serveur. Veuillez vérifier votre connexion internet.';
        } else if (error.status === 404) {
          // Pour les erreurs 404 concernant les propriétés
          if (request.url.includes('/properties/')) {
            const propertyId = request.url.split('/properties/')[1].split('/')[0];
            errorInfo.message = `La propriété avec l'identifiant "${propertyId}" n'a pas été trouvée.`;
            
            // Mettre à jour le state du PropertyStore directement
            this.propertyStore.setError(errorInfo);
          }
        } else if (error.status === 500) {
          errorInfo.message = 'Une erreur interne du serveur s\'est produite. Veuillez réessayer ultérieurement.';
        }
        
        console.error('Erreur HTTP interceptée:', error);
        return throwError(() => errorInfo);
      })
    );
  }
} 