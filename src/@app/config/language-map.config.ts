export interface LanguageInfo {
  flag: string;
name: string;
}

type LanguageMap = {  [key: string]: LanguageInfo;};
export const LANGUAGE_MAP: LanguageMap = {
  en: {
    flag: 'en',
    name: 'EN',
  },
  fr: {
    flag: 'fr',
    name: 'FR',
  },
}
