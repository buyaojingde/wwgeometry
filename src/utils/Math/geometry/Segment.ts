import MathUtils from "../math/MathUtils";
import Box from "./Box";
import Line2 from "./Line2";
import Point from "./Point";
import Vector2 from "./Vector2";

export default class Segment {
  public start: Point;
  public end: Point;

  public constructor(start: Point, end: Point) {
    this.start = start;
    this.end = end;
  }

  public get center(): Point {
    return new Point(
      (this.start.x + this.end.x) * 0.5,
      (this.start.y + this.end.y) * 0.5
    );
  }

  /**
   * @author lianbo
   * @date 2020-10-09 16:00:07
   * @Description: 方向
   */
  public get dir(): Vector2 {
    return this.end.subtract(this.start);
  }

  public get negativeDir(): Vector2 {
    if (this.start.y > this.end.y) {
      return this.end.subtract(this.start);
    }
    return this.start.subtract(this.end);
  }

  get box(): Box {
    return new Box(
      new Point(
        Math.min(this.start.x, this.end.x),
        Math.min(this.start.y, this.end.y)
      ),
      new Point(
        Math.max(this.start.x, this.end.x),
        Math.max(this.start.y, this.end.y)
      )
    );
  }

  get length(): number {
    return this.dir.length;
  }

  public isZero(epsilon: number = MathUtils.Epsilon): boolean {
    return this.start.equalTo(this.end, epsilon);
  }

  /**
   * @author lianbo
   * @date 2020-10-09 16:14:08
   * @Description: 线段向左偏移offset的距离得到一个新的线段,向右偏移只要把offset换成-offset就可以了
   */
  public leftSeg(offset: number): Segment {
    const nor = this.dir.ccwNormal.normalize;
    const translateV = nor.multiply(offset);
    const newStart = this.start.translate(translateV);
    const newEnd = this.end.translate(translateV);
    return new Segment(newStart, newEnd);
  }

  /**
   * @author lianbo
   * @date 2020-10-09 16:45:40
   * @Description: 垂直线段
   */
  public isVertical(epsilon: number = MathUtils.Epsilon): boolean {
    return (
      MathUtils.equal(this.start.x, this.end.x, epsilon) || // 两个点的x值非常接近，主要应对的是线段很短的情况
      MathUtils.equalZero(this.dir.normalize.x, epsilon)
    );
  }

  /**
   * @author lianbo
   * @date 2020-11-12 14:57:27
   * @Description: 水平线段
   */
  public isHorizontal(epsilon: number = MathUtils.Epsilon) {
    return (
      MathUtils.equal(this.start.y, this.end.y, epsilon) || // 两个点的y值非常接近，主要应对的是线段很短的情况
      MathUtils.equalZero(this.dir.normalize.y, epsilon)
    );
  }

  /**
   * @author lianbo
   * @date 2020-11-24 10:30:59
   * @Description: 完全包含另一条线
   */
  public containSeg(seg: Segment): boolean {
    return this.contain(seg.start) && this.contain(seg.end);
  }

  /**
   * @author lianbo
   * @date 2020-11-12 20:39:01
   * @Description: 与另一条线段相等
   */
  public equalTo(other: Segment) {
    return (
      (this.start.equalTo(other.start) && this.end.equalTo(other.end)) ||
      (this.end.equalTo(other.start) && this.start.equalTo(other.end))
    );
  }

  /**
   * @author lianbo
   * @date 2020-11-20 09:49:05
   * @Description: 点在线段上，包括端点
   */
  contain(p: Point): boolean {
    if (this.onEnd(p)) return true;
    if (
      (MathUtils.lessEqual(p.y, this.start.y) &&
        MathUtils.greaterEqual(p.y, this.end.y)) ||
      (MathUtils.greaterEqual(p.y, this.start.y) &&
        MathUtils.lessEqual(p.y, this.end.y))
    ) {
      if (MathUtils.equal(this.start.y, this.end.y)) {
        return (
          MathUtils.less(p.x, this.start.x) !== MathUtils.less(p.x, this.end.x)
        );
      }
      const pX =
        ((this.start.x - this.end.x) * (p.y - this.end.y)) /
          (this.start.y - this.end.y) +
        this.end.x;
      if (MathUtils.equal(p.x, pX)) return true;
    }
    return false;
  }

  public move(offset: Vector2): void {
    this.start.move(offset);
    this.end.move(offset);
  }

  /**
   * @author lianbo
   * @date 2020-10-10 19:06:01
   * @Description: 线段与线段相交，不包括端点，端点是另一种touch的情况，平行的情况是不会的
   */
  public intersect(other: Segment): Point[] {
    const ip: Point[] = [];
    if (this.box.noIntersect(other.box)) {
      return ip;
    }

    const newP = new Line2(this.start, this.end).intersectLine(
      new Line2(other.start, other.end)
    );
    if (newP && !this.onEnd(newP) && !other.onEnd(newP)) {
      ip.push(newP);
    }
    return ip;
  }

  /**
   * @author lianbo
   * @date 2020-10-10 19:06:01
   * @Description: 线段与一组线段相交，不包括端点，端点是另一种touch的情况，平行的情况是不会的
   */
  public intersectSegs(segs: Segment[]): Point[] {
    const ips: Point[] = [];
    segs.forEach((item) => ips.push(...this.intersect(item)));
    return ips;
  }

  /**
   * @author lianbo
   * @date 2020-10-12 09:36:55
   * @Description: 线段和线段的相接触的关系，但是没有相交
   */
  public touch(other: Segment): any {
    if (this.intersect(other).length > 0) {
      // 相交判断
      return null;
    }
    const tangent = this.tangent(other); // 相切
    if (tangent) {
      return tangent;
    }
    if (other.contain(this.start)) {
      //
      return this.start;
    }
    if (other.contain(this.end)) {
      //
      return this.end;
    }
    if (this.contain(other.start)) {
      //
      return other.start;
    }
    if (this.contain(other.end)) {
      //
      return other.end;
    }
    return null;
  }

  /**
   * @author lianbo
   * @date 2020-11-12 11:05:35
   * @Description: 两条线段已经平行，两条线段共线的部分，可能只有一个点
   */
  public tangent(other: Segment): Segment | null {
    if (!this.parallel(other)) {
      return null;
    }
    if (this.contain(other.start)) {
      if (this.contain(other.end)) {
        return other;
      } else {
        if (other.contain(this.end)) {
          return new Segment(other.start, this.end);
        } else {
          if (other.contain(this.start)) {
            return new Segment(other.start, this.start);
          } else {
            console.error("我怀疑不平行，说了要已经平行的！！！");
            return null;
          }
        }
      }
    } else {
      if (this.contain(other.end)) {
        if (other.contain(this.end)) {
          return new Segment(other.end, this.end);
        } else {
          if (other.contain(this.start)) {
            return new Segment(other.end, this.start);
          } else {
            console.error("我怀疑不平行，说了要已经平行的！！！");
            return null;
          }
        }
      } else {
        return null; // 没有共线部分
      }
    }
  }

  /**
   * @author lianbo
   * @date 2020-11-12 11:35:09
   * @Description: 水平或者垂直平行的线段，共线部分
   * 主要对应Box之间的相交，相切的判断
   */
  public tangentVH(other: Segment): Segment | null {
    if (
      this.isVertical() &&
      other.isVertical() &&
      MathUtils.equal(this.start.x, other.start.x)
    ) {
      const ySeg = MathUtils.overlap(
        this.start.y,
        this.end.y,
        other.start.y,
        other.end.y
      );
      if (ySeg) {
        const p0 = new Point(this.start.x, ySeg[0]);
        const p1 = new Point(this.start.x, ySeg[1]);
        return new Segment(p0, p1);
      } else {
        return null;
      }
    }

    if (
      this.isHorizontal() &&
      other.isHorizontal() &&
      MathUtils.equal(this.start.y, other.start.y)
    ) {
      const xSeg = MathUtils.overlap(
        this.start.x,
        this.end.x,
        other.start.x,
        other.end.x
      );
      if (xSeg) {
        const p0 = new Point(xSeg[0], this.start.y);
        const p1 = new Point(xSeg[1], this.start.y);
        return new Segment(p0, p1);
      } else {
        return null;
      }
    }
    return null;
  }

  /**
   * @author lianbo
   * @date 2020-11-12 16:05:01
   * @Description: 线段平行
   */
  public parallel(other: Segment, epsilon = MathUtils.Epsilon): boolean {
    if (other.isZero()) return false;
    return MathUtils.equalZero(
      this.dir.normalize.cross(other.dir.normalize),
      epsilon
    );
  }

  public clone(): Segment {
    return new Segment(this.start.clone(), this.end.clone());
  }

  /**
   * @author lianbo
   * @date 2020-11-19 17:31:36
   * @Description: 线段按点分割
   */
  public split(p: Point): any[] {
    if (this.start.equalTo(p)) {
      return [null, this.clone()];
    }
    if (this.end.equalTo(p)) {
      return [this.clone(), null];
    }
    return [
      new Segment(this.start.clone(), p),
      new Segment(p, this.end.clone()),
    ];
  }

  /**
   * @author lianbo
   * @date 2020-09-30 18:35:05
   * @Description: 点到线段的距离
   */
  public distanceToPoint(p: Point): { dis: number; closest: Point } {
    if (this.start.equalTo(this.end)) {
      //线段缩成一个点？
      return { dis: p.distanceToPoint(this.start), closest: this.start };
    }
    const closestPoint = new Line2(this.start, this.end).closestPoint(p);
    const segV = this.dir;
    const startV = closestPoint.subtract(this.start);
    const endV = closestPoint.subtract(this.end);
    const startDot = startV.dot(segV);
    const endDot = -endV.dot(segV);
    if (
      MathUtils.greaterEqual(startDot, 0) &&
      MathUtils.greaterEqual(endDot, 0)
    ) {
      const dist = p.distanceToPoint(closestPoint);
      return { dis: dist, closest: closestPoint };
    } else if (startDot < 0) {
      /* point is out of scope closer to ps */
      return { dis: p.distanceToPoint(this.start), closest: this.start };
    } else {
      /* point is out of scope closer to pe */
      return { dis: p.distanceToPoint(this.start), closest: this.end };
    }
  }

  /**
   * @author lianbo
   * @date 2020-09-30 17:10:09
   * @Description: 线段是否在线段范围内,包括端点
   */
  public inSegmentScope(p: Point): boolean {
    const segV = this.end.subtract(this.start);
    const startV = p.subtract(this.start);
    const endV = p.subtract(this.end);
    const startDot = startV.dot(segV);
    const endDot = -endV.dot(segV);
    return !!(
      MathUtils.greaterEqual(startDot, 0) && MathUtils.greaterEqual(endDot, 0)
    );
  }

  /**
   * @author lianbo
   * @date 2020-10-12 09:33:15
   * @Description: 点是否在线段的两侧端点上
   */
  public onEnd(p: Point): boolean {
    return p.equalTo(this.start) || p.equalTo(this.end);
  }

  /**
   * @author lianbo
   * @date 2020-11-25 11:35:31
   * @Description: 共线
   */
  public collinear(seg: Segment, epsilon = MathUtils.Epsilon): boolean {
    if (!this.parallel(seg, epsilon)) return false;
    return MathUtils.equalZero(
      new Line2(this.start, this.end).distanceToLine(seg.start),
      epsilon
    );
  }

  /**
   * @author lianbo
   * @date 2020-11-24 21:05:00
   * @Description: 一条线段减去另一条线段，共线的时候
   */
  public subtract(other: Segment, epsilon = MathUtils.Epsilon): Segment[] {
    if (!this.collinear(other, epsilon)) {
      return [this.clone()];
    }
    if (other.contain(this.start) && other.contain(this.end)) {
      return [];
    }
    if (this.contain(other.start) && this.contain(other.end)) {
      if (new Segment(this.start, other.start).contain(other.end)) {
        return [
          new Segment(this.start, other.end),
          new Segment(other.start, this.end),
        ];
      }
      return [
        new Segment(this.start, other.start),
        new Segment(other.end, this.end),
      ];
    }
    if (this.contain(other.start) && other.contain(this.end)) {
      return [new Segment(this.start, other.start)];
    }
    if (this.contain(other.start) && other.contain(this.start)) {
      return [new Segment(other.start, this.end)];
    }

    if (this.contain(other.end) && other.contain(this.end)) {
      return [new Segment(this.start, other.end)];
    }
    if (this.contain(other.end) && other.contain(this.start)) {
      return [new Segment(other.end, this.end)];
    }
    return [this.clone()];
  }

  /**
   * @author lianbo
   * @date 2020-11-27 16:28:17
   * @Description: 被多条线段去减，看剩余的线段
   */
  public subtracted(others: Segment[], epsilon = MathUtils.Epsilon): Segment[] {
    let difference: Segment[] = [this.clone()];
    for (const other of others) {
      if (difference.length === 0) {
        break;
      }
      let result: any[] = [];
      for (const seg of difference) {
        const dif = seg.subtract(other);
        if (dif.length > 0) {
          dif.forEach((item: Segment) => {
            if (!item.isZero()) {
              result.push(item);
            }
          });
        }
      }
      difference = result;
    }
    return difference;
  }
}
