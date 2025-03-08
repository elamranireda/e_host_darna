import { Pipe, PipeTransform } from '@angular/core';
import { DateTime } from 'luxon';

@Pipe({
  name: 'appDateFormatRelative',
  standalone: true
})
export class AppDateFormatRelativePipe implements PipeTransform {
  transform(value: DateTime | null | undefined | string, ...args: any[]): any {
    if (!value) {
      return;
    }

    if (!(value instanceof DateTime)) {
      value = DateTime.fromISO(value);
    }

    return value.toRelative();
  }
}
