import MathUtils from '../math/MathUtils';
import Point from './Point';
import Segment from './Segment';

export default class Box {
  public min: Point;
  public max: Point;

  public constructor(min: Point, max: Point) {
    this.min = min;
    this.max = max;
    this._width = this.max.x - this.min.x;
    this._height = this.max.y - this.min.y;
  }

  private _width: number;

  get width(): number {
    return this._width;
  }

  private _height: number;

  get height(): number {
    return this._height;
  }

  get center() {
    return new Point(
      (this.min.x + this.max.x) / 2,
      (this.min.y + this.max.y) / 2
    );
  }

  /**
   * @author lianbo
   * @date 2020-11-12 15:07:27
   * @Description: Box的点分布
   *
   *   0 ************* 1
   *     *           *
   *     *           *
   *     *           *
   *   3 ************* 2
   */
  get points(): Point[] {
    return [
      new Point(this.min.x, this.min.y),
      new Point(this.max.x, this.min.y),
      new Point(this.max.x, this.max.y),
      new Point(this.min.x, this.max.y),
    ];
  }

  /**
   * @author lianbo
   * @date 2020-11-12 15:09:32
   * @Description: 线段的分部
   *          0
   *     *************
   *     *           *
   *  3  *           * 1
   *     *           *
   *     *************
   *          2
   *
   */
  get edges(): Segment[] {
    const ps = this.points;
    return [
      new Segment(ps[3], ps[0]),
      new Segment(ps[0], ps[1]),
      new Segment(ps[1], ps[2]),
      new Segment(ps[2], ps[3]),
    ];
  }

  /**
   * @author lianbo
   * @date 2020-11-27 14:04:44
   * @Description:
   */
  noIntersect(other: Box) {
    return (
      MathUtils.less(this.max.x, other.min.x) ||
      MathUtils.greater(this.min.x, other.max.x) ||
      MathUtils.less(this.max.y, other.min.y) ||
      MathUtils.greater(this.min.y, other.max.y)
    );
  }

  /**
   * @author lianbo
   * @date 2020-10-23 17:39:16
   * @Description: 点是否在矩形内，不包括边界；
   */
  contain(p: Point): boolean {
    return !(
      MathUtils.greaterEqual(p.x, this.max.x) ||
      MathUtils.lessEqual(p.x, this.min.x) ||
      MathUtils.greaterEqual(p.y, this.max.y) ||
      MathUtils.lessEqual(p.y, this.min.y)
    );
  }

  containSeg(seg: Segment): boolean {
    return this.contain(seg.start) && this.contain(seg.end);
  }

  /**
   * @author lianbo
   * @date 2020-11-12 16:44:15
   * @Description: 点在矩形外，不包括边界
   */
  exclude(p: Point): boolean {
    return (
      MathUtils.less(p.x, this.min.x) ||
      MathUtils.less(p.y, this.min.y) ||
      MathUtils.greater(p.y, this.max.y) ||
      MathUtils.greater(p.x, this.max.x)
    );
  }

  /**
   * @author lianbo
   * @date 2020-11-12 15:14:08
   * @Description: box之间的边相切，不相交，返回相切部分的边，只考虑外切的情况
   */
  outsideTouch(other: Box): { seg: Segment; index: number }[] {
    const tangentS: { seg: Segment; index: number }[] = [];
    if (this.noIntersect(other)) return tangentS;
    for (const p of other.points) {
      // 不考虑内部的情况
      if (this.contain(p)) {
        return tangentS;
      }
    }
    for (const p of this.points) {
      if (other.contain(p)) {
        return tangentS;
      }
    }
    const edges = this.edges;
    const others = other.edges;
    const otherIndex = [2, 3, 0, 1];
    for (let i = 0; i < edges.length; i++) {
      const edge = edges[i];
      const index = otherIndex[i];
      const otherE = others[index];
      const tangent = edge.tangentVH(otherE);
      // 排除只有角和角相切的情况
      if (tangent && !tangent.isZero()) {
        tangentS.push({ seg: tangent, index: i }); //好像没必要，直接break就可以了
      }
    }
    if (tangentS.length > 1) {
      throw new Error('algorithm error!'); // 理论上两个box只可能有一个外切边，如果有多个，肯定时算法出错了
    }
    return tangentS;
  }

  public offset(val: number) {
    const newMinX = this.min.x - val;
    const newMinY = this.min.y - val;
    const newMaxX = this.max.x + val;
    const newMaxY = this.max.y + val;
    return new Box(new Point(newMinX, newMinY), new Point(newMaxX, newMaxY));
  }

  /**
   * @author lianbo
   * @date 2020-11-25 21:50:41
   * @Description: 类似下面这种
   *
   *
   *        *******************
   *        *     *   *        *
   *        *     *   *        *
   *        *     *   *        *
   *        *******************
   *
   */
  public doubleCollinear(other: Box) {
    let collinearCount = 0;
    for (let i = 0; i < 4; i++) {
      const tangent = this.edges[i].tangentVH(other.edges[i]);
      if (tangent && !tangent.isZero(1)) {
        collinearCount++;
      }
    }
    if (collinearCount > 1) {
      return true;
    }
    return false;
    // if (
    //   this.edges[0].collinear(other.edges[0]) &&
    //   this.edges[2].collinear(other.edges[2])
    // ) {
    //   if (MathUtils.greater(this.max.x, other.min.x, 1)) return true;
    //   if (MathUtils.greater(other.max.x, this.min.x, 1)) return true;
    // }
    // if (
    //   this.edges[3].collinear(other.edges[3]) &&
    //   this.edges[1].collinear(other.edges[1])
    // ) {
    //   if (MathUtils.greater(this.max.y, other.min.y, 1)) return true;
    //   if (MathUtils.greater(other.max.y, this.min.y, 1)) return true;
    // }
    // return false;
  }
}
