import { Point } from "pixi.js";
import Line2D from "../Geometry/Line2D";
import Vector2D from "../Geometry/Vector2D";

export default class Vector2DTool {
  public static DISTANCE_TOLERANCE = 20;

  public static searchClosestPoint(
    vecs: Vector2D[],
    point: Vector2D,
    param3 = 20
  ): Vector2D {
    // @ts-ignore
    let tmpPoint: Vector2D = null;
    let len = NaN;
    let lenMax = 17976931348745161000000000000;

    for (const tVec of vecs) {
      len = Vector2D.distance(tVec, point);
      if (len < lenMax) {
        lenMax = len;
        tmpPoint = tVec;
      }
    }
    if (lenMax > param3) {
      // @ts-ignore
      return null;
    }
    return tmpPoint;
  }

  public static searchClosestXPoint(
    Vecs: Vector2D[],
    point: Vector2D,
    param3 = 20
  ): Vector2D {
    // @ts-ignore
    let tmpPoint: Vector2D = null;
    let len = NaN;
    let lenMax = 17976931348623161000000000000;

    for (const tVec of Vecs) {
      len = Math.abs(tVec.x - point.x);

      if (len < lenMax) {
        lenMax = len;
        tmpPoint = tVec;
      }
    }
    if (lenMax > param3) {
      // @ts-ignore
      return null;
    }
    return tmpPoint;
  }

  public static searchClosestYPoint(
    vecs: Vector2D[],
    point: Vector2D,
    param3 = 20
  ): Vector2D {
    // @ts-ignore
    let tmpPoint: Vector2D = null;
    let len = NaN;
    let lenMax = 17976931348623161000000000000;

    for (const tVec of vecs) {
      len = Math.abs(tVec.y - point.y);
      if (len < lenMax) {
        lenMax = len;
        tmpPoint = tVec;
      }
    }
    if (lenMax > param3) {
      // @ts-ignore
      return null;
    }
    return tmpPoint;
  }

  public static indexOfPoints(
    pts: Vector2D[],
    pt: Vector2D,
    tol = 0.0001
  ): number {
    for (let i = 0; i < pts.length; ++i) {
      if (pts[i].equals(pt, tol)) {
        return i;
      }
    }
    return -1;
  }

  public static getMaxDistanceTwoPoint(pts: Vector2D[]): Vector2D[] {
    let maxDis: number = Number.MIN_VALUE;
    const maxIdxs: number[] = [-1, -1];
    const nPts: number = pts.length;

    for (let i = 0; i < nPts; ++i) {
      for (let j = 0; j < nPts; ++j) {
        if (i === j) {
          continue;
        }
        const dis: number = pts[i].distance(pts[j]);
        if (maxDis < dis) {
          maxDis = dis;
          maxIdxs[0] = i;
          maxIdxs[1] = j;
        }
      }
    }

    const ret: Vector2D[] = [];
    if (maxIdxs[0] !== -1 && maxIdxs[1] !== -1) {
      ret.push(pts[maxIdxs[0]]);
      ret.push(pts[maxIdxs[1]]);
    }
    return ret;
  }

  public static getCadDebugString(
    pts: any[], // Vector2D[],
    xField = "x",
    yField = "y"
  ): string {
    // [Vector2D OR Point]
    // if (!GlobalProxy.isDebug()) return ''

    let ret = "";
    for (let i = 0; i < pts.length; ++i) {
      ret +=
        "Line " +
        pts[i][xField] +
        "," +
        -pts[i][yField] +
        " " +
        pts[(i + 1) % pts.length][xField] +
        "," +
        -pts[(i + 1) % pts.length][yField] +
        " \n";

      if (pts.length === 2) {
        break;
      }
    }
    return ret;
  }

  public static getCadLinestring(
    pts: Vector2D[],
    xField = "x",
    yField = "y"
  ): string {
    // [Vector2D OR Point]
    // if (!GlobalProxy.isDebug())
    // return "";

    if (pts.length === 0) {
      return "";
    }

    let ret = "";

    if (pts.length === 0) {
      return ret;
    }

    const closedPoly: Vector2D[] = pts.concat();
    closedPoly.push(pts[0]);

    for (let i = 0; i < closedPoly.length - 1; ++i) {
      ret +=
        "Line " +
        // @ts-ignore
        closedPoly[i][xField] +
        "," +
        // @ts-ignore
        closedPoly[i][yField] * -1 +
        " " +
        // @ts-ignore
        closedPoly[(i + 1) % closedPoly.length][xField] +
        "," +
        // @ts-ignore
        closedPoly[(i + 1) % closedPoly.length][yField] * -1 +
        " \n";
    }
    return ret;
  }

  public static traceCadLinestringFromLine2D(line: Line2D) {
    let resultStr = "";
    const startPt: Vector2D = line.start;
    const endPt: Vector2D = line.end;

    if (startPt && endPt) {
      resultStr +=
        "Line " +
        startPt.x +
        "," +
        startPt.y * -1 +
        " " +
        endPt.x +
        "," +
        endPt.y * -1 +
        " \n";
    }

    // trace(resultStr);
  }

  /**
   * 判断p1、p2组成的线段与p3、p4组成的线段是否相交
   * 逻辑思路：1、根据叉乘判断
   *          2、每条线段的两个端点在另一条线段的两边（包括两条线段某个端点重合）
   *          3、一条线段的某个端点在以另一条线段为对角线的矩形内
   * @param p1
   * @param p2
   * @param p3
   * @param p4
   */
  public static segmentsIntersect(
    p1: Vector2D,
    p2: Vector2D,
    p3: Vector2D,
    p4: Vector2D
  ): boolean {
    const d1: number = this.direction(p1, p2, p3);
    const d2: number = this.direction(p1, p2, p4);
    const d3: number = this.direction(p3, p4, p1);
    const d4: number = this.direction(p3, p4, p2);

    if (d1 * d2 < 0 && d3 * d4 < 0) {
      return true;
    }
    if (Math.abs(d1) <= 1e-9 && this.onSegment(p1, p2, p3)) {
      return true;
    }
    if (Math.abs(d2) <= 1e-9 && this.onSegment(p1, p2, p4)) {
      return true;
    }
    if (Math.abs(d3) <= 1e-9 && this.onSegment(p3, p4, p1)) {
      return true;
    }
    if (Math.abs(d4) <= 1e-9 && this.onSegment(p3, p4, p2)) {
      return true;
    }
    return false;
  }

  // 这是判断p3是在线段p1p2的哪一侧
  public static direction(p1: Vector2D, p2: Vector2D, p3: Vector2D): number {
    return (p2.x - p1.x) * (p3.y - p2.y) - (p3.x - p2.x) * (p2.y - p1.y);
  }

  // 这是判断点p3是否在以p1p2为对角线的矩形内
  public static onSegment(p1: Vector2D, p2: Vector2D, p3: Vector2D): boolean {
    if (
      p3.x >= Math.min(p1.x, p2.x) &&
      p3.x <= Math.max(p1.x, p2.x) &&
      p3.y >= Math.min(p1.y, p2.y) &&
      p3.y <= Math.max(p1.y, p2.y)
    ) {
      return true;
    }
    return false;
  }

  public static indexOfPixiPoints(pts: Point[], pt: Point): number {
    for (let i = 0; i < pts.length; ++i) {
      if (pts[i].equals(pt)) {
        return i;
      }
    }
    return -1;
  }

  public static detectionDis(
    pt1: Vector2D,
    pt2: Vector2D,
    dis: number
  ): boolean {
    return Math.abs(pt1.x - pt2.x) < dis || Math.abs(pt1.y - pt2.y) < dis;
  }

  /**
   * 缩放界面，保证的点压缩在wid hei内
   * @param section
   * @param wid
   * @param hei
   */
  public static sectionScale(
    section: Vector2D[],
    wid: number,
    hei: number
  ): Vector2D[] {
    const MAX: number = Number.MAX_VALUE;
    let maxX: number = -MAX;
    let maxY: number = -MAX;
    let minX: number = +MAX;
    let minY: number = +MAX;
    const iCount = section.length;

    for (let i = 0; i < iCount; i++) {
      maxX = Math.max(maxX, section[i].x);
      maxY = Math.max(maxY, section[i].y);
      minX = Math.min(minX, section[i].x);
      minY = Math.min(minY, section[i].y);
    }
    const initWid: number = maxX - minX;
    const initHei: number = maxY - minY;
    const ratioX: number = wid / initWid;
    const ratioY: number = hei / initHei;
    const newS: Vector2D[] = [];
    for (let i = 0; i < iCount; i++) {
      let p: Vector2D = section[i];
      p = new Vector2D(p.x * ratioX, p.y * ratioY);
      newS.push(p);
    }
    return newS;
  }

  /**
   * 基于Y轴为中心线的x轴镜像界面
   * @param section
   */
  public static sectionMirrorX(section: Vector2D[]): Vector2D[] {
    const iCount = section.length;
    const newPs: Vector2D[] = [];
    for (let i = 0; i < iCount; i++) {
      let p: Vector2D = section[i];
      p = new Vector2D(p.x * -1, p.y);
      newPs.push(p);
    }
    return newPs;
  }

  /**
   *平移截面到原点，
   *  ^y
   * |
   * 3_________2
   * |         |
   * |         |
   * |         |
   * 0_________1----->x
   *
   * 0:minX,minY
   * 1:maxX,minY
   * 2:maxX,maxY
   * 3:minX,maxY
   *
   * @param section
   * @param type 是以哪个角点平移到原点，
   */
  public static sectionMoveToZero(
    section: Vector2D[],
    type: number
  ): Vector2D[] {
    const MAX: number = Number.MAX_VALUE;
    let maxX: number = -MAX;
    let maxY: number = -MAX;
    let minX: number = +MAX;
    let minY: number = +MAX;
    const iCount = section.length;

    for (let i = 0; i < iCount; i++) {
      maxX = Math.max(maxX, section[i].x);
      maxY = Math.max(maxY, section[i].y);
      minX = Math.min(minX, section[i].x);
      minY = Math.min(minY, section[i].y);
    }

    let offsetVec: Vector2D;
    switch (type) {
      case 0:
        offsetVec = new Vector2D(minX, minY);
        break;
      case 1:
        offsetVec = new Vector2D(maxX, minY);
        break;
      case 2:
        offsetVec = new Vector2D(maxX, maxY);
        break;
      case 3:
        offsetVec = new Vector2D(minX, maxY);
        break;
      default:
        break;
    }

    const newS: Vector2D[] = [];
    for (let i = 0; i < iCount; i++) {
      let p: Vector2D = section[i];

      // @ts-ignore
      p = new Vector2D(p.x - offsetVec.x, p.y - offsetVec.y);
      newS.push(p);
    }
    return newS;
  }

  /**
   * 获取多边形区域中心点
   */
  public static getShapeCenter(path: Vector2D[]): Vector2D {
    let xMax: number = -Number.MAX_VALUE;
    let yMax: number = -Number.MAX_VALUE;
    let xMin: number = Number.MAX_VALUE;
    let yMin: number = Number.MAX_VALUE;
    for (const p of path) {
      xMax = Math.max(p.x, xMax);
      yMax = Math.max(p.y, yMax);
      xMin = Math.min(p.x, xMin);
      yMin = Math.min(p.y, yMin);
    }
    const xMid: number = (xMax + xMin) * 0.5;
    const yMid: number = (yMax + yMin) * 0.5;
    return new Vector2D(xMid, yMid);
  }

  /**
   * 得到两个四分点
   * @param v1
   * @param v2
   */
  public static quartiles(v1: Vector2D, v2: Vector2D) {
    const deltaX = v2.x - v1.x;
    const deltaY = v2.y - v1.y;

    // 2个四分点
    const ratio1 = 0.25;
    const ratio2 = 0.75;
    const quartile1 = new Vector2D(
      v1.x + ratio1 * deltaX,
      v1.y + ratio1 * deltaY
    );
    const quartile2 = new Vector2D(
      v1.x + ratio2 * deltaX,
      v1.y + ratio2 * deltaY
    );

    return [quartile1, quartile2];
  }

  public static extendInDirectionByLength(
    point1: Vector2D,
    point2: Vector2D,
    len = 0
  ): Vector2D {
    const tol = 1e-3;
    const newPoint = point1.clone();

    if (len <= 0) {
      return newPoint;
    }

    // 垂直，无斜率
    if (Math.abs(point1.x - point2.x) < tol) {
      if (point2.y > point1.y) {
        newPoint.y += len;
      } else if (point2.y < point1.y) {
        newPoint.y -= len;
      }
    } else {
      const distX = point2.x - point1.x;
      const distY = point2.y - point1.y;
      const slope = distX / distY;
      const slopeLen = Math.sqrt(distX * distX + distY * distY);
      const sin = Math.abs(distY) / slopeLen;
      const cos = Math.abs(distX) / slopeLen;

      const deltaX = distX > 0 ? len * cos : -len * cos;
      const deltaY = distY > 0 ? len * sin : -len * sin;
      newPoint.x += deltaX;
      newPoint.y += deltaY;
    }

    return newPoint;
  }

  /**
   * 得到两点组成线段的垂线段。默认旋转中心点在两点所在直线上
   * @param point1
   * @param point2
   * @param extendBy
   * @param tol
   */
  public static getPerpendicular(
    point1: Vector2D,
    point2: Vector2D,
    pivot: Vector2D,
    extendBy = 20,
    tol = 1e-3
  ) {
    const perpendicularPoints = [];

    if (Math.abs(point1.x - point2.x) < tol) {
      perpendicularPoints.push(new Vector2D(point1.x - extendBy, pivot.y));
      perpendicularPoints.push(new Vector2D(point1.x + extendBy, pivot.y));
    } else if (Math.abs(point1.y - point2.y) < tol) {
      perpendicularPoints.push(new Vector2D(pivot.x, point1.y - extendBy));
      perpendicularPoints.push(new Vector2D(pivot.x, point1.y + extendBy));
    } else {
      const midPoint = new Vector2D(
        (point1.x + point2.x) / 2,
        (point1.y + point2.y) / 2
      );
      const p1Vector2 = point1.rotateAround(pivot, Math.PI / 2);
      const p2Vector2 = point1.rotateAround(pivot, -Math.PI / 2);
      let p1 = new Vector2D(p1Vector2.x, p1Vector2.y);
      let p2 = new Vector2D(p2Vector2.x, p2Vector2.y);

      if (extendBy && extendBy > 0) {
        p1 = Vector2DTool.extendInDirectionByLength(midPoint, p1, extendBy);
        p2 = Vector2DTool.extendInDirectionByLength(midPoint, p2, extendBy);
      }

      perpendicularPoints.push(p1);
      perpendicularPoints.push(p2);
    }

    return perpendicularPoints;
  }

  public Vector2DTool() {
    // throw new AbstractClassError();
  }
}
