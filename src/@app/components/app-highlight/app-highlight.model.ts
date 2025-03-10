import { InjectionToken } from '@angular/core';

export const APP_HIGHLIGHT_OPTIONS = new InjectionToken<AppHighlightOptions>(
  'HIGHLIGHT_OPTIONS'
);

export interface AppHighlightOptions {
  languages?: () => AppHighlightLanguage[];
  config?: AppHighlightConfig;
}

export interface AppHighlightLanguage {
  name: string;
  func: () => any;
}

export interface AppHighlightConfig {
  /** tabReplace: a string used to replace TAB characters in indentation. */
  tabReplace?: string;
  /** useBR: a flag to generate <br> tags instead of new-line characters in the output, useful when code is marked up using a non-<pre> container. */
  useBR?: boolean;
  /** classPrefix: a string prefix added before class names in the generated markup, used for backwards compatibility with stylesheets. */
  classPrefix?: string;
  /** languages: an array of language names and aliases restricting auto detection to only these languages. */
  languages?: string[];
}

export interface AppHighlightResult {
  language?: string;
  r?: number;
  second_best?: any;
  top?: any;
  value?: string;
}
