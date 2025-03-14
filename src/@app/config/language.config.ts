export interface LanguageInfo {
  code: string;       // Code de la langue (en, fr, ar)
  name: string;       // Nom de la langue (English, Français, العربية)
  flag: string;       // Icône du drapeau
  rtl: boolean;       // Si la langue utilise le mode RTL
}

export interface LanguageConfig {
  defaultLanguage: string;          // Langue par défaut
  fallbackLanguage: string;         // Langue de secours si la langue demandée n'est pas disponible
  supportedLanguages: LanguageInfo[]; // Liste des langues prises en charge
}

export const languageConfig: LanguageConfig = {
  defaultLanguage: 'en',
  fallbackLanguage: 'en',
  supportedLanguages: [
    {
      code: 'en',
      name: 'English',
      flag: 'en',
      rtl: false
    },
    {
      code: 'fr',
      name: 'Français',
      flag: 'fr',
      rtl: false
    },
    {
      code: 'ar',
      name: 'العربية',
      flag: 'ar',
      rtl: true
    }
  ]
};

// Helper functions

/**
 * Vérifie si une langue est supportée
 */
export function isLanguageSupported(langCode: string): boolean {
  return languageConfig.supportedLanguages.some(lang => lang.code === langCode);
}

/**
 * Récupère les codes des langues supportées
 */
export function getSupportedLanguageCodes(): string[] {
  return languageConfig.supportedLanguages.map(lang => lang.code);
}

/**
 * Récupère les informations d'une langue
 */
export function getLanguageInfo(langCode: string): LanguageInfo | undefined {
  return languageConfig.supportedLanguages.find(lang => lang.code === langCode);
}

/**
 * Récupère les langues RTL
 */
export function getRtlLanguages(): string[] {
  return languageConfig.supportedLanguages
    .filter(lang => lang.rtl)
    .map(lang => lang.code);
}

/**
 * Vérifie si une langue est RTL
 */
export function isRtlLanguage(langCode: string): boolean {
  const langInfo = getLanguageInfo(langCode);
  return langInfo ? langInfo.rtl : false;
} 