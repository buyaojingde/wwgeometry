import Point from './Point';
import Vector2 from './Vector2';
import MathUtils from '../math/MathUtils';
import Box from './Box';
import Line from './Line';

export default class Segment {

  public start: Point;
  public end: Point;

  public constructor(start: Point, end: Point) {
    this.start = start;
    this.end = end;
  }

  public get center(): Point {
    return new Point((this.start.x + this.end.x) * 0.5, (this.start.y + this.end.y) * 0.5);
  }

  /**
   * @author lianbo
   * @date 2020-10-09 16:00:07
   * @Description: 斜率
   */
  public get slope(): Vector2 {
    return new Vector2(this.start, this.end);
  }

  /**
   * @author lianbo
   * @date 2020-10-09 16:14:08
   * @Description: 线段向左偏移offset的距离得到一个新的线段,向右偏移只要把offset换成-offset就可以了
   */
  public leftSeg(offset: number): Segment {
    const nor = this.slope.ccwNormal().normalize;
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
  public isVertical(epsilon: number):boolean {
    return (
      MathUtils.equal(this.start.x, this.end.x, epsilon) || // 两个点的x值非常接近，主要应对的是线段很短的情况
      MathUtils.equal(Math.abs(this.angle), Math.PI * 0.5, epsilon)
    );
  }

  /**
   * @author lianbo
   * @date 2020-10-09 16:39:01
   * @Description: 线段与Xz轴的夹角，范围在-π到π之间
   */
  public get angle(): number {
    const slope = this.slope;
    return Math.atan2(slope.y, slope.x);
  }

  contain(v: Point):boolean {
    return v.on(this);
  }

  get box():Box {
    return new Box(
      new Point(Math.min(this.start.x, this.end.x),
        Math.min(this.start.y, this.end.y)),
      new Point(Math.max(this.start.x, this.end.x),
        Math.max(this.start.y, this.end.y)),
    );
  }

  get length():number{
    return this.slope.length;
  }

  get isZero():boolean{
    return MathUtils.equalZero(this.length);
  }

  /**
   * @author lianbo
   * @date 2020-10-10 19:06:01
   * @Description: 线段与线段相交，不包括端点，端点是另一种touch的情况
  */
  public intersect(other: Segment): Point[] {
    const ip:Point[] = [];
    if(this.box.noIntersect(other.box)){
      return ip;
    }

    const newP = new Line(this.start,this.end).intersectLine(new Line(other.start,other.end));
    if (newP && !newP.touch(this) && !newP.touch(other)) {
      ip.push(newP);
    }
    return ip;
  }

  /**
   * @author lianbo
   * @date 2020-10-12 09:36:55
   * @Description: 线段和线段的相接触的关系，但是没有相交
  */
  public touch(other:Segment):Point[] {
    const ip:Point[] = [];
    if (this.isZero) {
      if (this.start.on(other)) {
        ip.push(this.start);
      }
      return ip;
    }

    if (other.isZero) {
      if (other.start.on(this)) {
        ip.push(other.start);
      }
      return ip;
    }
    //TODO：
  }
}
