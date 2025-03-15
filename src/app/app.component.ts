import {Component, Inject, OnInit, Renderer2, inject} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {TranslateService} from "@ngx-translate/core";
import {DOCUMENT} from "@angular/common";
import { OnboardingModalComponent } from './shared/components/onboarding-modal/onboarding-modal.component';
import {AppConfigService} from "@app/config/app-config.service";
import {
  getSupportedLanguageCodes,
  isRtlLanguage,
  languageConfig
} from "@app/config/language.config";
import { DynamicNavigationService } from './core/services/dynamic-navigation.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [RouterOutlet, OnboardingModalComponent]
})
export class AppComponent implements OnInit {
  static fontLoaded: boolean;
  
  // Injection du service de navigation dynamique
  private readonly dynamicNavigationService = inject(DynamicNavigationService);
  
  constructor(
    private translate: TranslateService,
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    private configService: AppConfigService
  ) {
    // Définir les langues disponibles depuis la configuration
    translate.addLangs(getSupportedLanguageCodes());
    translate.setDefaultLang(languageConfig.defaultLanguage);
    
    // Détecter la langue du navigateur
    const browserLang = translate.getBrowserLang();
    const supportedLangs = getSupportedLanguageCodes();
    
    // Utiliser la langue du navigateur si elle est prise en charge, sinon utiliser la langue par défaut
    const userLang = browserLang && supportedLangs.includes(browserLang) 
      ? browserLang 
      : languageConfig.defaultLanguage;
    
    translate.use(userLang);
    
    // Si la langue est RTL, activer automatiquement le mode RTL
    if (isRtlLanguage(userLang)) {
      this.configService.updateConfig({
        direction: 'rtl'
      });
    }
  }

  ngOnInit() {
    if (!AppComponent.fontLoaded) {
      this.loadFont();
    }
    
    // Initialiser le service de navigation dynamique après l'initialisation du composant
    try {
      setTimeout(() => {
        this.dynamicNavigationService.initialize();
      }, 0);
    } catch (error) {
      console.error('Error initializing dynamic navigation service:', error);
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
