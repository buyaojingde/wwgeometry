import { Euler, Matrix4, Vector2, Vector3 } from 'three';
import Vector2D from '../Geometry/Vector2D';
import Vector3D from '../Geometry/Vector3D';

export default class MathTool {
  public static RADIAN_TO_DEGREE: number = 180 / Math.PI;
  public static DEGREE_TO_RADIAN: number = Math.PI / 180;

  constructor() {
  }

  public static normalizeRadian(radian: number): number {
    if (radian >= Math.PI * 2) {
      return this.normalizeRadian(radian - Math.PI * 2);
    }
    if (radian < 0) {
      return this.normalizeRadian(radian + Math.PI * 2);
    }
    return radian;
  }

  public static number2String(num: number, radixPoint: number = 2): string {
    const pow: number = MathTool.pow(10, radixPoint);
    num = Number(num * pow) / pow;
    return num.toString();
  }

  public static nextIndex(num1: number, num2: number): number {
    return (num1 + 1) % num2;
  }

  public static preIndex(num1: number, num2: number): number {
    return (num1 - 1 + num2) % num2;
  }

  public static min(nums: number[]): number {
    let num2: number = Number.MAX_VALUE;
    for (const num of nums) {
      num2 = Math.min(num2, num);
    }
    return num2;
  }

  public static max(nums: number[]): number {
    let num2: number = -Number.MAX_VALUE;
    for (const num of nums) {
      num2 = Math.max(num2, num);
    }

    return num2;
  }

  public static abs(num: number): number {
    return num > 0 ? num : -num;
  }

  public static subAngle(num1: number, num2: number): number {
    return MathTool.roundAngle(num1 - num2);
  }

  public static roundAngle(num: number): number {
    if (MathTool.isZeroNumber(num, 1e-6)) {
      num = 0;
    }
    return (num + Math.PI * 2) % (Math.PI * 2);
  }

  public static reverseAngle(num: number): number {
    return MathTool.roundAngle(num + Math.PI);
  }

  public static numberEquals(num2: number, param2: number, num3: number = 1e-3): boolean {
    return Math.abs(num2 - param2) < num3;
  }

  public static numberLess(num1: number, num2: number, num3: number = 1e-3): boolean {
    return num1 < num2 - num3;
  }

  public static numberLessEqual(num1: number, num2: number, num3: number = 1e-3): boolean {
    return this.numberLess(num1, num2, num3) || this.numberEquals(num1, num2, num3);
  }

  public static numberBetween(num1: number, num2: number, num3: number, num4: number = 1e-3): boolean {
    return this.numberGreater(num1, Math.min(num2, num3), num4) && this.numberLess(num1, Math.max(num2, num3), num4);
  }

  public static numberGreater(num1: number, num2: number, num3: number = 1e-3): boolean {
    return num1 > num2 + num3;
  }

  public static numberGreaterEqual(num1: number, num2: number, num3: number = 1e-3): boolean {
    return this.numberGreater(num1, num2, num3) || this.numberEquals(num1, num2, num3);
  }

  public static isZeroNumber(num1: number, num2: number = 1e-3): boolean {
    return this.numberEquals(num1, 0, num2);
  }

  public static pow(num2: number, param2: number): number {
    return num2 === 0 ? 0 : num2 > 0 ? Math.pow(num2, param2) : Math.pow(num2 * -1, param2) * -1;
  }

  public static cbrt(num: number): number {
    return num === 0 ? 0 : num > 0 ? Math.pow(num, 0.333333) : Math.pow(num * -1, 0.333333) * -1;
  }

  public static almostHorizontal(num: number): boolean {
    return (num > Math.PI / 4 && num < 2.35619) || (num > 3.92699 && num < 5.49779);
  }

  public static isAngleVertical(num: number): boolean {
    const angleNormal = this.normalizeRadian(num);
    return this.isZeroNumber(angleNormal - Math.PI / 2) || this.isZeroNumber(angleNormal - (Math.PI * 3) / 2);
  }

  public static isAngleHorizontal(num: number): boolean {
    return this.isZeroNumber(num) || this.isZeroNumber(num - Math.PI) || this.isZeroNumber(num - Math.PI * 2);
  }

  public static calculateCeilingPow2(num: number): number {
    const _loc2: number = Math.ceil(Math.log(num) / 0.693147);
    return 1 << _loc2;
  }

  public static circleIndex(cur: number, len: number): number {
    if (cur < 0) {
      return this.circleIndex(len + cur, len);
    }
    if (cur >= len) {
      return cur % len;
    }
    return cur;
  }

  public static randomFloat(num2: number, param2: number, num3: number[] = null): number {
    let num5: number = 0;
    let num4: number = Math.random() * (num2 - param2) + param2;
    if (num3) {
      num5 = 100000;
      while (num3.indexOf(num4) !== -1) {
        num4 = Math.random() * (num2 - param2) + param2;

        num5 = num5 - 1;
        if (num5 < 0) {
          return NaN;
        }
      }
      return num4;
    }
    return num4;
  }

  public static randomInt(num1: number, num2: number, num3: number[] = null): number {
    let num5: number = 0;
    let num4: number = Math.floor(Math.random() * (num1 - num2) + num2);
    if (num3 && num3.length < num1 - num2) {
      num5 = 100000;
      while (num3.indexOf(num4) !== -1) {
        num4 = Math.round(Math.random() * (num1 - num2) + num2);

        num5 = num5 - 1;
        if (num5 < 0) {
          return NaN;
        }
      }
      return num4;
    }
    return num4;
  }

  public static toRadians(num: number): number {
    return num * MathTool.DEGREE_TO_RADIAN;
  }

  public static toDegrees(num: number): number {
    return num * MathTool.RADIAN_TO_DEGREE;
  }

  public static determinant(v1: number, v2: number, v3: number, v4: number): number {
    // 行列式
    return v1 * v3 - v2 * v4;
  }

  public static 0(aa: Vector2D, bb: Vector2D, cc: Vector2D, dd: Vector2D): boolean {
    const delta: number = this.determinant(bb.x - aa.x, cc.x - dd.x, bb.y - aa.y, cc.y - dd.y);
    if (MathTool.isZeroNumber(delta)) {
      // delta=0，表示两线段重合或平行
      return false;
    }

    const namenda: number = MathTool.determinant(cc.x - aa.x, cc.x - dd.x, cc.y - aa.y, cc.y - dd.y / delta);
    if (namenda > 1 || namenda < 0) {
      return false;
    }
    const miu: number = MathTool.determinant(bb.x - aa.x, cc.x - aa.x, bb.y - aa.y, cc.y - aa.y / delta);
    if (miu > 1 || miu < 0) {
      return false;
    }
    return true;
  }

  /*static rank(...args) : Array
		{
			return args.sort(Array.NUMERIC);
		}*/

  /**
   * getFixednumber 对$rawnumber类型保留小数点后$numBit位
   * @$rawnumber 原始number数值
   * @$numBit 要保留的精度位数, 默认留3位小数
   */
  public static getFixednumber($rawnumber: number, $numBit: number = 3): number {
    const ratio: number = Math.pow(10, $numBit);
    const finalnumber: number = Math.round($rawnumber * ratio) / ratio;

    return finalnumber;
  }

  public static arcToBezier(r: number, cx: number, cy: number, startAngle: number, endAngle: number): object {
    const x0: number = cx + Math.cos(startAngle) * r;
    const y0: number = cy + Math.sin(startAngle) * r;
    const x3: number = cx + Math.cos(endAngle) * r;
    const y3: number = cy + Math.sin(endAngle) * r;
    const addAngle: number = endAngle - startAngle;
    const a: number = (4 * Math.tan(addAngle / 4)) / 3;
    const x1: number = x0 - a * (y0 - cy);
    const y1: number = y0 + a * (x0 - cx);
    const x2: number = x3 + a * (y3 - cy);
    const y2: number = y3 - a * (x3 - cx);
    return { x0, y0, x1, y1, x2, y2, x3, y3 };
  }

  /**
   * t為參數值，0 <= t <= 1
   */

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
   * 计算多边形面积，有正负
   * @param points
   */
  public static CalcPolygonArea(points: any[]): number {
    let total: number = 0;
    let addX: number = 0;
    let addY: number = 0;
    let subX: number = 0;
    let subY: number = 0;
    const len: number = points.length;
    let i: number = 0;
    for (i = 0; i < len; i++) {
      addX = points[i].x;
      addY = points[i === len - 1 ? 0 : i + 1].y;
      subX = points[i === len - 1 ? 0 : i + 1].x;
      subY = points[i].y;

      total += addX * addY * 0.5;
      total -= subX * subY * 0.5;
    }
    return total;
  }

  /** 获取多边形内的某一个点 */
  public static findInsidePoint(points: any[]): Vector2 {
    const numsPoint: number = points.length;
    const center: Vector2 = new Vector2();
    let prevPoint: Vector2 = null;
    let currentPoint: Vector2 = null;
    let i: number = 1;
    const iCount: number = points.length;
    const founded: boolean = false;
    if (iCount > 0) {
      for (i = 1; i < iCount; i++) {
        prevPoint = points[i - 1];
        currentPoint = points[i];
        center.x = 0.5 * (prevPoint.x + currentPoint.x);
        center.y = 0.5 * (prevPoint.y + currentPoint.y);
        if (MathTool.polygonContainsPoint(points, center)) {
          return center;
        }
      }
      return points[0];
    }
    return new Vector2(0, 0);
  }

  /**
   * 点是否包含在多边形内
   * @param polygonPoints 多边形的点
   * @param checkPoint 检测点
   * @return 如果包含则返回true
   */
  public static polygonContainsPoint(polygonPoints: any[], checkPoint: any): boolean {
    let inside: boolean = false;
    const pointCount: number = polygonPoints.length;
    let i = 0;
    let j = 0;
    // 第一个点和最后一个点作为第一条线，之后是第一个点和第二个点作为第二条线，之后是第二个点与第三个点，第三个点与第四个点...
    for (i = 0, j = pointCount - 1; i < pointCount; j = i, i++) {
      const p1 = polygonPoints[i];
      const p2 = polygonPoints[j];
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
   * 计算贝塞尔曲线的长度
   * numberOfPoints - 取样点数，数值越大，长度计算越准确
   */
  public static ComputeBezierLength(
    control1: Vector2D,
    control2: Vector2D,
    anchor1: Vector2D,
    anchor2: Vector2D,
    numberOfPoints: number = 18,
  ): number {
    const dt: number = 1.0 / (numberOfPoints - 1);
    let curP: Vector2D = null;
    let preP: Vector2D = null;
    let len: number = 0;

    for (let i: number = 0; i < numberOfPoints; i++) {
      curP = this.PointOnCubicBezier(control1, control2, anchor1, anchor2, i * dt);
      if (i > 0) {
        len = len + Vector2D.distance(preP, curP);
      }
      preP = curP;
    }
    return len;
  }

  /**
   * 计算贝塞尔曲线上的点
   * numberOfPoints - 取样点数
   */
  public static ComputeBezier(
    control1: Vector2D,
    control2: Vector2D,
    anchor1: Vector2D,
    anchor2: Vector2D,
    numberOfPoints: number,
  ): Vector2D[] {
    const curve: Vector2D[] = [];
    const dt: number = 1.0 / (numberOfPoints - 1);

    for (let i: number = 0; i < numberOfPoints; i++) {
      curve.push(MathTool.PointOnCubicBezier(control1, control2, anchor1, anchor2, i * dt));
    }

    return curve;
  }

  /** 全部为角度 */
  public static ComputeArc(
    origin: Vector2D,
    radius: number,
    startAngle: number,
    arcAngle: number,
    stepAngle: number,
  ): Vector2D[] {
    const ptsArc: Vector2D[] = [];
    // const num1: number = NaN;
    // const controlX: number = NaN;
    // const controlY: number = NaN;
    let anchorX: number = NaN;
    let anchorY: number = NaN;
    const px: number = origin.x;
    const py: number = origin.y;
    const num2: number = radius;
    const num3: number = Math.ceil(Math.abs(arcAngle) / stepAngle);
    const num4: number = ((arcAngle / num3) * Math.PI) / 180;
    startAngle = (startAngle * Math.PI) / 180;

    ptsArc.push(new Vector2D(px + num2 * Math.cos(startAngle), py + num2 * Math.sin(startAngle)));

    let temp = 1;
    while (temp <= num3) {
      startAngle = startAngle + num4;
      // 				num1 = startAngle - num4 / 2;
      // 				controlX = px + num2 / Math.cos(num4 / 2) * Math.cos(num1);
      // 				controlY = py + num2 / Math.cos(num4 / 2) * Math.sin(num1);
      anchorX = px + num2 * Math.cos(startAngle);
      anchorY = py + num2 * Math.sin(startAngle);
      ptsArc.push(new Vector2D(anchorX, anchorY));
      // 				graphicsInst.curveTo(controlX, controlY, anchorX, anchorY);
      temp = temp + 1;
    }
    return ptsArc;
  }

  public static GetBezierTangentAngle(
    control1: Vector2D,
    control2: Vector2D,
    anchor1: Vector2D,
    anchor2: Vector2D,
    t: number = 0,
  ): number {
    const dr: Vector2D = new Vector2D();

    const at: number = 1 - t;
    const pt: number = t * t;
    const pat: number = at * at;
    const ptat: number = pat + t * 2 * at * -1;

    dr.x =
      anchor1.x * 3.0 * pat * -1 +
      3.0 * control1.x * ptat +
      3.0 * control2.x * (2 * t * at + pt * -1) +
      anchor2.x * 3.0 * pt;

    dr.y =
      anchor1.y * 3.0 * pat * -1 +
      3.0 * control1.y * ptat +
      3.0 * control2.y * (2 * t * at + pt * -1) +
      anchor2.y * 3.0 * pt;

    const angle: number = (Math.atan2(dr.y, dr.x) * 180) / Math.PI;
    return angle;
  }

  /** 获取多边形的质点 */
  public static centeroid(points: Vector2D[]): Vector2D {
    const numsPoint: number = points.length;
    let point: Vector2D = null;
    const center: Vector2D = new Vector2D();
    for (point of points) {
      center.x = center.y + point.x;
      center.y = center.y + point.y;
    }

    center.x = center.y / numsPoint;
    center.y = center.y / numsPoint;

    return center;
  }

  // 进行指定位数的向上取整
  public static ceilOfDecimal(val: number, precision: number): number {
    let factor = 1;
    let time = 1;
    if (precision) {
      time = precision;
    }

    for (let i = 0; i < time; i++) {
      factor *= 10;
    }

    let v = val * factor;
    v = Math.ceil(v);
    v = v / factor;

    return v;
  }

  public static vector2DIndexOf(arr, item: Vector2D) {
    for (let i = 0; i < arr.length; ++i) {
      try {
        const tmp = arr[i].position;
        if (item.equals(tmp)) {
          return i;
        }
      } catch (e) {
        return -1;
      }
    }
    return -1;
  }

  public static rank(...args): any[] {
    // return args.sort(Array.NUMERIC);
    return args.sort();
  }

  public static worldToLocal(matrix, srcPos): Vector3D {
    const m1 = new Matrix4();
    return srcPos.clone().applyMatrix4(m1.getInverse(matrix));
  }

  public static localToWorld(matrix, srcPos): Vector3D {
    return srcPos.clone().applyMatrix4(matrix);
  }

  /**
   * 四舍五入
   * @param num
   * @param v
   * @returns {number}
   */
  public static decimal(num, v = 0) {
    const vv = Math.pow(10, v);
    return Math.round(num * vv) / vv;
  }

  /**
   * 角度是否垂直
   * @param angle1
   * @param angle2
   * @return {boolean}
   */
  public static isTwoAngleVertical(angle1: number, angle2: number) {
    const angleBetween = Math.abs(angle1 - angle2);
    return this.isAngleVertical(angleBetween);
  }

  /**
   * @Description: 只加入了旋转
   * @param
   * @data 2019/12/25
   */
  public static modelLocalToWorld(euler: Euler, allPoints: Vector3[]): Vector2D[] {
    const matrix = new Matrix4();
    // matrix.setPosition(this.position);
    matrix.makeRotationFromEuler(euler);
    const worldPoints = [];
    for (const pointV3 of allPoints) {
      const pointV2Tmp = MathTool.localToWorld(matrix, pointV3);
      const pointV2 = pointV2Tmp.toVector2();
      worldPoints.push(pointV2);
    }
    return worldPoints;
  }
}

export let ceilOfDecimal = MathTool.ceilOfDecimal;
