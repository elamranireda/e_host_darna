import {inject, Injectable} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";
import {AppConfigService} from "@app/config/app-config.service";
import {
  getSupportedLanguageCodes,
  isLanguageSupported,
  isRtlLanguage,
  languageConfig
} from "@app/config/language.config";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {DOCUMENT, Location} from "@angular/common";
import {filter, tap} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private translate = inject(TranslateService);
  private configService = inject(AppConfigService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private document = inject(DOCUMENT);

  constructor() {
    // Suivre les changements de route pour mettre à jour la langue si nécessaire
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      tap(() => this.detectLanguageFromUrl())
    ).subscribe();
  }

  // Détecter la langue à partir de l'URL
  private detectLanguageFromUrl(): void {
    const path = this.location.path();
    const pathParts = path.split('/').filter(part => part);
    
    // Si nous avons au moins deux segments (id/lang)
    if (pathParts.length >= 2) {
      const langParam = pathParts[1]; // Deuxième segment après /
      
      if (langParam && isLanguageSupported(langParam) && langParam !== this.translate.currentLang) {
        this.changeLanguage(langParam, false);
      }
    }
  }

  getCurrentLanguageInfo() {
    return this.translate.currentLang;
  }
  
  getSupportedLanguages(): string[] {
    return getSupportedLanguageCodes();
  }

  // Changer de langue et mettre à jour l'URL si nécessaire
  changeLanguage(lang: string, updateUrl: boolean = true) {
    // Vérifier si la langue est supportée
    if (!isLanguageSupported(lang)) {
      console.warn(`La langue ${lang} n'est pas prise en charge. Utilisation de la langue par défaut ${languageConfig.defaultLanguage}.`);
      lang = languageConfig.defaultLanguage;
    }
    
    this.translate.use(lang);
    
    // Mise à jour des attributs HTML pour SEO
    this.updateHtmlLangAttribute(lang);
    
    // Basculer automatiquement le mode RTL si nécessaire
    if (isRtlLanguage(lang)) {
      this.configService.updateConfig({
        direction: 'rtl'
      });
    } else {
      this.configService.updateConfig({
        direction: 'ltr'
      });
    }
    
    // Mettre à jour l'URL si demandé
    if (updateUrl) {
      this.updateUrlWithLanguage(lang);
    }
    
    // Définir un cookie pour persister la préférence de langue
    this.setCookie('NEXT_LOCALE', lang, 365);
  }
  
  // Mettre à jour l'URL avec le préfixe de langue
  private updateUrlWithLanguage(lang: string): void {
    const path = this.location.path();
    const pathParts = path.split('/').filter(part => part);
    
    // S'assurer que nous avons au moins 1 segment (id)
    if (pathParts.length === 0) {
      // Si pas de segments, on ne peut pas mettre à jour l'URL
      return;
    }
    
    const id = pathParts[0]; // Premier segment est toujours l'ID
    
    // Si nous avons au moins 2 segments, le second est la langue
    if (pathParts.length >= 2 && isLanguageSupported(pathParts[1])) {
      // Remplacer la langue
      pathParts[1] = lang;
    } else {
      // Sinon, ajouter la langue après l'ID
      pathParts.splice(1, 0, lang);
    }
    
    const newPath = '/' + pathParts.join('/');
    this.location.go(newPath);
  }
  
  // Mettre à jour l'attribut lang de la balise HTML pour le SEO
  private updateHtmlLangAttribute(lang: string): void {
    this.document.documentElement.lang = lang;
  }
  
  // Détecter la langue préférée de l'utilisateur
  detectPreferredLanguage(): string {
    // Vérifier d'abord le cookie
    const cookieLang = this.getCookie('NEXT_LOCALE');
    if (cookieLang && isLanguageSupported(cookieLang)) {
      return cookieLang;
    }
    
    // Ensuite, vérifier le navigateur
    const browserLang = this.translate.getBrowserLang();
    if (browserLang && isLanguageSupported(browserLang)) {
      return browserLang;
    }
    
    // Par défaut, utiliser la langue par défaut
    return languageConfig.defaultLanguage;
  }
  
  // Définir un cookie
  private setCookie(name: string, value: string, days: number): void {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    this.document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  }
  
  // Récupérer un cookie
  private getCookie(name: string): string | null {
    const cookies = this.document.cookie.split(';');
    for (const cookie of cookies) {
      const [cookieName, cookieValue] = cookie.trim().split('=');
      if (cookieName === name) {
        return cookieValue;
      }
    }
    return null;
  }
}
