import { Inject, Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { animate, AnimationBuilder, style } from '@angular/animations';
import { take } from 'rxjs';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AppSplashScreenService {
  splashScreenElem?: HTMLElement;

  constructor(
    private router: Router,
    @Inject(DOCUMENT) private document: Document,
    private animationBuilder: AnimationBuilder
  ) {
    this.splashScreenElem =
      this.document.body.querySelector('#app-splash-screen') ?? undefined;

      if (this.splashScreenElem) {
        this.router.events
          .pipe(
            filter((event: any) => event instanceof NavigationEnd),
            take(1)
          )
          .subscribe(() => this.hide());
      }
  }

  /**
   * Cache le splash screen avec une animation de fondu
   * Cette méthode sera appelée explicitement par AppConfigService 
   * lorsque le chargement de la configuration est terminé
   */
  hide() {
    if (!this.splashScreenElem) {
      console.warn('Élément splash screen non trouvé');
      return;
    }
    
    const player = this.animationBuilder
      .build([
        style({
          opacity: 1
        }),
        animate(
          '400ms cubic-bezier(0.25, 0.8, 0.25, 1)',
          style({
            opacity: 0
          })
        )
      ])
      .create(this.splashScreenElem);

    player.onDone(() => {
      this.splashScreenElem?.remove();
    });
    
    player.play();
  }
}
