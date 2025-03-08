import {
  Directive,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';
import { AppHighlightResult } from './app-highlight.model';
import { AppHighlightService } from './app-highlight.service';

@Directive({
  selector: '[appHighlight]',
  host: {
    '[class.hljs]': 'true',
    '[innerHTML]': 'highlightedCode'
  },
  standalone: true
})
export class AppHighlightDirective implements OnChanges {
  /** Highlighted Code */
  highlightedCode?: string;

  /** An optional array of language names and aliases restricting detection to only those languages.
   * The subset can also be set with configure, but the local parameter overrides the option if set.
   */
  @Input() languages: string[] = [];

  /** Highlight code input */
  @Input('appHighlight') code!: string;

  /** Stream that emits when code string is highlighted */
  @Output() highlighted = new EventEmitter<AppHighlightResult>();

  constructor(
    private _highlightService: AppHighlightService,
    private _zone: NgZone
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes['code'] &&
      changes['code'].currentValue !== changes['code'].previousValue
    ) {
      this.highlightElement(this.code, this.languages);
    }
  }

  /**
   * Highlighting with language detection and fix markup.
   * @param code Accepts a string with the code to highlight
   * @param languages An optional array of language names and aliases restricting detection to only those languages.
   * The subset can also be set with configure, but the local parameter overrides the option if set.
   */
  highlightElement(code: string, languages: string[]) {
    this._zone.runOutsideAngular(() => {
      const res = this._highlightService.highlightAuto(code, languages);
      this.highlightedCode = res.value;
      this.highlighted.emit(res);
    });
  }
}
