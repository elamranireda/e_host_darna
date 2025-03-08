import { ModuleWithProviders, NgModule } from '@angular/core';
import Showdown from 'showdown';
import { AppShowdownConfig } from './app-showdown-config.provider';
import { AppShowdownConverter } from './app-showdown-converter.provider';
import { AppShowdownComponent } from './app-showdown.component';
import { AppShowdownPipe } from './app-showdown.pipe';
import { AppShowdownSourceDirective } from './app-showdown-source.directive';

/**
 * @internal
 */
const DECLARATIONS = [
  AppShowdownComponent,
  AppShowdownPipe,
  AppShowdownSourceDirective
];

/**
 * ### Example
 *
 * Add `ShowdownModule` to app `imports`.
 * ```typescript
 * import { NgModule } from '@angular/core';
 * import { ShowdownModule } from 'ngx-app-showdown';
 *
 * @NgModule({
 *   imports: [ ShowdownModule ];
 * })
 * export class AppModule {}
 * ```
 */
@NgModule({
  imports: [...DECLARATIONS],
  providers: [AppShowdownConverter],
  exports: DECLARATIONS
})
export class AppShowdownModule {
  /**
   * __Example :__
   *
   * Add `ShowdownModule` to app `imports` with config.
   * ```typescript
   * import { NgModule } from '@angular/core';
   * import { ShowdownModule } from 'ngx-app-showdown';
   *
   * @NgModule({
   *   imports: [ ShowdownModule.forRoot({
   *     smartIndentationFix: true,
   *     foo: 'bar',
   *     flavor: 'github',
   *     extensions: [ {type:'listener', listeners: {'codeBlocks.after': console.log}} ]
   *   }) ];
   * })
   * export class AppModule {}
   * ```
   * @param config - A root converter config for all converter instances.
   */
  static forRoot(
    config: AppShowdownConfig | Showdown.ConverterOptions
  ): ModuleWithProviders<AppShowdownModule> {
    return {
      ngModule: AppShowdownModule,
      providers: [{ provide: AppShowdownConfig, useValue: config }]
    };
  }
}
