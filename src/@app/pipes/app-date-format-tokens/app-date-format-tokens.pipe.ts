import { Pipe, PipeTransform } from '@angular/core';
import { DateTime } from 'luxon';

@Pipe({
  name: 'appDateFormatTokens',
  standalone: true
})
export class AppDateFormatTokensPipe implements PipeTransform {
  transform(value: DateTime | null, ...args: string[]): any {
    if (!args[0]) {
      throw new Error(
        '[DateFormatTokensPipe]: No args defined, please define your format.'
      );
    }

    return value ? value.toFormat(args[0]) : '';
  }
}
