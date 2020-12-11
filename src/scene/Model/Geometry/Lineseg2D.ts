import MathTool from "../Util/MathTool";
import Vector2DTool from "../Util/Vector2DTool";
import Line2D from "./Line2D";
import Vector2D from "./Vector2D";

export default class Lineseg2D {
  constructor(ptStart: Vector2D, ptEnd: Vector2D) {
    this._start = ptStart.clone();
    this._end = ptEnd.clone();
  }

  get debugCad(): string {
    return (
      "Line " +
      this._start.x +
      "," +
      this._start.y +
      " " +
      this._end.x +
      "," +
      this._end.y +
      "  "
    );
  }

  set debugCad(s: string) {
    // only for debug
  }

  get length(): number {
    return this._start.distance(this._end);
  }

  get center(): Vector2D {
    return this.interpolate(0.5);
  }

  // extthis._ends Object implements ICloneable
  private _start: Vector2D;

  get start(): Vector2D {
    return this._start;
  }

  set start(pt: Vector2D) {
    this._start = pt;
  }

  private _end: Vector2D;

  get end(): Vector2D {
    return this._end;
  }

  set end(pt: Vector2D) {
    this._end = pt;
  }

  public static distanceToSegment(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    x4: number,
    y4: number
  ): number {
    const ux = x2 - x1;
    const uy = y2 - y1;

    const vx = x4 - x3;
    const vy = y4 - y3;

    const wx = x1 - x3;
    const wy = y1 - y3;

    const a = ux * ux + uy * uy;
    const b = ux * vx + uy * vy;
    const c = vx * vx + vy * vy;
    const d = ux * wx + uy * wy;
    const e = vx * wx + vy * wy;
    const dt = a * c - b * b;

    let sc = 0.0;
    let sn = 0.0;
    let tc = 0.0;
    let tn = 0.0;
    let sd = dt;
    let td = dt;

    if (MathTool.numberEquals(dt, 0.0)) {
      sn = 0.0;
      sd = 1.0;
      tn = e;
      td = c;
    } else {
      sn = b * e - c * d;
      tn = a * e - b * d;
      if (sn < 0.0) {
        sn = 0.0;
        tn = e;
        td = c;
      } else if (sn > sd) {
        sn = sd;
        tn = e + b;
        td = c;
      }
    }

    if (tn < 0.0) {
      tn = 0.0;
      if (-d < 0.0) {
        sn = 0.0;
      } else if (-d > a) {
        sn = sd;
      } else {
        sn = -d;
        sd = a;
      }
    } else if (tn > td) {
      tn = td;
      if (-d + b < 0.0) {
        sn = 0.0;
      } else if (-d + b > a) {
        sn = sd;
      } else {
        sn = -d + b;
        sd = a;
      }
    }

    if (MathTool.numberEquals(sn, 0.0)) {
      sc = 0.0;
    } else {
      sc = sn / sd;
    }

    if (MathTool.numberEquals(tn, 0.0)) {
      tc = 0.0;
    } else {
      tc = tn / td;
    }

    const dx = wx + sc * ux - tc * vx;
    const dy = wy + sc * uy - tc * vy;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**是否重合*/

  public static isSuperposition(
    line1: Lineseg2D,
    line2: Lineseg2D,
    tolPtEquals = 0.0001
  ): boolean {
    return (
      (line1.isPointOn(line2.end, tolPtEquals) &&
        line1.isPointOn(line2.start, tolPtEquals)) ||
      (line2.isPointOn(line1.start, tolPtEquals) &&
        line2.isPointOn(line1.end, tolPtEquals))
    );
  }

  public static getIntersection(
    seg1: Lineseg2D,
    seg2: Lineseg2D,
    tolPointOn = 0.0001,
    tolParallel = 1e-3
  ): Vector2D {
    const line1: Line2D = seg1.toLine2D();
    const line2: Line2D = seg2.toLine2D();
    const ptIntersect: Vector2D = Line2D.getIntersection(
      line1,
      line2,
      tolParallel
    );
    // var ptIntersect: Vector2D

    if (ptIntersect) {
      if (
        seg1.isPointOn(ptIntersect, tolPointOn) &&
        seg2.isPointOn(ptIntersect, tolPointOn)
      ) {
        return ptIntersect;
      }
    }

    // @ts-ignore
    return null;
  }

  // 获得重叠的线段
  public static getOverlapLinesegment(
    seg1: Lineseg2D,
    seg2: Lineseg2D,
    tol = 0.0001
  ): Lineseg2D {
    const ptsOverlap: Vector2D[] = [];

    if (seg1.isPointOn(seg2.start, tol)) {
      ptsOverlap.push(seg2.start);
    }
    if (seg1.isPointOn(seg2.end, tol)) {
      ptsOverlap.push(seg2.end);
    }
    if (seg2.isPointOn(seg1.start, tol)) {
      ptsOverlap.push(seg1.start);
    }
    if (seg2.isPointOn(seg1.end, tol)) {
      ptsOverlap.push(seg1.end);
    }

    // @ts-ignore
    let ret: Lineseg2D = null;
    if (ptsOverlap.length === 2) {
      ret = new Lineseg2D(ptsOverlap[0], ptsOverlap[1]);
    } else if (ptsOverlap.length > 2) {
      for (let i = 1; i < ptsOverlap.length; ++i) {
        if (!ptsOverlap[0].equals(ptsOverlap[i], tol)) {
          ret = new Lineseg2D(ptsOverlap[0], ptsOverlap[i]);
        }
      }
    }

    return ret;
  }

  /**
   * 判断两条线段是否共线
   * @param line1 线段①
   * @param line2 线段②
   * @param tol 阈值
   */
  public static calcCollineation(
    line1: Lineseg2D,
    line2: Lineseg2D,
    tol = 0.01
  ) {
    const line1Dir = line1.getDirection();
    const line2Dir = line2.getDirection();
    if (line1Dir.x * line2Dir.y - line1Dir.y * line2Dir.x <= tol) {
      return true;
    }
    return false;
  }

  // 基类的接口实现
  public clone(): Lineseg2D {
    return new Lineseg2D(this._start, this._end);
  }

  public interpolate(num = 0.5): Vector2D {
    return Vector2D.interpolate(this._start, this._end, num);
  }

  // 把线段的开始变成射线
  public toRadialStart(): Lineseg2D {
    const valRet: Lineseg2D = this.clone();
    const vecDir: Vector2D = Vector2D.subtract(
      valRet.start,
      valRet.end
    ).normalize();

    vecDir.multiplyBy(/*number.MAX_VALUE / maxAxis*/ 999999);
    valRet.start.transformBy(vecDir);
    return valRet;
  }

  // 把线段的结束变成射线
  public toRadialEnd(): Lineseg2D {
    const valRet: Lineseg2D = this.clone();
    const vecDir: Vector2D = Vector2D.subtract(
      valRet.end,
      valRet.start
    ).normalize();

    vecDir.multiplyBy(/*number.MAX_VALUE / maxAxis*/ 999999);
    valRet.end.transformBy(vecDir);
    return valRet;
  }

  public toLine2D(): Line2D {
    return new Line2D(this._start.clone(), this._end.clone());
  }

  // 线段到一个点的最小矩离
  public minDistanceToPoint(pt: Vector2D): number {
    const ptFoot: Vector2D = new Line2D().footPoint(this.toLine2D(), pt);
    if (
      MathTool.numberEquals(
        ptFoot.distance(this._start) + ptFoot.distance(this._end),
        this._start.distance(this._end)
      )
    ) {
      // 如果垂足在起点和终点之间则表示垂足到源点的距离为最小矩离
      return pt.distance(ptFoot);
    }

    return Math.min(pt.distance(this._start), pt.distance(this._end));
  }

  // 线段到另一条线段的最小矩离
  public minDistanceToLineseg(lg: Lineseg2D): number {
    if (lg.isIntersection(this)) {
      return 0;
    }

    return Math.min(
      this.minDistanceToPoint(lg.start),
      this.minDistanceToPoint(lg.end),
      lg.minDistanceToPoint(this._start),
      lg.minDistanceToPoint(this._end)
    );
  }

  // 找到在线段点的一个点，此点离参考点最近
  public pointOnLinesegHasMinDistanceToAPoint(pt: Vector2D): Vector2D {
    const ptFoot: Vector2D = new Line2D().footPoint(this.toLine2D(), pt);
    if (
      MathTool.numberEquals(
        ptFoot.distance(this._start) + ptFoot.distance(this._end),
        this._start.distance(this._end)
      )
    ) {
      // 如果垂足在起点和终点之间则表示垂足到源点的距离为最小矩离
      return ptFoot;
    }

    if (pt.distance(this._start) > pt.distance(this._end)) {
      return this._end;
    }

    return this._start;
  }

  // 判断是否两线段有交点
  public isIntersection(lineseg: Lineseg2D, tol = 0.0001): boolean {
    const dis: number = Lineseg2D.distanceToSegment(
      this._start.x,
      this._start.y,
      this._end.x,
      this._end.y,
      lineseg.start.x,
      lineseg.start.y,
      lineseg.end.x,
      lineseg.end.y
    );
    return MathTool.numberEquals(dis, 0.0, tol);
  }

  // 判断线段是否与直线有交点
  public isIntersectionToLine(line: Line2D): boolean {
    // 判断线段的起始或终点是否在直线上
    const b1: boolean = line.isPointOnLine(this._start);
    const b2: boolean = line.isPointOnLine(this._end);
    if (b1 && b2) {
      return false;
    }
    if (b1 || b2) {
      return true;
    }

    // 跟据线段的两点与直线的方向判断是否有交点
    const ptFoot1: Vector2D = line.footPoint(line, this._start);
    const ptFoot2: Vector2D = line.footPoint(line, this._end);
    const vec1: Vector2D = Vector2D.subtract(this._start, ptFoot1).normalize();
    const vec2: Vector2D = Vector2D.subtract(this._end, ptFoot2).normalize();
    if (vec1.equals(vec2.negate())) {
      return true;
    }
    return false;
  }

  public isPointOn(pt: Vector2D, tol = 0.0001): boolean {
    return this.minDistanceToPoint(pt) < tol;
  }

  public translate(vec: Vector2D): Lineseg2D {
    return new Lineseg2D(
      Vector2D.add(this._start, vec),
      Vector2D.add(this._end, vec)
    );
  }

  /**
   * 将一条线段延长指定距离
   * @param lineseg2d   指定线段
   * @param point   指定点
   * @param distance   指定距离
   * */
  public linesegExpand(point: Vector2D, distance: number): Lineseg2D {
    let lineDir: Vector2D;
    let expendPoint: Vector2D;
    if (point.equals(this._end)) {
      // 计算延长方向
      lineDir = this._end.subtract(this._start).normalize();
      // 获取延长后的端点
      expendPoint = this._end.transform(lineDir.multiply(distance));
      return new Lineseg2D(this._start, expendPoint);
    } else {
      lineDir = this._start.subtract(this._end).normalize();
      expendPoint = this._start.transform(lineDir.multiply(distance));
      return new Lineseg2D(expendPoint, this._end);
    }
  }

  /**
   * 取左边垂直向量
   * */
  public getLeftNormal(): Vector2D {
    return new Vector2D(
      this._end.y - this._start.y,
      this._start.x - this._end.x
    );
  }

  /**
   * 取右边垂直向量
   * */
  public getRightNormal(): Vector2D {
    return new Vector2D(
      this._start.y - this._end.y,
      this._end.x - this._start.x
    );
  }

  public getDirection(): Vector2D {
    return this._end.subtract(this._start);
  }

  // 单位向量
  public getDirectionUnit(): Vector2D {
    return new Vector2D(
      this.getDirection().x / length,
      this.getDirection().y / length
    );
  }

  /** 获得相对于targetSeg的投影线段
   *       ┉┉┉━━━                  targetSeg
   *             ┈┈┈┈┈┈┈   this
   * 返回实黑部分线段
   */
  public getProjectionSegmentToASegment(targetSeg: Lineseg2D): Lineseg2D {
    const tarLine: Line2D = targetSeg.toLine2D();
    const targetFootPoint1: Vector2D = tarLine.footPoint(tarLine, this._start);
    const targetFootPoint2: Vector2D = tarLine.footPoint(tarLine, this._end);

    const thisLine: Line2D = this.toLine2D();
    const thisFootPoint1: Vector2D = thisLine.footPoint(
      thisLine,
      targetSeg.start
    );
    const thisFootPoint2: Vector2D = thisLine.footPoint(
      thisLine,
      targetSeg.end
    );

    const ptsNeed: Vector2D[] = [];
    if (targetSeg.isPointOn(targetFootPoint1)) {
      ptsNeed.push(targetFootPoint1);
    }
    if (targetSeg.isPointOn(targetFootPoint2)) {
      ptsNeed.push(targetFootPoint2);
    }
    if (this.isPointOn(thisFootPoint1)) {
      ptsNeed.push(thisFootPoint1);
    }
    if (this.isPointOn(thisFootPoint2)) {
      ptsNeed.push(thisFootPoint2);
    }

    const ptsFoot: Vector2D[] = [];
    for (const pt of ptsNeed) {
      const ptFoot: Vector2D = tarLine.footPoint(tarLine, pt);
      if (Vector2DTool.indexOfPoints(ptsFoot, ptFoot) < 0) {
        ptsFoot.push(ptFoot);
      }
    }

    if (ptsFoot.length !== 2) {
      // @ts-ignore
      return null;
    }

    return new Lineseg2D(ptsFoot[0], ptsFoot[1]);
  }

  /**
   * 判断线段是否与圆相交
   * @param center 圆心
   * @param radius 半径
   */
  public intersectCircle(center: Vector2D, radius: number): boolean {
    // 一个端点在圆内
    if (
      (Vector2D.distance(center, this.start) < radius &&
        Vector2D.distance(center, this.end) > radius) ||
      (Vector2D.distance(center, this.end) < radius &&
        Vector2D.distance(center, this.start) > radius)
    ) {
      return true;
    }
    let a;
    let b;
    let c;
    let dist1;
    let dist2;
    let angle1;
    let angle2;
    if (this.start.x === this.end.x) {
      (a = 1), (b = 0), (c = -this.start.x); // 特殊情况判断，分母不能为零
    } else if (this.start.y === this.end.y) {
      (a = 0), (b = 1), (c = -this.start.y); // 特殊情况判断，分母不能为零
    } else {
      a = this.start.y - this.end.y;
      b = this.end.x - this.start.x;
      c = this.start.x * this.end.y - this.start.y * this.end.x;
    }
    dist1 = a * center.x + b * center.y + c;
    dist1 *= dist1;
    dist2 = (Math.pow(a, 2) + Math.pow(b, 2)) * Math.pow(radius, 2);
    if (dist1 > dist2) {
      return false;
    } // 点到直线距离大于半径r
    angle1 =
      (center.x - this.start.x) * (this.end.x - this.start.x) +
      (center.y - this.start.y) * (this.end.y - this.start.y);
    angle2 =
      (center.x - this.end.x) * (this.start.x - this.end.x) +
      (center.y - this.end.y) * (this.start.y - this.end.y);
    if (angle1 > 0 && angle2 > 0) {
      return true;
    } // 余弦都为正，则是锐角
    return false;
  }
}
