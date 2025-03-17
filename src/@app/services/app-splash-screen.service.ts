import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { animate, AnimationBuilder, style } from '@angular/animations';

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

    console.log('Masquage du splash screen');
    
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
      console.log('Splash screen supprimé du DOM');
    });
    
    player.play();
  }
}
