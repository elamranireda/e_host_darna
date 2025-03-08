import { NgModule } from '@angular/core';
import { AppHighlightDirective } from './app-highlight.directive';
import {
  APP_HIGHLIGHT_OPTIONS,
  AppHighlightOptions
} from './app-highlight.model';
/**
 * Import every language you wish to highlight here
 * NOTE: The name of each language must match the file name its imported from
 */
import xml from 'highlight.js/lib/languages/xml';
import scss from 'highlight.js/lib/languages/scss';
import typescript from 'highlight.js/lib/languages/typescript';
import { AppHighlightService } from './app-highlight.service';

/**
 * Import every language you wish to highlight here
 * NOTE: The name of each language must match the file name its imported from
 */
export function hljsLanguages() {
  return [
    { name: 'typescript', func: typescript },
    { name: 'scss', func: scss },
    { name: 'xml', func: xml }
  ];
}

@NgModule({
  providers: [
    {
      provide: APP_HIGHLIGHT_OPTIONS,
      useValue: {
        languages: hljsLanguages
      } as AppHighlightOptions
    },
    AppHighlightService
  ],
  imports: [AppHighlightDirective],
  exports: [AppHighlightDirective]
})
export class AppHighlightModule {}
