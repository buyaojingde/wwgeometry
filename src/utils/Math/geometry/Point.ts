import MathUtils from '../math/MathUtils';
import Polygon from './Polygon';
import Vector2 from './Vector2';

/**
 * @author lianbo
 * @date 2020-10-09 14:41:20
 * @Description: 表示以一个点，不表示方向，也不是向量
 */
export default class Point {
  public static ZERO: Point = new Point(0, 0);
  public x: number;
  public y: number;

  public constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  public subtract(p: Point) {
    return new Vector2(this.x - p.x, this.y - p.y);
  }

  /**
   * @author lianbo
   * @date 2020-09-30 18:48:03
   * @Description: 两个点比较
   */
  public equalTo(p: Point, epsilon: number = MathUtils.Epsilon) {
    return !!(
      MathUtils.equal(this.x, p.x, epsilon) &&
      MathUtils.equal(this.y, p.y, epsilon)
    );
  }

  public clone(): Point {
    return new Point(this.x, this.y);
  }

  public copy(p: Point): void {
    this.x = p.x;
    this.y = p.y;
  }

  /**
   * @author lianbo
   * @date 2020-09-30 15:58:12
   * @Description: 点到点的距离
   */
  public distanceToPoint(p: Point): number {
    return Math.sqrt(this.distanceToPointSquared(p));
  }

  /**
   * @author lianbo
   * @date 2020-11-06 09:38:28
   * @Description: 距离的平方，仅仅比较大小时减少运算量
   */
  public distanceToPointSquared(p: Point): number {
    const dx = p.x - this.x;
    const dy = p.y - this.y;
    return dx * dx + dy * dy;
  }

  /**
   * @author lianbo
   * @date 2020-09-30 18:47:24
   * @Description: 点按向量转换成另一个点
   */
  public translate(v: any): Point {
    return new Point(this.x + v.x, this.y + v.y);
  }

  /**
   * @author lianbo
   * @date 2020-11-06 09:37:51
   * @Description: 点按向量移动到新的位置
   */
  public move(offset: Vector2): Point {
    this.x = this.x + offset.x;
    this.y = this.y + offset.y;
    return this;
  }

  /**
   * @author lianbo
   * @date 2020-10-23 10:28:31
   * @Description: 当前点加偏移量
   */
  public add(v: Vector2): Point {
    this.x = this.x + v.x;
    this.y = this.y + v.y;
    return this;
  }

  public get toArray(): number[] {
    return [this.x, this.y];
  }

  /**
   * @author lianbo
   * @date 2020-12-09 21:05:08
   * @Description: 点和点之间大小比较
   */
  public less(p: Point): boolean {
    if (this.x === p.x) {
      return this.y < p.y;
    }
    return this.x < p.x;
  }
  /**
   * @author lianbo
   * @date 2021-01-05 17:08:53
   * @Description: 点膨胀成一个圆
   */
  // public offset(dis: number): Polygon {}
}
