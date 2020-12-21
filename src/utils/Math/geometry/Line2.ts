import MathUtils from '../math/MathUtils';
import Point from './Point';
import Vector2 from './Vector2';

/**
 * @author lianbo
 * @date 2020-10-09 14:49:52
 * @Description: 一条无限长的直线
 */
export default class Line2 {
  public p: Point;
  public normal!: Vector2;

  public constructor(p: Point, nor: Vector2 | Point) {
    this.p = p;
    if (nor instanceof Vector2) {
      this.normal = nor.normalize;
    }
    if (nor instanceof Point) {
      this.normal = nor.subtract(p).ccwNormal.normalize;
    }
  }

  public get dir(): Vector2 {
    return this.normal.cwNormal;
  }

  /**
   * Get coefficients [A,B,C] of a standard line equation in the form Ax + By = C
   * @code [A, B, C] = line.standard
   * @returns {number[]} - array of coefficients
   */
  get standard(): number[] {
    const A = this.normal.x;
    const B = this.normal.y;
    const C = this.normal.dot(new Vector2(this.p.x, this.p.y));

    return [A, B, C];
  }

  /**
   * @author lianbo
   * @date 2020-11-12 16:01:52
   * @Description: 误差角度默认是1
   */
  public parallel(other: Line2): boolean {
    return MathUtils.equalZero(this.normal.cross(other.normal));
  }

  /**
   * @author lianbo
   * @date 2020-10-10 16:29:21
   * @Description: 线与线的交点，方程组求解
   */
  public intersectLine(line: Line2): Point | null {
    const [A1, B1, C1] = this.standard;
    const [A2, B2, C2] = line.standard;

    /* Cramer's rule */
    const det = A1 * B2 - B1 * A2;
    const detX = C1 * B2 - B1 * C2;
    const detY = A1 * C2 - C1 * A2;

    if (!MathUtils.equalZero(det)) {
      let x, y;

      if (B1 === 0) {
        // 判断 === 0 要不要使用MathUtils.equalZero,待验证
        // vertical line x  = C1/A1, where A1 == +1 or -1
        x = C1 / A1;
        y = detY / det;
      } else if (B2 === 0) {
        // vertical line x = C2/A2, where A2 = +1 or -1
        x = C2 / A2;
        y = detY / det;
      } else if (A1 === 0) {
        // horizontal line y = C1/B1, where B1 = +1 or -1
        x = detX / det;
        y = C1 / B1;
      } else if (A2 === 0) {
        // horizontal line y = C2/B2, where B2 = +1 or -1
        x = detX / det;
        y = C2 / B2;
      } else {
        x = detX / det;
        y = detY / det;
      }

      return new Point(x, y);
    }
    return null; // 平行
  }

  /**
   * @author lianbo
   * @date 2020-10-09 17:35:09
   * @Description: 点到直线的距离
   */
  public distanceToLine(p: Point): number {
    const startV = p.subtract(this.p);
    return startV.dot(this.normal);
  }

  /**
   * @author lianbo
   * @date 2020-09-30 18:43:21
   * @Description: 点到直线的垂足
   */
  public closestPoint(p: Point): Point {
    const n = this.dir;
    const startV = p.subtract(this.p);
    const translateLength = n.dot(startV);
    return this.p.translate(n.multiply(translateLength));
  }

  /**
   * @author lianbo
   * @date 2020-12-10 14:02:23
   * @Description: 根据直线方程，从Y得到X
   *  y = mx + b; b = y0 - mx0; m = dir.y / dir.x;
   */
  public getXFromY(y: number): number {
    if (MathUtils.equalZero(this.dir.y)) return this.p.x; //  平行
    if (MathUtils.equalZero(this.dir.x)) return this.p.x; // 垂直
    const m = this.dir.y / this.dir.x;
    const b = this.p.y - this.p.x * m;
    const x = (y - b) / m;
    return x;
  }

  /**
   * @author lianbo
   * @date 2020-12-10 14:02:23
   * @Description: 根据直线方程，从Y得到X
   *  y = mx + b; b = y0 - mx0; m = dir.y / dir.x;
   */
  public getYFromX(x: number): number {
    if (MathUtils.equalZero(this.dir.y)) return this.p.y; //  水平
    if (MathUtils.equalZero(this.dir.x)) return this.p.y; // 垂直
    const m = this.dir.y / this.dir.x;
    const b = this.p.y - this.p.x * m;
    const y = m * x + b;
    return y;
  }
}
