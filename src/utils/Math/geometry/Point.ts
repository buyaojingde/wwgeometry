import Segment from "./Segment";
import MathUtils from "../math/MathUtils";
import Vector2 from "./Vector2";
import Line from "./Line";

/**
 * @author lianbo
 * @date 2020-10-09 14:41:20
 * @Description: 表示以一个点，不表示方向，也不是向量
 */
export default class Point {
  public static zero = new Point(0, 0);
  public x: number;
  public y: number;

  public constructor(x: number = 0, y: number) {
    this.x = x;
    this.y = y;
  }

  /**
   * @author lianbo
   * @date 2020-09-30 18:48:03
   * @Description: 两个点比较
   */
  public equalTo(p: Point) {
    if (MathUtils.equal(this.x, p.x) && MathUtils.equal(this.y, p.y)) {
      return true;
    }
    return false;
  }

  /**
   * @author lianbo
   * @date 2020-09-30 15:33:03
   * @Description: 点在线段上，包括端点
   */
  public on(seg: Segment): boolean {
    return MathUtils.equalZero(this.distanceToSegment(seg));
  }

  /**
   * @author lianbo
   * @date 2020-10-12 09:33:15
   * @Description: 点是否在线段的两侧端点上
   */
  public touch(seg: Segment): boolean {
    return this.equalTo(seg.start) || this.equalTo(seg.end);
  }

  /**
   * @author lianbo
   * @date 2020-09-30 15:58:12
   * @Description: 点到点的距离
   */
  public distanceToPoint(p: Point): number {
    let dx = p.x - this.x;
    let dy = p.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * @author lianbo
   * @date 2020-09-30 18:47:24
   * @Description: 点按向量平移
   */
  public translate(v: Vector2): Point {
    return new Point(this.x + v.x, this.y + v.y);
  }

  /**
   * @author lianbo
   * @date 2020-09-30 17:10:09
   * @Description: 线段是否在线段范围内,包括端点
   */
  public inSegmentScope(seg: Segment): boolean {
    const segV = new Vector2(seg.start, seg.end);
    const startV = new Vector2(seg.start, this);
    const endV = new Vector2(seg.end, this);
    const startDot = startV.dot(segV);
    const endDot = -endV.dot(segV);
    if (
      MathUtils.greaterEqual(startDot, 0) &&
      MathUtils.greaterEqual(endDot, 0)
    ) {
      return true;
    }
    return false;
  }

  /**
   * @author lianbo
   * @date 2020-09-30 18:35:05
   * @Description: 点到线段的距离
   */
  public distanceToSegment(seg: Segment): any {
    if (seg.start.equalTo(seg.end)) {
      //线段缩成一个点？
      return this.distanceToPoint(seg.start);
    }
    const closestPoint = this.closestPoint(new Line(seg.start, seg.end));
    const segV = new Vector2(seg.start, seg.end);
    const startV = new Vector2(seg.start, closestPoint);
    const endV = new Vector2(seg.end, closestPoint);
    const startDot = startV.dot(segV);
    const endDot = -endV.dot(segV);
    if (
      MathUtils.greaterEqual(startDot, 0) &&
      MathUtils.greaterEqual(endDot, 0)
    ) {
      const dist = this.distanceToPoint(closestPoint);
      return { dis: dist, close: closestPoint };
    } else if (startDot < 0) {
      /* point is out of scope closer to ps */
      return this.distanceToPoint(seg.start);
    } else {
      /* point is out of scope closer to pe */
      return this.distanceToPoint(seg.end);
    }
  }

  /**
   * @author lianbo
   * @date 2020-10-09 17:35:09
   * @Description: 点到直线的距离
   */
  public distanceToLine(line: Line): number {
    const startV = new Vector2(line.p, this);
    return startV.dot(line.normal);
  }

  /**
   * @author lianbo
   * @date 2020-09-30 18:43:21
   * @Description: 点到直线的垂足
   */
  public closestPoint(line: Line): Point {
    const n = line.normal;
    const startV = new Vector2(line.p, this);
    const translateLength = n.dot(startV);
    return line.p.translate(n.multiply(translateLength));
  }
}
