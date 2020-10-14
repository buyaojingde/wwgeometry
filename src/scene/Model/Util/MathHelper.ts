import Bezier from 'bezier-js';
import Line2D from '../Geometry/Line2D';
import Polygon2D from '../Geometry/Polygon2D';
import Vector2D from '../Geometry/Vector2D';
import MathTool from './MathTool';

/** 几何辅助类 */
export default class MathHelper {
  /**
   * 去掉一些无用的点，AB太相近，则A无用
   * @param points
   */
  public static removeUselessPoints(points: Vector2D[], isLoop: boolean, disTol: number = 0.0001): Vector2D[] {
    try {
      const iCount = points.length;
      let newPs: Vector2D[] = [];
      const count = isLoop ? iCount : iCount - 1;
      for (let i = 0; i < count; i++) {
        const p: Vector2D = points[i];

        // 当后面的地点太靠近了，说明这个点是无效的
        let isTooClsoe: boolean = false;
        for (let j = i + 1; j < iCount; j++) {
          const nextP: Vector2D = points[j];
          if (p.distanceSquared(nextP) < disTol) {
            isTooClsoe = true;
            break;
          }
        }
        if (!isTooClsoe) {
          newPs.push(p);
        }
      }
      if (isLoop) {
        const lastP: Vector2D = newPs[newPs.length - 1];
        const firstP: Vector2D = newPs[0];
        if (firstP.distanceSquared(lastP) < disTol) {
          newPs = newPs.splice(newPs.length - 1, 1);
        }
      }
      // 确保头尾不能删掉
      if (!isLoop) {
        if (newPs[0].distanceSquared(points[0]) > disTol) {
          newPs.unshift(points[0]);
        }
        if (newPs[newPs.length - 1].distanceSquared(points[points.length - 1]) > disTol) {
          newPs.push(points[points.length - 1]);
        }
      }
      return newPs;
    } catch (e) {
      console.log(e);
      return points;
    }
  }

  /**
   * 裁切线段
   * @param iniLinePs
   * @param psCut
   * @param exLen
   */
  public static cutSegsByPoints(iniLinePs: Vector2D[], psCut: Vector2D[], exLen: number = 50): Vector2D[] {
    if (iniLinePs.length < 2) {
      console.error('iniLinePs.length<2 ');
    }
    if (psCut.length < 2) {
      console.error(' psCut.length < 2 ');
    }
    // 如果出现共线头尾相接的情况，这时候就返回
    const endP: Vector2D = iniLinePs[iniLinePs.length - 1].clone();
    const Min = 0.1;
    if (endP.distance(psCut[0]) < Min) {
      return iniLinePs.slice();
    }
    if (endP.distance(psCut[psCut.length - 1]) < Min) {
      return iniLinePs.slice();
    }
    if (psCut.length > 0) {
      psCut = MathHelper.extendPoints(psCut, exLen);
      psCut.reverse();
      psCut = MathHelper.extendPoints(psCut, exLen);
      psCut.reverse();
    }
    iniLinePs = MathHelper.extendPoints(iniLinePs, exLen);
    return MathHelper.cutPointsByPoints(iniLinePs, psCut);
  }

  /**
   *截取求一系列点 ，进来的线必须是这个规则
    规则：------psStart----->  ------iniLinePs----->  ------psEnd----->
   * @param iniLinePs 需要截断的点
   * @param psStart 截断的起始点，类似剪刀功能
   * @param psEnd 截断的结束点，类似剪刀功能
   * @param exLen 需要截断的点的收尾延伸距离，
   * @return 返回新的系列点
   */
  public static cutPointsByStartEndPoints(
    iniLinePs: Vector2D[],
    psStart: Vector2D[],
    psEnd: Vector2D[],
    exLen: number = 50,
  ): Vector2D[] {
    try {
      iniLinePs = iniLinePs.slice();
      psStart = psStart.slice();
      psEnd = psEnd.slice();

      // 起始系列点头尾延长
      if (psStart.length > 0) {
        psStart = MathHelper.extendPoints(psStart, exLen);
        psStart = psStart.reverse();
        psStart = MathHelper.extendPoints(psStart, exLen);
        psStart = psStart.reverse();
      }

      // 结束系列点头尾延长
      if (psEnd.length > 0) {
        psEnd = MathHelper.extendPoints(psEnd, exLen);
        psEnd = psEnd.reverse();
        psEnd = MathHelper.extendPoints(psEnd, exLen);
        psEnd = psEnd.reverse();
      }

      // 结尾延长，裁剪,如果没有交叉，采用未延长的点
      let psToEnd = MathHelper.extendPoints(iniLinePs, exLen);
      const { isCut: isCutEnd, points: pointsE } = MathHelper.cutPointsByPoints(psToEnd, psEnd);
      if (isCutEnd) {
        psToEnd = pointsE;
      } else {
        psToEnd = iniLinePs;
      }

      // 反向，延伸，裁剪，,如果没有交叉，采用未延长的点，在再反向
      psToEnd = psToEnd.reverse();
      let psToStart = MathHelper.extendPoints(psToEnd, exLen);
      const { isCut: isCutStart, points: pointsS } = MathHelper.cutPointsByPoints(psToStart, psStart.reverse());
      if (isCutStart) {
        psToStart = pointsS;
      } else {
        psToStart = psToEnd;
      }

      psToStart = psToStart.reverse();

      return psToStart;
    } catch (e) {
      return iniLinePs;
    }
  }
  /**
   *截取求一系列点
   * @param iniLinePs 需要截断的点
   * @param psStart 截断的起始点，类似剪刀功能
   * @param psEnd 截断的结束点，类似剪刀功能
   * @param exLen 需要截断的点的收尾延伸距离，
   * @param overExt (等于false时)无交点时，不要延长
   * @return 返回新的系列点
   */
  public static cutPointsByStartEndPointsA(
    iniLinePs: Vector2D[],
    psStart: Vector2D[],
    psEnd: Vector2D[],
    exLen: number = 50,
    overExt: boolean = true,
  ): Vector2D[] {
    // 起始系列点头尾延长
    if (psStart.length > 0) {
      psStart = exPoints(psStart);
      psStart.reverse();
      psStart = exPoints(psStart);
      psStart.reverse();
    }

    // 结束系列点头尾延长
    if (psEnd.length > 0) {
      psEnd = exPoints(psEnd);
      psEnd = psEnd.reverse();
      psEnd = exPoints(psEnd);
      psEnd = psEnd.reverse();
    }

    let psToEnd = exPoints(iniLinePs);

    const result = MathHelper.cutPointsByPointsA(psToEnd, psEnd);
    psToEnd = result[0];
    // 如果没有交点，则放弃延长
    if (!overExt && !result[1]) {
      psToEnd = iniLinePs;
    }

    let psToStart = psToEnd.reverse();
    let backup;
    if (!overExt) {
      backup = psToStart;
    }
    psToStart = exPoints(psToStart);

    psToStart = MathHelper.cutPointsByPointsA(psToStart, psStart);
    // 如果没有交点，则放弃延长
    psToStart = result[0];
    if (!overExt && !result[1]) {
      psToStart = backup;
    }

    return psToStart.reverse();

    function exPoints(ps: Vector2D[]): Vector2D[] {
      if (!ps || ps.length === 0) {
        return [];
      }
      const lastP: Vector2D = ps[ps.length - 1].clone();
      const subLastP: Vector2D = ps[ps.length - 2].clone();
      let dir: Vector2D = lastP.subtract(subLastP);

      dir = dir.normalize();
      dir = dir.multiply(exLen);
      const endP: Vector2D = lastP.add(dir);

      const newPs = ps.slice();
      if (newPs.length === 2) {
        newPs[1] = endP;
      } else {
        newPs.push(endP);
      }
      return newPs;
    }
  }
  /**
   * 点是否包含在多边形内
   * @param polygonPoints 多边形的点
   * @param checkPoint 检测点
   * @return 如果包含则返回true
   */
  public static polygonContainsPointA(polygonPoints: Vector2D[], checkPoint: Vector2D): boolean {
    let inside: boolean = false;
    const pointCount: number = polygonPoints.length;
    let p1: Vector2D;
    let p2: Vector2D;
    let i: number;
    let j: number;
    // 第一个点和最后一个点作为第一条线，之后是第一个点和第二个点作为第二条线，之后是第二个点与第三个点，第三个点与第四个点...
    for (i = 0, j = pointCount - 1; i < pointCount; j = i, i++) {
      p1 = polygonPoints[i];
      p2 = polygonPoints[j];
      if (checkPoint.y < p2.y) {
        // p2在射线之上
        if (p1.y <= checkPoint.y) {
          // p1正好在射线中或者射线下方
          if ((checkPoint.y - p1.y) * (p2.x - p1.x) > (checkPoint.x - p1.x) * (p2.y - p1.y)) {
            // 斜率判断,在P1和P2之间且在P1P2右侧
            // 射线与多边形交点为奇数时则在多边形之内，若为偶数个交点时则在多边形之外。
            // 由于inside初始值为false，即交点数为零。所以当有第一个交点时，则必为奇数，则在内部，此时为inside=(!inside)
            // 所以当有第二个交点时，则必为偶数，则在外部，此时为inside=(!inside)
            inside = !inside;
          }
        }
      } else if (checkPoint.y < p1.y) {
        // p2正好在射线中或者在射线下方，p1在射线上
        if ((checkPoint.y - p1.y) * (p2.x - p1.x) < (checkPoint.x - p1.x) * (p2.y - p1.y)) {
          // 斜率判断,在P1和P2之间且在P1P2右侧
          inside = !inside;
        }
      }
    }
    return inside;
  }

  /**
   *截取求一系列点
   * @param iniLinePs 需要截断的点
   * @param cutLinePs 截断的点，类似剪刀功能
   * @return 返回新的系列点,以及标识是否是原数据,即，是否存在交点
   */
  public static cutPointsByPoints(iniLinePs: Vector2D[], cutLinePs: Vector2D[]): any {
    iniLinePs = iniLinePs.slice();
    cutLinePs = cutLinePs.slice();

    let i: number = 0;
    const iCount: number = iniLinePs.length;
    let j: number = 0;
    const jCount: number = cutLinePs.length;

    let p1: Vector2D = null;
    let p2: Vector2D = null;
    let p3: Vector2D = null;
    let p4: Vector2D = null;

    // var str1:String=Vector2DTool.getCadDebugString(iniLinePs);
    // var str2:String=Vector2DTool.getCadDebugString(cutLinePs);
    // console.log(str1)
    // console.log(str2)

    // const tol = 0.001;
    const resultPs: Vector2D[] = [];
    let interP: Vector2D = null;
    for (i = iCount - 1; i > 0; i--) {
      // for (i = 0; i < iCount - 1; i++) {
      p1 = iniLinePs[i];
      p2 = iniLinePs[i - 1];
      for (j = 0; j < jCount - 1; j++) {
        p3 = cutLinePs[j];
        p4 = cutLinePs[j + 1];
        if (MathHelper.isSegumentCorss(p1, p2, p3, p4)) {
          interP = MathHelper.getIntersection(p1, p2, p3, p4);
          if (!interP) {
            continue;
          }

          const endI: number = i;
          for (i = 0; i < endI; i++) {
            resultPs.push(iniLinePs[i]);
          }
          if (iCount === 2) {
            // 2个点的直线做特殊处理，否则结果可能就成3个点了（p1多加一次），
            resultPs.push(interP);
          } else {
            if (MathHelper.distancePointWithPoint(interP, p2) < 0.00001) {
              resultPs.push(interP);
            } else {
              resultPs.push(p2);
              resultPs.push(interP);
            }
          }
          return { isCut: true, points: resultPs };
        }
      }
    }
    return { isCut: false, points: iniLinePs };
  }
  public static cutPointsByPoints_bak(iniLinePs: Vector2D[], cutLinePs: Vector2D[]): Vector2D[] {
    iniLinePs = iniLinePs.slice();
    cutLinePs = cutLinePs.slice();

    let i: number = 0;
    const iCount: number = iniLinePs.length;
    let j: number = 0;
    const jCount: number = cutLinePs.length;

    let p1: Vector2D = null;
    let p2: Vector2D = null;
    let p3: Vector2D = null;
    let p4: Vector2D = null;

    // var str1:String=Vector2DTool.getCadDebugString(iniLinePs);
    // var str2:String=Vector2DTool.getCadDebugString(cutLinePs);
    // console.log(str1)
    // console.log(str2)

    // const tol = 0.001;
    const resultPs: Vector2D[] = [];
    let interP: Vector2D = null;
    for (i = iCount - 1; i > 0; i--) {
      // for (i = 0; i < iCount - 1; i++) {
      p1 = iniLinePs[i];
      p2 = iniLinePs[i - 1];
      for (j = 0; j < jCount - 1; j++) {
        p3 = cutLinePs[j];
        p4 = cutLinePs[j + 1];
        if (MathHelper.isSegumentCorss(p1, p2, p3, p4)) {
          interP = MathHelper.getIntersection(p1, p2, p3, p4);
          if (!interP) {
            continue;
          }

          const endI: number = i;
          for (i = 0; i < endI; i++) {
            resultPs.push(iniLinePs[i]);
          }
          if (iCount === 2) {
            // 2个点的直线做特殊处理，否则结果可能就成3个点了（p1多加一次），
            resultPs.push(interP);
          } else {
            if (MathHelper.distancePointWithPoint(interP, p2) < 0.00001) {
              resultPs.push(interP);
            } else {
              resultPs.push(p2);
              resultPs.push(interP);
            }
          }
          return resultPs;
        }
      }
    }
    return iniLinePs;
  }
  /**
   * 点是否包含在多边形内
   * @param polygonPoints 多边形的点
   * @param checkPoint 检测点
   * @return 如果包含则返回true
   */
  public static polygonContainsPoint(polygonPoints: Vector2D[], checkPoint: Vector2D): boolean {
    let inside: boolean = false;
    const pointCount: number = polygonPoints.length;
    let p1: Vector2D;
    let p2: Vector2D;
    let i: number;
    let j: number;
    // 第一个点和最后一个点作为第一条线，之后是第一个点和第二个点作为第二条线，之后是第二个点与第三个点，第三个点与第四个点...
    for (i = 0, j = pointCount - 1; i < pointCount; j = i, i++) {
      p1 = polygonPoints[i];
      p2 = polygonPoints[j];
      if (checkPoint.y < p2.y) {
        // p2在射线之上
        if (p1.y <= checkPoint.y) {
          // p1正好在射线中或者射线下方
          if ((checkPoint.y - p1.y) * (p2.x - p1.x) > (checkPoint.x - p1.x) * (p2.y - p1.y)) {
            // 斜率判断,在P1和P2之间且在P1P2右侧
            // 射线与多边形交点为奇数时则在多边形之内，若为偶数个交点时则在多边形之外。
            // 由于inside初始值为false，即交点数为零。所以当有第一个交点时，则必为奇数，则在内部，此时为inside=(!inside)
            // 所以当有第二个交点时，则必为偶数，则在外部，此时为inside=(!inside)
            inside = !inside;
          }
        }
      } else if (checkPoint.y < p1.y) {
        // p2正好在射线中或者在射线下方，p1在射线上
        if ((checkPoint.y - p1.y) * (p2.x - p1.x) < (checkPoint.x - p1.x) * (p2.y - p1.y)) {
          // 斜率判断,在P1和P2之间且在P1P2右侧
          inside = !inside;
        }
      }
    }
    return inside;
  }

  /**
   *截取求一系列点
   * @param iniLinePs 需要截断的点
   * @param cutLinePs 截断的点，类似剪刀功能
   * @return 返回新的系列点,以及标识是否是原数据,即，是否存在交点
   */
  public static cutPointsByPointsA(iniLinePs: Vector2D[], cutLinePs: Vector2D[]): any[] {
    if (!cutLinePs) {
      return [iniLinePs, false];
    }

    iniLinePs = iniLinePs.slice();
    cutLinePs = cutLinePs.slice();

    let i: number = 0;
    const iCount: number = iniLinePs.length;
    let j: number = 0;
    const jCount: number = cutLinePs.length;

    let p1: Vector2D = null;
    let p2: Vector2D = null;
    let p3: Vector2D = null;
    let p4: Vector2D = null;

    // var str1:String=Vector2DTool.getCadDebugString(iniLinePs);
    // var str2:String=Vector2DTool.getCadDebugString(cutLinePs);
    // console.log(str1)
    // console.log(str2)

    const tol = 0.001;
    const resultPs: Vector2D[] = [];
    let interP: Vector2D = null;
    for (i = iCount - 1; i > 0; i--) {
      // for (i = 0; i < iCount - 1; i++) {
      p1 = iniLinePs[i];
      p2 = iniLinePs[i - 1];
      for (j = 0; j < jCount - 1; j++) {
        p3 = cutLinePs[j];
        p4 = cutLinePs[j + 1];
        if (MathHelper.isSegumentCorss(p1, p2, p3, p4)) {
          interP = MathHelper.getIntersection(p1, p2, p3, p4);
          if (!interP) {
            continue;
          }

          const endI: number = i;
          for (i = 0; i < endI; i++) {
            resultPs.push(iniLinePs[i]);
          }
          if (iCount === 2) {
            // 2个点的直线做特殊处理，否则结果可能就成3个点了（p1多加一次），
            resultPs.push(interP);
          } else {
            if (MathHelper.distancePointWithPoint(interP, p2) < 0.00001) {
              resultPs.push(interP);
            } else {
              resultPs.push(p2);
              resultPs.push(interP);
            }
          }
          return [resultPs, true];
        }
      }
    }
    return [iniLinePs, false];
  }

  /**
   * 点到点的距离
   * @param p1 线段端点1
   * @param p2 线段端点2
   * @return 距离
   */
  public static distancePointWithPoint(p1: Vector2D, p2: Vector2D): number {
    const x1: number = p1.x;
    const y1: number = p1.y;
    const x2: number = p2.x;
    const y2: number = p2.y;
    return MathHelper.distancePointWithPoint1(x1, y1, x2, y2);
  }

  /**
   * 获取两条直线的焦点
   * @param p1 线段1的端点1
   * @param p2 线段1的端点2
   * @param p3 线段2的端点1
   * @param p4 线段2的端点2
   */
  public static getIntersection(p1: Vector2D, p2: Vector2D, p3: Vector2D, p4: Vector2D): Vector2D {
    return MathHelper.getIntersection1(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y, p4.x, p4.y);
  }

  /**
   * 获取两条直线的焦点
   * @param x1 线段1的端点1的x坐标
   * @param y1 线段1的端点1的y坐标
   * @param x2 线段1的端点2的x坐标
   * @param y2 线段1的端点2的y坐标
   * @param x3 线段2的端点1的x坐标
   * @param y3 线段2的端点1的y坐标
   * @param x4 线段2的端点2的x坐标
   * @param y4 线段2的端点2的y坐标
   */
  public static getIntersection1(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    x4: number,
    y4: number,
  ): Vector2D {
    const denom: number = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
    if (denom === 0) {
      return null;
    }
    const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
    // const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;
    return new Vector2D(x1 + ua * (x2 - x1), y1 + ua * (y2 - y1));
  }

  /**
   * 判断两条直线是否相交
   * @param p1 线段1端点1
   * @param p2 线段1端点2
   * @param p3 线段2端点1
   * @param p4 线段2端点2
   * @return 如果相交返回true
   */
  public static isCorss(p1: Vector2D, p2: Vector2D, p3: Vector2D, p4: Vector2D): boolean {
    return MathHelper.isCorss1(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y, p4.x, p4.y);
  }

  /**
   * 判断两条线段是否相交
   * @param p1 线段1端点1
   * @param p2 线段1端点2
   * @param p3 线段2端点1
   * @param p4 线段2端点2
   * @return 如果相交返回true
   */
  public static isSegumentCorss(p1: Vector2D, p2: Vector2D, p3: Vector2D, p4: Vector2D): boolean {
    if (MathHelper.isCorss(p1, p2, p3, p4)) {
      if (MathHelper.isParallel(p1, p2, p3, p4) && !MathHelper.isSegmentOverlaySegment(p1, p2, p3, p4)) {
        return false;
      }
      return true;
    }
    return false;
  }

  /**
   * 线段与线段是否重合
   * @param p1 线段1端点1
   * @param p2 线段1端点2
   * @param p3 线段2端点1
   * @param p4 线段2端点2
   * @return 如果重合返回true
   */
  public static isSegmentOverlaySegment(p1: Vector2D, p2: Vector2D, p3: Vector2D, p4: Vector2D): boolean {
    if (MathHelper.isParallel(p1, p2, p3, p4)) {
      if (MathHelper.segmentContainsPoint(p1, p2, p3, false)) {
        return true;
      } else if (MathHelper.segmentContainsPoint(p1, p2, p4, false)) {
        return true;
      } else if (MathHelper.segmentContainsPoint(p3, p4, p1, false)) {
        return true;
      } else if (MathHelper.segmentContainsPoint(p3, p4, p2, false)) {
        return true;
      }
    }
    return false;
  }

  /**
   * 点是否在线段上
   * @param p1 线段端点1
   * @param p2 线段端点2
   * @param p 点
   * @param hasEndPoint 是否包含端点
   * @return 如果在线上则返回
   */
  public static segmentContainsPoint(p1: Vector2D, p2: Vector2D, p: Vector2D, hasEndPoint: boolean = true): boolean {
    return MathHelper.segmentContainsPoint1(p1.x, p1.y, p2.x, p2.y, p.x, p.y, hasEndPoint);
  }

  /**
   * 点到点的距离
   * @param x1 点1的x坐标
   * @param y1 点1的x坐标
   * @param x2 点2的x坐标
   * @param y2 点2的x坐标
   * @return 距离
   */
  public static distancePointWithPoint1(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
  }

  /**
   * 判断两条线是否平行
   * @param p1 线段1端点1
   * @param p2 线段1端点2
   * @param p3 线段2端点1
   * @param p4 线段2端点2
   * @return 如果平行返回true
   */
  public static isParallel(p1: Vector2D, p2: Vector2D, p3: Vector2D, p4: Vector2D, deviation: number = 0.1): boolean {
    return Math.abs((p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x)) < deviation;
  }

  /**
   * 计算两条边的夹角
   * @param pSrc
   * @param p1
   * @param p2
   *               p1
   *              ↙
   *            ↙
   *          ↙
   *        ↙  θ
   *     pSrc ← ← ← ← ← p2
   *
   */
  public static getAngle(pSrc: Vector2D, p1: Vector2D, p2: Vector2D): number {
    let angle: number = 0.0; // 夹角
    const vax: number = p1.x - pSrc.x;
    const vay: number = p1.y - pSrc.y;

    const vbx: number = p2.x - pSrc.x;
    const vby: number = p2.y - pSrc.y;

    const productValue: number = vax * vbx + vay * vby; // 向量的乘积
    const vaval: number = Math.sqrt(vax * vax + vay * vay); // 向量a的模
    const vbval: number = Math.sqrt(vbx * vbx + vby * vby); // 向量b的模
    let cosValue: number = productValue / (vaval * vbval); // 余弦公式

    // acos的输入参数范围必须在[-1, 1]之间，否则会"domain error"
    // 对输入参数作校验和处理
    if (cosValue < -1 && cosValue > -2) {
      cosValue = -1;
    } else if (cosValue > 1 && cosValue < 2) {
      cosValue = 1;
    }

    // acos返回的是弧度值，转换为角度值
    angle = (Math.acos(cosValue) * 180) / Math.PI;

    return angle;
  }

  /**
   *
   * 判断两条直线是否相交
   * @param {number} x1
   * @param {number} y1
   * @param {number} x2
   * @param {number} y2
   * @param {number} x3
   * @param {number} y3
   * @param {number} x4
   * @param {number} y4
   * @returns {boolean} 如果相交返回true
   */
  public static isCorss1(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    x4: number,
    y4: number,
  ): boolean {
    const cm1: number = MathHelper.crossMul1(x1 - x3, y1 - y3, x4 - x3, y4 - y3);
    const cm2: number = MathHelper.crossMul1(x2 - x3, y2 - y3, x4 - x3, y4 - y3);
    const cm3: number = MathHelper.crossMul1(x3 - x1, y3 - y1, x2 - x1, y2 - y1);
    const cm4: number = MathHelper.crossMul1(x4 - x1, y4 - y1, x2 - x1, y2 - y1);
    return cm1 * cm2 <= 0 && cm3 * cm4 <= 0;
  }

  /**
   * 平移线段
   * @param startPoint 端点1 （平移后实例会被修改，需提前clone）
   * @param endPoint 端点2 （平移后实例会被修改，需提前clone）
   * @param offset 偏移距离(正数向右，负数向左)
   */
  public static translateLine(startPoint: Vector2D, endPoint: Vector2D, offset: number): void {
    let dx: number = startPoint.y - endPoint.y;
    let dy: number = endPoint.x - startPoint.x;
    const len: number = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
    if (len > 0) {
      dx /= len;
      dy /= len;
    }
    dx *= offset;
    dy *= offset;

    startPoint.x += dx;
    startPoint.y += dy;
    endPoint.x += dx;
    endPoint.y += dy;
  }

  /**
   * 检测这个线段是否和圆是否相交或者在圆内
   * @returns 相交就返回true，反正返回false
   * @param p1
   * @param p2
   * @param pCenter
   * @param radius
   */
  public static checkSegInOrIntersectWithCircle(p1: Vector2D, p2: Vector2D, pCenter: Vector2D, radius: number) {
    const disToCenter: number = MathHelper.distancePointWithLine(pCenter, p1, p2);
    const disToP1: number = pCenter.distance(p1);
    const disToP2: number = pCenter.distance(p2);

    if (radius > disToP1 && radius > disToP2) {
      // 两端点都在里面
      return true;
    } else if (radius > disToP1 !== radius > disToP2) {
      // 一个端点在里面一个在外面
      return true;
    } else if (radius < disToP1 && radius < disToP2) {
      // 两端点都在外面
      if (disToCenter < radius) {
        return true;
      } else {
        return false;
      }
    }
    return false;
  }

  /**
   * 检测这个线段是否和圆是否相交
   * @returns 相交就返回true，反正返回false
   * @param p1
   * @param p2
   * @param pCenter
   * @param radius
   */
  public static checkSegIntersetWithCircle(p1: Vector2D, p2: Vector2D, pCenter: Vector2D, radius: number) {
    const disToCenter: number = MathHelper.distancePointWithLine(pCenter, p1, p2);
    const disToP1: number = pCenter.distance(p1);
    const disToP2: number = pCenter.distance(p2);

    if (radius > disToP1 && radius > disToP2) {
      // 两端点都在里面
      return false;
    } else if (radius > disToP1 !== radius > disToP2) {
      // 一个端点在里面一个在外面
      return true;
    } else if (radius < disToP1 && radius < disToP2) {
      // 两端点都在外面
      if (disToCenter < radius) {
        return true;
      } else {
        return false;
      }
    }
    return false;
  }

  /**
   * 判断圆形是否包含一系列点
   * @param pCenter
   * @param radius
   * @param points
   */
  public static IsContainsPointsForCircle(pCenter: Vector2D, radius: number, points: Vector2D[]) {
    points.forEach(element => {
      const dis: number = pCenter.distance(element);
      if (dis > radius) {
        return false;
      }
    });
    return true;
  }
  private static aa = 10;

  /**
   * 平移bezier
   * @param pStart 开始锚点
   * @param pEnd 结束锚点
   * @param ctrStart 开始控制点
   * @param ctrEnd 结束控制点
   * @param offset 偏移距离(正数向右，负数向左)
   */
  public static translateBezier(
    pStart: Vector2D,
    pEnd: Vector2D,
    ctrStart: Vector2D,
    ctrEnd: Vector2D,
    offset: number,
  ): Vector2D[] {
    const bLine: Bezier = new Bezier(pStart.x, pStart.y, ctrStart.x, ctrStart.y, ctrEnd.x, ctrEnd.y, pEnd.x, pEnd.y);
    let subBs = MathHelper.getBezierSubPoints(bLine);
    subBs = MathHelper.removeUselessPoints(subBs, false);
    subBs = MathHelper.extendPoints(subBs, 10);
    subBs = subBs.reverse();
    subBs = MathHelper.extendPoints(subBs, 10);
    subBs = subBs.reverse();

    const offsetPs: Vector2D[] = MathHelper.calcOffsetPath2P(subBs, -offset);
    offsetPs.pop();
    offsetPs.shift();
    return offsetPs;
    /*
    let bs: Bezier[] = [];
    try {
      bs = bLine.offset(offset) as Bezier[];
    } catch (error) {
      console.log(error);
      MathHelper.aa += 5;
      hyxText.getInstance().drawLine2D([pStart, pEnd], 250 + MathHelper.aa);
      hyxText.getInstance().drawLine2D([ctrStart, ctrEnd], 250 + MathHelper.aa);
    }

    if (bs.length === 0) {
      bs.push(bLine);
    }
    const iCount = bs.length;
    let points: Vector2D[] = [];
    const tol = 0.01;
    for (let i = 0; i < iCount; i++) {
      const subBs = MathHelper.getBezierSubPoints(bs[i]);
      if (i !== iCount - 1) {
        subBs.pop();
      }
      points = points.concat(subBs);
    }
    return MathHelper.optimizePoints(points);
    */
  }

  public static getBezierSubPoints(b: Bezier, tol: number = 0.01) {
    const points: Vector2D[] = [];
    let isOver = false;
    for (let t = 0; t <= 2.0; t += tol) {
      if (t > 1) {
        t = 1.0;
        isOver = true;
      }
      const getP = b.get(t);
      points.push(new Vector2D(getP.x, getP.y));
      if (isOver) {
        break;
      }
    }
    return points;
  }

  public static calcBezierSubPoints(
    pStart: Vector2D,
    pEnd: Vector2D,
    ctrStart: Vector2D,
    ctrEnd: Vector2D,
    tol: number = 0.01,
  ) {
    const b: Bezier = new Bezier(pStart.x, pStart.y, ctrStart.x, ctrStart.y, ctrEnd.x, ctrEnd.y, pEnd.x, pEnd.y);
    return MathHelper.getBezierSubPoints(b, tol);
  }

  /** 点优化,去除一些过多的点
   * @param pAr
   * @param hHei
   * */
  public static optimizePoints(pAr: any[], hHei: number = 0.4): any[] {
    if (pAr.length < 3) {
      return pAr;
    }
    let psTemp: Vector2D[] = pAr.slice();
    const newPs: Vector2D[] = [];
    let i: number = 0;
    let iLength: number = psTemp.length;
    let preP: Vector2D = null;
    let curP: Vector2D = null;
    let nextP: Vector2D = null;
    let orDis: number = 0;
    let sampleOk: boolean = false;

    while (!sampleOk) {
      newPs.push(psTemp[0]);
      sampleOk = true;
      iLength = psTemp.length - 1;
      for (i = 1; i < iLength; i++) {
        if (i % 2 === 0) {
          preP = psTemp[i - 1];
          curP = psTemp[i];
          nextP = psTemp[i + 1];
          orDis = MathHelper.distancePointWithLine(curP, preP, nextP);
          if (orDis > hHei) {
            newPs.push(psTemp[i]);
          } else {
            sampleOk = false;
          }
        } else {
          newPs.push(psTemp[i]);
        }
      }
      newPs.push(psTemp[iLength]);
      psTemp.length = 0;
      psTemp = newPs.concat();
      newPs.length = 0;
    }
    return psTemp;
  }

  /**
   *  移除封闭区域边上除端点之外的点
   * @param points
   * by lianbo
   */
  public static removeUselessPointsOnPath(points: Vector2D[]): Vector2D[] {
    const pointsNeedRemove = [];

    for (let i = 0; i < points.length - 1; i++) {
      let p1;
      let p2;
      let p3;
      if (i < points.length - 2) {
        p1 = points[i];
        p2 = points[i + 1];
        p3 = points[i + 2];
      }

      if (i === points.length - 2) {
        p1 = points[i];
        p2 = points[i + 1];
        p3 = points[0];
      }

      const isOnLine = MathHelper.segmentContainsPoint1(p1.x, p1.y, p3.x, p3.y, p2.x, p2.y, false);
      if (isOnLine) {
        pointsNeedRemove.push(p2);
      }
    }

    for (const rp of pointsNeedRemove) {
      points = this.removeItemFromArray(points, rp);
    }

    return points;
  }

  /**
   * 从数组中移除某个元素
   * @param array 原始函数
   * @param item 需要被移除的对象
   * @return 返回新数组
   */
  public static removeItemFromArray(array: Vector2D[], item): Vector2D[] {
    const index = array.indexOf(item);
    if (index > -1) {
      array.splice(index, 1);
    }
    return array;
  }

  /**
   * 点到线段的距离
   * @param p 点
   * @param p1 线段端点1
   * @param p2 线段端点2
   * @return 最近的距离
   */
  public static distancePointWithLine(p: Vector2D, p1: Vector2D, p2: Vector2D): number {
    const x: number = p.x;
    const y: number = p.y;
    const x1: number = p1.x;
    const y1: number = p1.y;
    const x2: number = p2.x;
    const y2: number = p2.y;
    return MathHelper.distancePointWithLine1(x, y, x1, y1, x2, y2);
  }

  /**
   * 点到线段的距离
   * @param x 点的x坐标
   * @param y 点的y坐标
   * @param x1 线段端点1的x坐标
   * @param y1 线段端点1的x坐标
   * @param x2 线段端点2的x坐标
   * @param y2 线段端点2的x坐标
   * @return 最近的距离
   */
  public static distancePointWithLine1(x: number, y: number, x1: number, y1: number, x2: number, y2: number): number {
    let cross: number;
    let d2: number;
    let r: number;
    let px: number;
    let py: number;
    cross = (x2 - x1) * (x - x1) + (y2 - y1) * (y - y1);
    if (cross <= 0) {
      return Math.sqrt((x - x1) * (x - x1) + (y - y1) * (y - y1));
    }

    d2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    if (cross >= d2) {
      return Math.sqrt((x - x2) * (x - x2) + (y - y2) * (y - y2));
    }

    r = cross / d2;
    px = x1 + (x2 - x1) * r;
    py = y1 + (y2 - y1) * r;
    return Math.sqrt((x - px) * (x - px) + (py - y) * (py - y));
  }

  /**
   * 计算多边形面积
   * @param points 顶点集合
   */
  public static calcArea(points: Vector2D[]): number {
    return Math.abs(MathHelper._calcArea(points));
  }

  /** 求面积（有正负） **/
  public static _calcArea(points: Vector2D[]): number {
    let total: number = 0;
    let addX: number = 0;
    let addY: number = 0;
    let subX: number = 0;
    let subY: number = 0;
    const len: number = points.length;
    for (let i = 0; i < len; i++) {
      addX = points[i].x;
      addY = points[i === len - 1 ? 0 : i + 1].y;
      subX = points[i === len - 1 ? 0 : i + 1].x;
      subY = points[i].y;

      total += addX * addY * 0.5;
      total -= subX * subY * 0.5;
    }
    return total;
  }

  /** 获取多边形内部任意一点 */
  public static insidePoint(points: Vector2D[]): Vector2D {
    // const numsPoint: number = points.length;
    const center: Vector2D = new Vector2D();
    const center1: Vector2D = new Vector2D();
    const mPos: Vector2D = new Vector2D();
    let prevPoint: Vector2D = null;
    let nextPoint: Vector2D = null;
    let currentPoint: Vector2D = null;
    let i: number = 1;
    const iCount: number = points.length;
    const poly = new Polygon2D(points);
    if (iCount > 2) {
      for (i = 1; i < iCount - 1; i++) {
        prevPoint = points[i - 1];
        currentPoint = points[i];
        nextPoint = points[i + 1];
        center.x = 0.5 * (prevPoint.x + currentPoint.x);
        center.y = 0.5 * (prevPoint.y + currentPoint.y);
        center1.x = 0.5 * (nextPoint.x + currentPoint.x);
        center1.y = 0.5 * (nextPoint.y + currentPoint.y);
        mPos.x = 0.5 * (center.x + center1.x);
        mPos.y = 0.5 * (center.y + center1.y);
        if (poly.contains(mPos)) {
          return mPos;
        }
      }
    }
    return new Vector2D(0, 0);
  }

  /**
   * 点是否在多边形上
   * @param points
   * @param p
   */
  public static checkPointOnPolygon(points: Vector2D[], p: Vector2D): boolean {
    const iCount = points.length;
    for (let i = 0; i < iCount; i++) {
      const pStart: Vector2D = points[i].clone();
      const pEnd: Vector2D = points[(i + 1) % iCount].clone();
      const dis = MathHelper.distancePointWithLine(p, pStart, pEnd);
      if (dis < 0.01) {
        return true;
      }
    }
    return false;
  }

  /**
   * 计算多边形是否顺时针(由于前期失误，此方法返回true时表示逆时针)
   * @param points 顶点集合
   * @return 如果顺时针则返回false(失误)
   */
  public static isClockwise(points: Vector2D[]): boolean {
    return MathHelper._calcArea(points) < 0;
  }

  public static computeBezier(
    control1: Vector2D,
    control2: Vector2D,
    anchor1: Vector2D,
    anchor2: Vector2D,
    numberOfPoints: number,
  ): Vector2D[] {
    const curve: Vector2D[] = [];

    const dt: number = 1.0 / (numberOfPoints - 1);

    for (let i = 0; i < numberOfPoints; i++) {
      curve.push(this.PointOnCubicBezier(control1, control2, anchor1, anchor2, i * dt));
    }

    return curve;
  }

  public static PointOnCubicBezier(
    control1: Vector2D,
    control2: Vector2D,
    anchor1: Vector2D,
    anchor2: Vector2D,
    t: number,
  ): Vector2D {
    const result: Vector2D = new Vector2D();

    /*計算多項式係數*/
    const cx = 3.0 * (control1.x - anchor1.x);
    const bx = 3.0 * (control2.x - control1.x) - cx;
    const ax = anchor2.x - anchor1.x - cx - bx;

    const cy = 3.0 * (control1.y - anchor1.y);
    const by = 3.0 * (control2.y - control1.y) - cy;
    const ay = anchor2.y - anchor1.y - cy - by;

    /*計算位於參數值t的曲線點*/
    const tSquared = t * t;
    const tCubed = tSquared * t;

    result.x = ax * tCubed + bx * tSquared + cx * t + anchor1.x;
    result.y = ay * tCubed + by * tSquared + cy * t + anchor1.y;

    return result;
  }

  /**
   * 延伸终点
   * @param {Vector2D[]} points
   * @param {number} extendLength
   * @returns {Vector2D[]}
   */
  public static extendPoints(points: Vector2D[], extendLength: number = 50): Vector2D[] {
    const _points = [].concat(points);
    const startPoint: Vector2D = _points.pop().clone();
    const endPoint: Vector2D = _points.pop().clone();
    let dir: Vector2D = startPoint.subtract(endPoint);

    dir = dir.normalize();
    dir = dir.multiply(extendLength);
    const endP: Vector2D = startPoint.add(dir);

    const newPs = [].concat(points);
    if (newPs.length === 2) {
      newPs[1] = endP;
    } else {
      newPs.push(endP);
    }
    return newPs;
  }

  public static reLength(startPoint: Vector2D, endPoint: Vector2D, length): Vector2D {
    const _startPoint = startPoint.clone();
    const _endPoint = endPoint.clone();
    const _vector = _startPoint
      .subtract(_endPoint)
      .normalize()
      .multiply(length);
    return _endPoint;
  }

  private static MIN_ANGLE = 0.2617;
  private static MIN_ANGLE2 = Math.PI * 2 - 0.2617;

  public static minAngle(ver1: Vector2D, ver2: Vector2D): boolean {
    const d1 = ver1.normalize();
    const d2 = ver2.normalize();
    const a1 = Math.atan2(d1.y, d1.x);
    const a2 = Math.atan2(d2.y, d2.x);
    const offset = Math.abs(a1 - a2);
    return offset < this.MIN_ANGLE || offset > this.MIN_ANGLE2;
  }

  /**
   * 点是否在线段上
   * @param x1 线段端点1的x坐标
   * @param y1 线段端点1的x坐标
   * @param x2 线段端点2的x坐标
   * @param y2 线段端点2的x坐标
   * @param x 点的x坐标
   * @param y 点的y坐标
   * @param hasEndPoint 是否包含端点
   * @return 如果在线上则返回
   */
  private static segmentContainsPoint1(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x: number,
    y: number,
    hasEndPoint: boolean = true,
    offset: number = 0.1,
  ): boolean {
    if (MathHelper.distancePointWithLine1(x, y, x1, y1, x2, y2) < offset) {
      if (!hasEndPoint) {
        if (
          MathHelper.distancePointWithPoint1(x, y, x1, y1) > offset &&
          MathHelper.distancePointWithPoint1(x, y, x2, y2) > offset
        ) {
          return true;
        }
      }
      return true;
    }
    return false;
  }

  /**
   * 向量的叉乘
   */
  private static crossMul1(x1: number, y1: number, x2: number, y2: number): number {
    return x1 * y2 - x2 * y1;
  }

  public static pointsToPolygons(pList: Vector2D[][]): Polygon2D[] {
    if (!pList || pList.length < 1) {
      return null;
    }
    const polys: Polygon2D[] = [];
    for (const ps of pList) {
      polys.push(new Polygon2D(ps));
    }
    return polys;
  }

  public static polygonsToPoints(polys: Polygon2D[]): Vector2D[][] {
    if (!polys || polys.length < 1) {
      return null;
    }
    const pList: Vector2D[][] = [];
    for (const poly of polys) {
      pList.push(poly.vertices);
    }
    return pList;
  }

  /**
   * 获取三角形外心（外接圆圆心）
   * @param vers 三角形顶点数组
   */
  public static getTriangleOuterCenter(vers: Vector2D[]): Vector2D {
    if (vers.length !== 3) {
      return null;
    }

    // 0-1、1-2顶点构成的线段
    const triangleLine1: Line2D = new Line2D(vers[0], vers[1]);
    const triangleLine2: Line2D = new Line2D(vers[1], vers[2]);

    // 两条线是否平行
    if (Line2D.isParallel(triangleLine1, triangleLine2)) {
      return null;
    }

    return Line2D.getIntersection(triangleLine1.perpendicularLine(), triangleLine2.perpendicularLine());
  }

  /**
   * 判断一个多边形是否为矩形
   * @param vers 多边形顶点数组(采用对角线相等且互相平分的方式计算，故传入的顶点数组需**顺序**传入)
   */
  public static isRectangle(vers: Vector2D[]): boolean {
    if (!vers || vers.length !== 4) {
      return false;
    }

    // 0-2、1-3顶点构成的对角线
    const diagonalLine1: Line2D = new Line2D(vers[0], vers[2]);
    const diagonalLine2: Line2D = new Line2D(vers[1], vers[3]);

    // 对角线长度是否相等
    if (!MathTool.numberEquals(diagonalLine1.lengthSquared, diagonalLine2.lengthSquared, 10)) {
      return false;
    }

    // 求对角线是否平行
    if (Line2D.isParallel(diagonalLine1, diagonalLine2)) {
      return false;
    }

    // 对角线的中心点是否重合
    if (diagonalLine1.center.equals(diagonalLine2.center, 1)) {
      return true;
    }

    return false;
  }
  /**
   * 偏移路径线,两点式
   * @param basePs
   * @param width
   */
  public static calcOffsetPath2P(basePs: Vector2D[], width: number): Vector2D[] {
    const newPath: Vector2D[] = [];
    const iCount = basePs.length;
    let dir: Vector2D = null;
    for (let i = 0; i < iCount; i++) {
      const p: Vector2D = basePs[i];

      if (i === iCount - 1) {
        dir = p.clone().sub(basePs[i - 1].clone());
      } else {
        dir = basePs[i + 1].clone().sub(p.clone());
      }
      dir = dir.normalize();
      dir = dir.getLeftNormal();
      dir = dir.multiplyBy(width);
      newPath.push(new Vector2D(p.x + dir.x, p.y + dir.y));
    }
    return newPath;
  }
  /**
   * 偏移路径线,3点式，准确，但计算大
   * @param basePs
   * @param width
   */
  public static calcOffsetPath3P(basePs: Vector2D[], width: number): Vector2D[] {
    // basePs = MathHelper.removeUselessPointsOnPath(basePs);
    const newPath: Vector2D[] = [];
    const maxW: number = Math.abs(width * 100);
    const iCount = basePs.length;
    for (let i = 0; i < iCount; i++) {
      const p: Vector2D = basePs[i];
      const nextP: Vector2D = basePs[(i + 1) % iCount];
      const prevP: Vector2D = basePs[(i - 1 + iCount) % iCount];
      const linePrev: Line2D = new Line2D(p, prevP);
      const lineNext: Line2D = new Line2D(p, nextP);
      const offsetLine1 = linePrev.translateRight(width);
      const offsetLine2 = lineNext.translateLeft(width);

      const offsetLine = linePrev.translateRight(width);
      let interP: Vector2D = offsetLine.start;
      if (!linePrev.isPointOnLine(nextP)) {
        const interP2 = Line2D.getIntersection(offsetLine1, offsetLine2);
        const disS: number = p.distanceSquared(interP2);
        interP = disS < maxW ? interP2 : interP;
      }
      newPath.push(interP);
    }
    return newPath;
  }

  /**
   * 调整一圈点，让它第一点最靠近指定的点
   * @param point
   * @param points
   */
  public static adjustFirstPoints(point: Vector2D, points: Vector2D[]): Vector2D[] {
    let idx = 0;
    let min: number = Number.MAX_VALUE;
    const count = points.length;
    for (let i = 0; i < count; i++) {
      const dis = points[i].distanceSquared(point);
      if (dis < min) {
        idx = i;
        min = dis;
      }
    }
    const ps: Vector2D[] = [];
    for (let i = 0; i < count; i++) {
      ps.push(points[(i + idx) % count]);
    }
    return ps;
  }
}
