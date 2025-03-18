import {Component, Inject, OnInit, Renderer2, inject} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
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
import { LanguageService } from '@app/services/language-service';
import { Meta, Title } from '@angular/platform-browser';
import { filter } from 'rxjs/operators';

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
  private readonly languageService = inject(LanguageService);
  private readonly titleService = inject(Title);
  private readonly metaService = inject(Meta);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  
  // ID de propriété actuelle
  private currentPropertyId: string | null = null;
  
  constructor(
    private translate: TranslateService,
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    private configService: AppConfigService
  ) {
    // Définir les langues disponibles depuis la configuration
    translate.addLangs(getSupportedLanguageCodes());
    translate.setDefaultLang(languageConfig.defaultLanguage);
    
    // Utiliser le service de langue pour détecter la langue préférée
    const userLang = this.languageService.detectPreferredLanguage();
    
    // Appliquer la langue détectée
    translate.use(userLang);
    
    // Si la langue est RTL, activer automatiquement le mode RTL
    if (isRtlLanguage(userLang)) {
      this.configService.updateConfig({
        direction: 'rtl'
      });
    }
    
    // Mettre à jour les métadonnées SEO lors du changement de langue
    this.translate.onLangChange.subscribe(() => {
      this.updateSeoMetadata();
    });
    
    // Surveiller les changements de route pour détecter l'ID de propriété
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.detectPropertyId();
      this.updateSeoMetadata();
    });
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
    
    // Initialiser les métadonnées SEO
    this.updateSeoMetadata();
  }

  /**
   * Détecter l'ID de propriété depuis l'URL
   */
  private detectPropertyId(): void {
    const url = this.router.url;
    const parts = url.split('/').filter(part => part);
    
    if (parts.length > 0) {
      this.currentPropertyId = parts[0];
    }
  }

  /**
   * Met à jour les métadonnées SEO en fonction de la langue active
   */
  private updateSeoMetadata(): void {
    const currentLang = this.translate.currentLang;
    
    // Mettre à jour le titre de la page
    const title = this.translate.instant('WELCOME');
    this.titleService.setTitle(title);
    
    // Mettre à jour les métadonnées pour le SEO
    this.metaService.updateTag({ name: 'description', content: this.translate.instant('WELCOME') });
    
    // Si on n'a pas d'ID de propriété, on ne peut pas générer les hreflang
    if (!this.currentPropertyId) {
      return;
    }
    
    // Ajouter les balises hreflang pour chaque langue supportée
    const supportedLangs = getSupportedLanguageCodes();
    const baseUrl = this.document.location.origin;
    
    // Supprimer manuellement les anciennes balises hreflang
    this.removeExistingMetaTags();
    
    // Ajouter la nouvelle balise og:locale
    this.metaService.addTag({ property: 'og:locale', content: currentLang });
    
    // Ajouter les nouvelles balises hreflang avec la structure id/lang
    for (const lang of supportedLangs) {
      this.metaService.addTag({
        rel: 'alternate',
        hreflang: lang,
        href: `${baseUrl}/${this.currentPropertyId}/${lang}`
      });
    }
  }
  
  /**
   * Supprime manuellement les balises meta relatives à hreflang et og:locale
   */
  private removeExistingMetaTags(): void {
    // Supprimer les balises og:locale
    const ogLocaleTags = this.document.querySelectorAll('meta[property="og:locale"]');
    ogLocaleTags.forEach(tag => tag.remove());
    
    // Supprimer les balises hreflang
    const hreflangTags = this.document.querySelectorAll('meta[rel="alternate"][hreflang]');
    hreflangTags.forEach(tag => tag.remove());
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
