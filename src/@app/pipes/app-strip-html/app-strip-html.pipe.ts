import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'appStripHtml',
  standalone: true
})
export class AppStripHtmlPipe implements PipeTransform {
  transform(html: string | undefined): string {
    if (!html) {
      return '';
    }

    return html?.replace(/<[^>]*>?/gm, '');
  }
}
