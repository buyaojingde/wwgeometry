import Point from './Point';
import Vector2 from './Vector2';
import MathUtils from '../math/MathUtils';

/**
 * @author lianbo
 * @date 2020-10-09 14:49:52
 * @Description: 一条无限长的直线
 */
export default class Line {

  public p: Point;
  public normal: Vector2;

  public constructor(p: Point, nor: Vector2 | Point) {
    this.p = p;
    if (nor instanceof Vector2) {
      this.normal = nor;
    }
    if (nor instanceof Point) {
      this.normal = new Vector2(p, nor).ccwNormal().normalize;
    }
  }

  /**
   * Get coefficients [A,B,C] of a standard line equation in the form Ax + By = C
   * @code [A, B, C] = line.standard
   * @returns {number[]} - array of coefficients
   */
  get standard(): number[] {
    let A = this.normal.x;
    let B = this.normal.y;
    let C = this.normal.dot(new Vector2(this.p.x, this.p.y));

    return [A, B, C];
  }

  /**
   * @author lianbo
   * @date 2020-10-10 16:29:21
   * @Description: 线与线的交点，方程组求解
   */
  public intersectLine(line: Line): Point {
    let [A1, B1, C1] = this.standard;
    let [A2, B2, C2] = line.standard;

    /* Cramer's rule */
    let det = A1 * B2 - B1 * A2;
    let detX = C1 * B2 - B1 * C2;
    let detY = A1 * C2 - C1 * A2;

    if (!MathUtils.equalZero(det)) {
      let x, y;

      if (B1 === 0) {        // vertical line x  = C1/A1, where A1 == +1 or -1
        x = C1 / A1;
        y = detY / det;
      } else if (B2 === 0) {   // vertical line x = C2/A2, where A2 = +1 or -1
        x = C2 / A2;
        y = detY / det;
      } else if (A1 === 0) {   // horizontal line y = C1/B1, where B1 = +1 or -1
        x = detX / det;
        y = C1 / B1;
      } else if (A2 === 0) {   // horizontal line y = C2/B2, where B2 = +1 or -1
        x = detX / det;
        y = C2 / B2;
      } else {
        x = detX / det;
        y = detY / det;
      }

      return new Point(x, y);
    }
    return null;
  }
}
