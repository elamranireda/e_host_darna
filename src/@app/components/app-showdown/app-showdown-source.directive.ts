import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  Directive,
  EventEmitter,
  Input,
  OnChanges,
  Output
} from '@angular/core';
import { AppShowdownComponent } from './app-showdown.component';
import { catchError, EMPTY } from 'rxjs';

/**
 * A angular directive to `ShowdownComponent` for make http request of markdown content.
 *
 * ### Example
 *
 * Setup as standalone
 * ```typescript
 * import { NgModule } from '@angular/core';
 * import { HttpClientModule } from '@angular/common/http';
 * import { ShowdownComponent, SourceDirective } from 'ngx-app-showdown';
 *
 * @NgModule({
 *    declarations: [ ShowdownComponent, SourceDirective ],
 *    imports: [ HttpClientModule ]
 * })
 * export class AppModule {}
 * ```
 *
 * Bind url `src` directive
 * ```typescript
 * import { Component } from '@angular/core';
 *
 * @Component({
 *     selector: 'some',
 *     template: '<app-showdown [src]="url" smartIndentationFix>**Loading...**</app-showdown>
 * })
 * class SomeComponent {
 *     url: string = 'https://unpkg.com/ngx-showdown/README.md';
 *     // ...
 * }
 * ```
 *
 * Set static url
 * ```html
 * <app-showdown src="README.md" [options]="{noHeaderId: true}"></app-showdown>
 * ```
 *
 * Set template reference variable
 * ```html
 * <app-showdown #source="source" src="README.md"></app-showdown>
 * ```
 *
 * Listening to `error` events.
 * ```html
 * <app-showdown #sd src="http://url.error" (error)="sd.render('# '+$event.message)"></app-showdown>
 * ```
 */
@Directive({
  selector: 'app-showdown[src],[app-showdown][src]',
  exportAs: 'source',
  standalone: true
})
export class AppShowdownSourceDirective implements OnChanges {
  /**
   * The source url of the markdown content.
   *
   * __Example :__
   *
   * Set static url to `src` directive.
   * ```html
   * <app-showdown src="https://unpkg.com/ngx-showdown/README.md"></app-showdown>
   * ```
   *
   * Bind url to `src` directive.
   * ```html
   * <input type="text" #url placeholder="url" />
   * <button (click)="src = url.value">Load</button>
   * <app-showdown [src]="src">**Loading...**</app-showdown>
   * ```
   */
  @Input() src?: string;

  /**
   * On error occur.
   *
   * __Example :__
   *
   * ```html
   * <input type="text" placeholder="url" [(ngModel)]="url"/>
   * <app-showdown [src]="url" (error)="sd.render('# Error\n> '+$event.message)">**Loading...**</app-showdown>
   * ```
   */
  @Output() error: EventEmitter<HttpErrorResponse> = new EventEmitter();

  constructor(
    private _showdownComponent: AppShowdownComponent,
    private _http: HttpClient
  ) {}

  /**
   * A angular lifecycle method, Use to call to `load` method on src init/changes
   * @internal
   */
  ngOnChanges(): void {
    this.load();
  }

  /**
   * Load the markdown content of {@link AppShowdownSourceDirective#src} url to {@link AppShowdownComponent#value}.
   *
   * __Example :__
   *
   * ```html
   * <input type="text" #url value="source.src" placeholder="Url" />
   * <button (click)="source.load(url.value)">Load</button>
   * <app-showdown #source="source" src="https://unpkg.com/ngx-showdown/README.md"></app-showdown>
   * ```
   * @param url - A url of markdown content to load (it will override the current url of `SourceDirective#src`)
   */
  public load(url?: string): void {
    if (url) {
      this.src = url;
    }

    if (this.src) {
      this._http
        .get(this.src, { responseType: 'text' })
        .pipe(
          catchError((error: HttpErrorResponse) => {
            this.error.emit(error);
            return EMPTY;
          })
        )
        .subscribe((response: string) => {
          this._showdownComponent.render(response);
        });
    }
  }
}
