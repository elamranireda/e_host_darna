import {inject, Injectable} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private translate = inject(TranslateService);

  getCurrentLanguageInfo() {
    return this.translate.currentLang;
  }
  getSupportedLanguages(): string[] {
    return ['en', 'fr']
  }

  changeLanguage(lang: string) {
    this.translate.use(lang);
  }
}
