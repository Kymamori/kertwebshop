import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'price',
  standalone: true
})
export class PricePipe implements PipeTransform {
  transform(value: number, currency: string = 'Ft'): string {
    if (isNaN(value)) return '';
    return `${value.toLocaleString('hu-HU')} ${currency}`;
  }
}
