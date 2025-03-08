import { Injectable, Optional } from '@angular/core';
import Showdown from 'showdown';
import { AppShowdownConfig } from './app-showdown-config.provider';

/**
 * @internal
 */
let { hasOwnProperty } = {};

/**
 * ### Example
 *
 * Setup as standalone
 * ```typescript
 * import { NgModule } from '@angular/core';
 * import { ShowdownConverter } from 'ngx-app-showdown';
 *
 * @NgModule({
 *   providers: [ ShowdownConverter ];
 * })
 * export class AppModule {}
 * ```
 *
 * Use the converter instance.
 * ```typescript
 * import { Injectable } from '@angular/core';
 * import { ShowdownConverter } from 'ngx-app-showdown';
 *
 * @Injectable()
 * export class SomeService {
 *   constructor(showdownConverter: ShowdownConverter) {
 *     let markdown: string = "**Some**";
 *     let html: string = showdownConverter.makeHtml(markdown);
 *     console.log(`some:\nmarkdown: ${markdown)\nhtml: ${html}\n`);
 *   }
 * }
 * ```
 */
@Injectable()
export class AppShowdownConverter extends Showdown.Converter {
  constructor(@Optional() config?: AppShowdownConfig) {
    super(config && { extensions: config.extensions });
    this.setFlavor((config && config.flavor) || 'vanilla');

    if (config) {
      this.setOptions(config);
    }
  }

  /**
   * Set options to the converter.
   *
   * @param options - A options object to set.
   */
  public setOptions(options: Showdown.ShowdownOptions): void {
    for (let key in options) {
      if (hasOwnProperty.call(options, key)) {
        this.setOption(key, options[key]);
      }
    }
  }
}
