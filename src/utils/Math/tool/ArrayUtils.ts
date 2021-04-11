import Polygon from '../geometry/Polygon';
import Point from '../geometry/Point';

/*
 * @Author: lianbo
 * @Date: 2021-03-24 22:43:37
 * @LastEditors: lianbo
 * @LastEditTime: 2021-03-24 22:49:26
 * @Description:
 */
export default class ArrayUtils {
  static extent(values: any[], valueof: any): any[] {
    let min;
    let max;
    if (valueof === undefined) {
      for (const value of values) {
        if (value != null) {
          if (min === undefined) {
            if (value >= value) min = max = value;
          } else {
            if (min > value) min = value;
            if (max < value) max = value;
          }
        }
      }
    } else {
      let index = -1;
      for (let value of values) {
        if ((value = valueof(value, ++index, values)) != null) {
          if (min === undefined) {
            if (value >= value) min = max = value;
          } else {
            if (min > value) min = value;
            if (max < value) max = value;
          }
        }
      }
    }
    return [min, max];
  }
  static range(arg0: number, arg1: number, angleStep: number): number[] {
    const range = [];
    let current = arg0;
    while (current < arg1) {
      range.push(current);
      current += angleStep;
    }
    range.push(arg1);
    return range;
  }
}
