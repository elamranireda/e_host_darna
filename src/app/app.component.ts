import {Component, Inject, OnInit, Renderer2} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {TranslateService} from "@ngx-translate/core";
import {DOCUMENT} from "@angular/common";
import { OnboardingModalComponent } from './shared/components/onboarding-modal/onboarding-modal.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [RouterOutlet, OnboardingModalComponent]
})
export class AppComponent implements  OnInit {
  static fontLoaded: boolean;
  constructor(private translate: TranslateService,    @Inject(DOCUMENT) private document: Document,
              private renderer: Renderer2) {
    translate.setDefaultLang('en');
    const browserLang = translate.getBrowserLang();
    translate.use(browserLang?.match(/en|fr/) ? browserLang : 'en');
  }

  ngOnInit() {
    if (!AppComponent.fontLoaded) {
      this.loadFont();
    }
  }

  loadFont() {
    AppComponent.fontLoaded = true;
    const scriptElem = this.renderer.createElement('script');
    this.renderer.setAttribute(scriptElem, 'crossorigin', 'anonymous');
    this.renderer.setAttribute(
      scriptElem,
      'src',
      'https://kit.fontawesome.com/24a46da608.js'
    );
    this.renderer.appendChild(this.document?.head, scriptElem);
  }
}
