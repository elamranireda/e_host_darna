import { Pipe, PipeTransform } from '@angular/core';
import { Observable, Subject, combineLatest, of } from 'rxjs';
import { map, startWith, switchMap, catchError, finalize } from 'rxjs/operators';

@Pipe({
  name: 'loading',
  standalone: true
})
export class LoadingPipe implements PipeTransform {

  transform<T>(source$: Observable<T>): Observable<{ loading: boolean; data: T | null; error: any }> {
    const loading$ = new Subject<boolean>();
    
    return of(true).pipe(
      // Démarrer avec l'état de chargement
      switchMap(() => {
        loading$.next(true);
        
        return combineLatest([
          // Flux de données avec gestion d'erreur
          source$.pipe(
            catchError(error => {
              // En cas d'erreur, on retourne un flux qui émet une valeur null
              // mais on garde l'erreur pour l'afficher
              return of(null);
            }),
            // Toujours finir par indiquer la fin du chargement
            finalize(() => loading$.next(false))
          ),
          // Flux d'état de chargement
          loading$.pipe(startWith(true))
        ]).pipe(
          // Transformer le résultat en objet avec les 3 états
          map(([data, loading]) => ({ 
            loading, 
            data,
            error: data === null ? 'Error loading data' : null
          }))
        );
      })
    );
  }
}
