import {inject, Injectable} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";
import {AppConfigService} from "@app/config/app-config.service";
import {
  getSupportedLanguageCodes,
  isLanguageSupported,
  isRtlLanguage,
  languageConfig
} from "@app/config/language.config";

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private translate = inject(TranslateService);
  private configService = inject(AppConfigService);

  // Liste des langues RTL
  private rtlLanguages = ['ar']; // Arabe est une langue RTL

  getCurrentLanguageInfo() {
    return this.translate.currentLang;
  }
  
  getSupportedLanguages(): string[] {
    return getSupportedLanguageCodes();
  }

  changeLanguage(lang: string) {
    // Vérifier si la langue est supportée
    if (!isLanguageSupported(lang)) {
      console.warn(`La langue ${lang} n'est pas prise en charge. Utilisation de la langue par défaut ${languageConfig.defaultLanguage}.`);
      lang = languageConfig.defaultLanguage;
    }
    
    this.translate.use(lang);
    
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
  }
}
