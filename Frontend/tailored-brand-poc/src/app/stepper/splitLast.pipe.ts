import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'splitlast' })
export class SplitLastPipe implements PipeTransform {
  transform(value:string, [separator]):string {
    let splits = value.split(separator);
    if(splits.length > 1) {
      return splits.pop();
    } else {
      return '';
    }
  }
}