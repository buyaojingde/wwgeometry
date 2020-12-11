import minBy from "lodash/minBy";
import { Euler, Matrix4, Quaternion, Vector3 } from "three";
import {
  EPointLineRelation,
  ESegOverlapType,
} from "../../../global/Enum/EnumData";
import MathHelper from "../Util/MathHelper";
import MathTool from "../Util/MathTool";
import Vector2D from "./Vector2D";

export default class Line2D {
  public static horizontalLine: Line2D = new Line2D(
    Vector2D.ORIGIN_V2D,
    Vector2D.X_AXIS
  );
  public static verticalLine: Line2D = new Line2D(
    Vector2D.ORIGIN_V2D,
    Vector2D.Y_AXIS
  );
  protected _dirty: boolean;
  private _syncStatus: number; // 参考SharedConstants.SYNC_DELETE

  constructor(vec1?: Vector2D, vec2?: Vector2D) {
    // if (vec1.equals(vec2)) {
    //   throw new Error('不构成线');
    // }
    this._start = !vec1 ? new Vector2D() : vec1.clone();
    this._end = !vec2 ? new Vector2D() : vec2.clone();
    this._syncStatus = -1;
    this._dirty = true;
  }

  protected _start: Vector2D;

  get start(): Vector2D {
    return this._start;
  }

  set start(vec: Vector2D) {
    this._start = vec;
    return;
  }

  protected _end: Vector2D;

  get end(): Vector2D {
    return this._end;
  }

  set end(vec: Vector2D) {
    this._end = vec;
    return;
  }

  private _normalize!: Vector2D | null;

  get normalize(): Vector2D | null {
    if (this.distance === 0) {
      return null;
    }
    return this.direction.divideNumber(this.distance);
  }

  set normalize(value: Vector2D | null) {
    this._normalize = value;
  }

  get debugCad(): string {
    const str: string =
      "Line " +
      this._start.x +
      "," +
      -this._start.y +
      " " +
      this._end.x +
      "," +
      -this._end.y +
      " \n";
    return str;
  }

  set debugCad(s: string) {
    // only for debug
  }

  get center(): Vector2D {
    return this.interpolate(0.5);
    // return new Vector2D();
  }

  get direction(): Vector2D {
    return this._end.subtract(this._start);
  }

  get reverseDirection(): Vector2D {
    return this._start.subtract(this.end);
  }

  get leftNormal(): Vector2D {
    return new Vector2D(
      this._end.y - this._start.y,
      this._start.x - this._end.x
    );
  }

  // 取垂直向量
  get rightNormal(): Vector2D {
    return new Vector2D(
      this._start.y - this._end.y,
      this._end.x - this._start.x
    );
  }

  get distance(): number {
    return this._start.distance(this._end);
  }

  get points(): Vector2D[] {
    return [this.start.clone(), this.end.clone()];
  }

  get length(): number {
    return Vector2D.distance(this._start, this._end);
  }

  get lengthSquared(): number {
    return Vector2D.distanceSquared(this._start, this._end);
  }

  get angle(): number {
    if (this.start === this.end) {
      // @ts-ignore
      return null;
    }
    return Vector2D.angleTo(this._start, this._end);
  }

  public get degrees(): number {
    return MathTool.toDegrees(this.angle);
  }

  public static fromArray(array: number[][]): Line2D {
    const start = new Vector2D().fromArray(array[0]);
    const end = new Vector2D().fromArray(array[1]);

    return new Line2D(start, end);
  }

  public static isZeroNumber(num1: number, num2 = 1e-3): boolean {
    return Math.abs(num1) < num2;
  }

  public static isParallel(
    line1: Line2D,
    line2: Line2D,
    tolDegrees = 1
  ): boolean {
    if (!line1 || !line2) {
      return false;
    }
    const vec5: Vector2D = line1.direction;
    if (!line2) {
      return false;
    }
    const vec4: Vector2D = line2.direction;
    if (vec4.equals(Vector2D.zero) || vec5.equals(Vector2D.zero)) {
      return false;
    }
    const vec6: number = vec5.angleBetween(vec4);
    return (
      MathTool.toDegrees(vec6) <= tolDegrees ||
      MathTool.toDegrees(vec6) >= MathTool.toDegrees(Math.PI) - tolDegrees
    );
  }

  public static isLineALinkWithLineBNew(lineA: Line2D, lineB: Line2D): boolean {
    const lineAStartPt: Vector2D = lineA.start;
    const lineAEndPt: Vector2D = lineA.end;

    const lineBStartPt: Vector2D = lineB.start;
    const lineBEndPt: Vector2D = lineB.end;

    if (
      (lineAStartPt.equals(lineBStartPt, 0.8) &&
        lineAEndPt.equals(lineBEndPt, 0.8)) ||
      (lineAStartPt.equals(lineBEndPt, 0.8) &&
        lineAEndPt.equals(lineBStartPt, 0.8))
    ) {
      return false;
    }

    if (
      Line2D.isParallel(lineA, lineB) &&
      ((lineAStartPt.equals(lineBStartPt) &&
        !Line2D.isLineAPartOverlapLineB(lineA, lineB)) ||
        (lineAStartPt.equals(lineBEndPt) &&
          !Line2D.isLineAPartOverlapLineB(lineA, lineB)) ||
        (lineAEndPt.equals(lineBStartPt) &&
          !Line2D.isLineAPartOverlapLineB(lineA, lineB)) ||
        (lineAEndPt.equals(lineBEndPt) &&
          !Line2D.isLineAPartOverlapLineB(lineA, lineB)))
    ) {
      return true;
    }

    return false;
  }

  public static isLineAPartOverlapLineB(
    lineA: Line2D,
    lineB: Line2D,
    tolParallel = 1,
    tolPtEquals = 0.1
  ): boolean {
    let bRes = false;

    if (!Line2D.isParallel(lineA, lineB, tolParallel)) {
      return false;
    }

    const startA = lineA.start;
    const startAProjLineB = lineB.getProjection(startA, true);

    const endA = lineA.end;
    const endAProjLineB = lineB.getProjection(endA, true);

    const startB = lineB.start;
    const startBProjLineA = lineA.getProjection(startB, true);

    const endB = lineB.end;
    const endBProjLineA = lineA.getProjection(endB, true);

    if (
      startAProjLineB &&
      !startAProjLineB.equals(startB, tolPtEquals) &&
      !startAProjLineB.equals(endB, tolPtEquals)
    ) {
      bRes = true;
    } else if (
      endAProjLineB &&
      !endAProjLineB.equals(startB, tolPtEquals) &&
      !endAProjLineB.equals(endB, tolPtEquals)
    ) {
      bRes = true;
    } else if (
      startBProjLineA &&
      !startBProjLineA.equals(startA, tolPtEquals) &&
      !startBProjLineA.equals(endA, tolPtEquals)
    ) {
      bRes = true;
    } else if (
      endBProjLineA &&
      !endBProjLineA.equals(startA, tolPtEquals) &&
      !endBProjLineA.equals(endA, tolPtEquals)
    ) {
      bRes = true;
    }

    return bRes;
  }

  public static getLineAngle(line1: Line2D, line2: Line2D, num = 1): number {
    if (!line1 || !line2) {
      throw new Error("buggggggg");
    }
    const vec5: Vector2D = line1.direction;
    const vec4: Vector2D = line2.direction;
    const vec6: number = vec5.angleBetween(vec4);
    return MathTool.toDegrees(vec6);
  }

  //   /**
  //    * 点在线段上
  //    */

  public static getIntersection(
    line1: Line2D,
    line2: Line2D,
    tolParallel = 1e-3
  ): Vector2D {
    if (this.isParallel(line1, line2, tolParallel)) {
      // @ts-ignore
      return null;
    }
    const vec8: Vector2D = line1.start;
    const vec5: Vector2D = line1.end;
    const vec4: Vector2D = line2.start;
    const vec7: Vector2D = line2.end;
    const vec3: Vector2D = vec8.clone();
    const temp1: number =
      (vec8.x - vec4.x) * (vec4.y - vec7.y) -
      (vec8.y - vec4.y) * (vec4.x - vec7.x);
    const temp2: number =
      (vec8.x - vec5.x) * (vec4.y - vec7.y) -
      (vec8.y - vec5.y) * (vec4.x - vec7.x);
    let num6: number;
    if (temp2 === 0) {
      num6 = 0;
    } else {
      num6 = temp1 / temp2;
    }
    vec3.x = vec3.x + (vec5.x - vec8.x) * num6;
    vec3.y = vec3.y + (vec5.y - vec8.y) * num6;
    return vec3;
  }

  /**
   * 线段是否相交
   * @param line1
   * @param line2
   * @param tolParallel
   */
  public static getIntersectionSegment(
    line1: Line2D,
    line2: Line2D,
    tolParallel = 1e-3
  ): Vector2D {
    const v = Line2D.getIntersection(line1, line2, tolParallel);
    if (
      v &&
      line1.isInsideLine(v, tolParallel) &&
      line2.isInsideLine(v, tolParallel)
    ) {
      return v;
    }
    // @ts-ignore
    return;
  }

  /**
   * 求线段和直线交点，可以过端点,调这个函数前提是已知不平行
   * @param seg
   * @param line
   * @param tolParallel
   */
  public static calcSegmentLineIntersect(seg: Line2D, line: Line2D): Vector2D {
    const interP: Vector2D = Line2D.getIntersection(seg, line);
    if (!interP) {
      // @ts-ignore
      return null;
    }
    const dis1 = Vector2D.distance(interP, seg.start);
    const dis2 = Vector2D.distance(interP, seg.end);
    const disSeg = seg.length;
    if (Math.abs(disSeg - dis1 - dis2) < 0.00001) {
      return interP;
    }

    // @ts-ignore
    return null;
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

  /**
   * @Description: 端点
   * @param
   * @data 2019/12/25
   */
  public static getIntersectionSegmentContainEndPoint(
    line1: Line2D,
    line2: Line2D,
    tolParallel = 1e-3
  ): Vector2D {
    if (Line2D.isParallel(line1, line2)) {
      // @ts-ignore
      return null;
    }
    if (line1.isInsideLine(line2.start, tolParallel)) {
      return line2.start;
    }
    if (line1.isInsideLine(line2.end, tolParallel)) {
      return line2.end;
    }
    // @ts-ignore
    return null;
  }

  public static getDistance(
    vec1: Vector2D,
    vec2: Vector2D,
    vec3: Vector2D,
    beTRUE = false
  ): number {
    if (Line2D.isZeroNumber(1)) {
      return Vector2D.distance(vec3, vec1);
    }
    const num5: number =
      Vector2D.dotProduct(
        Vector2D.subtract(vec3, vec1),
        Vector2D.subtract(vec2, vec1)
      ) / Vector2D.distanceSquared(vec1, vec2);
    if (
      Vector2D.dotProduct(
        Vector2D.subtract(vec3, vec1),
        Vector2D.subtract(vec2, vec1)
      ) /
        Vector2D.distanceSquared(vec1, vec2) <
        0 &&
      beTRUE
    ) {
      return Vector2D.distance(vec3, vec1);
    }
    if (num5 > 1 && beTRUE) {
      return Vector2D.distance(vec3, vec2);
    }
    const _loc6: Vector2D = Vector2D.subtract(vec2, vec1)
      .multiplyBy(num5)
      .incrementBy(vec1);
    return vec3.distance(_loc6);
  }

  public static getLineDirection(
    line1: Line2D,
    line2: Line2D,
    num = 1
  ): number {
    const vec5: Vector2D = line1.direction;
    const vec4: Vector2D = line2.direction;
    const vec6: number = vec5.crossProduct(vec4);

    return vec6;
  }

  public static isVertical(lineA: Line2D, lineB: Line2D, tol = 1): boolean {
    const dirA: Vector2D = lineA.direction;
    const dirB: Vector2D = lineB.direction;
    const angleInRad: number = dirB.angleBetween(dirA);
    return MathTool.numberLessEqual(
      Math.abs(
        MathTool.toDegrees(angleInRad) - MathTool.toDegrees(Math.PI / 2)
      ),
      tol
    );
  }

  /**
   * Desc: 检测线是否平行非共线且投影重叠
   * @lineA: 待检测的直线lineA
   * @lineB: 待检测的直线lineB
   * @tolDist: 两直线的间距最大值
   * @tolLen: 两直线长度的最小值
   *
   * eg.
   *    1.
   *     ______________
   * 　　  _________________
   *
   *    2.
   *      ______________
   *    ______________
   *
   *    3.
   *     ______________
   *   ____________________
   *
   *  except.
   *       lineA
   *    _______________
   *       lineB
   *    _______________
   *
   *    lineA           lineB
   *    ——————————    ———————————
   */

  public static isLineAParallelLineBWithCross(
    lineA: Line2D,
    lineB: Line2D,
    tolDist = 60,
    tolLen = 5
  ): boolean {
    let bResult = false;

    // exclude __________    __________
    const startA: Vector2D = lineA.start;
    const endA: Vector2D = lineA.end;

    const startB: Vector2D = lineB.start;
    const endB: Vector2D = lineB.end;

    const lengthA: number = lineA.length;
    const lengthB: number = lineB.length;

    if (
      lineA.isPointOnLine(startB) ||
      lineB.isPointOnLine(startA) ||
      !Line2D.isParallel(lineA, lineB) ||
      MathTool.numberLess(lengthA, tolLen, 0.1) ||
      MathTool.numberLess(lengthB, tolLen, 0.1)
    ) {
      return bResult;
    }

    // exclude ________________________
    //        ________________________
    const startAProjLineB: Vector2D = lineB.getProjection(startA);

    if (MathTool.numberEquals(lengthA, lengthB, 0.8)) {
      if (
        startB.equals(startAProjLineB, 0.8) ||
        endB.equals(startAProjLineB, 0.8)
      ) {
        return bResult;
      }
    }

    // exclude parallel distance  dist < 10  or dist > 100
    const paraDist: number = Vector2D.distance(startA, startAProjLineB);
    if (paraDist < tolDist * 0.1 || paraDist > tolDist) {
      return bResult;
    }

    // check cross.
    const startAProjToStartB: number = Vector2D.distance(
      startAProjLineB,
      startB
    );
    const startAProjToEndB: number = Vector2D.distance(startAProjLineB, endB);

    const endAProjLineB: Vector2D = lineB.getProjection(endA);
    const endAProjToStartB: number = Vector2D.distance(endAProjLineB, startA);
    const endAProjToEndB: number = Vector2D.distance(endAProjLineB, endB);

    const startBProjLineA: Vector2D = lineA.getProjection(startB);
    const startBProjToStartA: number = Vector2D.distance(
      startBProjLineA,
      startA
    );
    const startBProjToEndA: number = Vector2D.distance(startBProjLineA, endA);

    const endBProjLineA: Vector2D = lineA.getProjection(endB);
    const endBProjToStartA: number = Vector2D.distance(endBProjLineA, startA);
    const endBProjToEndA: number = Vector2D.distance(endBProjLineA, endA);

    if (
      (lineB.isPointOnSegment(startAProjLineB) &&
        MathTool.numberGreater(startAProjToStartB, 5) &&
        MathTool.numberGreater(startAProjToEndB, 5)) ||
      (lineB.isPointOnSegment(endAProjLineB) &&
        MathTool.numberGreater(endAProjToStartB, 5) &&
        MathTool.numberGreater(endAProjToEndB, 5)) ||
      (lineA.isPointOnSegment(startBProjLineA) &&
        MathTool.numberGreater(startBProjToStartA, 5) &&
        MathTool.numberGreater(startBProjToEndA, 5)) ||
      (lineA.isPointOnSegment(endBProjLineA) &&
        MathTool.numberGreater(endBProjToStartA, 5) &&
        MathTool.numberGreater(endBProjToEndA, 5))
    ) {
      bResult = true;
    }

    return bResult;
  }

  /**
   * Desc: 检测线是否平行非共线且投影不重叠
   * @lineA: 待检测的直线lineA
   * @lineB: 待检测的直线lineB
   * @tolDist: 两直线的间距最大值
   * @tolLen: 两直线长度的最小值
   *
   * eg.
   *    1.
   *     ______________
   *                      _________________
   *
   */

  public static isLineAParallelLineBWithNoCross(
    lineA: Line2D,
    lineB: Line2D,
    tolDist = 100,
    tolLen = 5,
    maxInterval = 30,
    minInterval = 0.5
  ): boolean {
    let bResult = false;

    // exclude __________    __________
    const startA: Vector2D = lineA.start;
    const endA: Vector2D = lineA.end;

    const startB: Vector2D = lineB.start;
    const endB: Vector2D = lineB.end;

    const lengthA: number = lineA.length;
    const lengthB: number = lineB.length;

    if (
      lineA.isPointOnLine(startB) ||
      lineB.isPointOnLine(startA) ||
      !Line2D.isParallel(lineA, lineB) ||
      MathTool.numberLess(lengthA, tolLen, 0.1) ||
      MathTool.numberLess(lengthB, tolLen, 0.1)
    ) {
      return bResult;
    }

    // exclude ________________________
    //        ________________________
    const startAProjLineB: Vector2D = lineB.getProjection(startA);

    if (MathTool.numberEquals(lengthA, lengthB, 0.8)) {
      if (
        startB.equals(startAProjLineB, 0.8) ||
        endB.equals(startAProjLineB, 0.8)
      ) {
        return bResult;
      }
    }

    // exclude parallel distance dist > 100
    const paraDist: number = Vector2D.distance(startA, startAProjLineB);
    if (paraDist > tolDist) {
      return bResult;
    }

    // check not cross.
    const endAProjLineB: Vector2D = lineB.getProjection(endA);
    const startBProjLineA: Vector2D = lineA.getProjection(startB);
    const endBProjLineA: Vector2D = lineA.getProjection(endB);

    if (
      !lineB.isPointOnSegment(startAProjLineB) &&
      !lineB.isPointOnSegment(endAProjLineB) &&
      !lineA.isPointOnSegment(startBProjLineA) &&
      !lineA.isPointOnSegment(endBProjLineA)
    ) {
      bResult = true;
    }

    // exclude interval < 8 or interval >= 100
    const lineInterval: number = Math.min(
      Vector2D.distance(startBProjLineA, startA),
      Vector2D.distance(startBProjLineA, endA),
      Vector2D.distance(endBProjLineA, startA),
      Vector2D.distance(endBProjLineA, endA)
    );

    if (lineInterval < minInterval || lineInterval > maxInterval) {
      bResult = false;
    }

    return bResult;
  }

  public static isLineAParallelLineBWithCrossOverlap(
    lineA: Line2D,
    lineB: Line2D,
    tolDist = 60,
    tolLen = 5
  ): boolean {
    let bResult = false;

    // exclude __________    __________
    const startA: Vector2D = lineA.start;
    const endA: Vector2D = lineA.end;

    const startB: Vector2D = lineB.start;
    const endB: Vector2D = lineB.end;

    const lengthA: number = lineA.length;
    const lengthB: number = lineB.length;

    if (
      lineA.isPointOnLine(startB) ||
      lineB.isPointOnLine(startA) ||
      !Line2D.isParallel(lineA, lineB) ||
      MathTool.numberLess(lengthA, tolLen, 0.1) ||
      MathTool.numberLess(lengthB, tolLen, 0.1)
    ) {
      return bResult;
    }

    const startAProjLineB: Vector2D = lineB.getProjection(startA);

    // exclude parallel distance  dist < 10  or dist > 100
    const paraDist: number = Vector2D.distance(startA, startAProjLineB);
    if (paraDist < tolDist * 0.1 || paraDist > tolDist) {
      return bResult;
    }

    // check cross.
    const startAProjToStartB: number = Vector2D.distance(
      startAProjLineB,
      startB
    );
    const startAProjToEndB: number = Vector2D.distance(startAProjLineB, endB);

    const endAProjLineB: Vector2D = lineB.getProjection(endA);
    const endAProjToStartB: number = Vector2D.distance(endAProjLineB, startA);
    const endAProjToEndB: number = Vector2D.distance(endAProjLineB, endB);

    const startBProjLineA: Vector2D = lineA.getProjection(startB);
    const startBProjToStartA: number = Vector2D.distance(
      startBProjLineA,
      startA
    );
    const startBProjToEndA: number = Vector2D.distance(startBProjLineA, endA);

    const endBProjLineA: Vector2D = lineA.getProjection(endB);
    const endBProjToStartA: number = Vector2D.distance(endBProjLineA, startA);
    const endBProjToEndA: number = Vector2D.distance(endBProjLineA, endA);

    if (
      (lineB.isPointOnSegment(startAProjLineB) &&
        (MathTool.numberGreater(startAProjToStartB, 5) ||
          MathTool.numberGreater(startAProjToEndB, 5))) ||
      (lineB.isPointOnSegment(endAProjLineB) &&
        (MathTool.numberGreater(endAProjToStartB, 5) ||
          MathTool.numberGreater(endAProjToEndB, 5))) ||
      (lineA.isPointOnSegment(startBProjLineA) &&
        (MathTool.numberGreater(startBProjToStartA, 5) ||
          MathTool.numberGreater(startBProjToEndA, 5))) ||
      (lineA.isPointOnSegment(endBProjLineA) &&
        (MathTool.numberGreater(endBProjToStartA, 5) ||
          MathTool.numberGreater(endBProjToEndA, 5)))
    ) {
      bResult = true;
    }

    return bResult;
  }

  public static isLineACrossLineB(
    lineA: Line2D,
    lineB: Line2D,
    tol = 0
  ): any[] {
    let bCross = false;
    let crossCenterPt: Vector2D;

    let ptOnLineBCount = 0;
    let ptOnLineB: Vector2D = new Vector2D();

    const startA: Vector2D = lineA.start;
    const startAOnLineB: boolean = lineB.isPointOnSegment(startA, true, 0.8);
    if (startAOnLineB) {
      ptOnLineBCount++;
      ptOnLineB = startA;
    }

    const endA: Vector2D = lineA.end;
    const endAOnLineB: boolean = lineB.isPointOnSegment(endA, true, 0.8);
    if (endAOnLineB) {
      ptOnLineBCount++;
      ptOnLineB = endA;
    }

    let ptOnLineACount = 0;
    let ptOnlineA: Vector2D = new Vector2D();
    const startB: Vector2D = lineB.start;
    const startBOnLineA: boolean = lineA.isPointOnSegment(startB, true, 0.8);
    if (startBOnLineA) {
      ptOnLineACount++;
      ptOnlineA = startB;
    }

    const endB: Vector2D = lineB.end;
    const endBOnLineA: boolean = lineA.isPointOnSegment(endB, true, 0.8);
    if (endBOnLineA) {
      ptOnLineACount++;
      ptOnlineA = endB;
    }

    // @ts-ignore
    if (
      ptOnLineACount === 1 &&
      ptOnLineBCount === 1 && // @ts-ignore
      !ptOnlineA.equals(ptOnLineB, 0.8) && // @ts-ignore
      Vector2D.distance(ptOnlineA, ptOnLineB) > tol
    ) {
      bCross = true;
      // @ts-ignore
      crossCenterPt = new Vector2D(
        (ptOnlineA.x + ptOnLineB.x) * 0.5,
        (ptOnlineA.y + ptOnLineB.y) * 0.5
      );
    }

    // @ts-ignore
    return [bCross, crossCenterPt];
  }

  /**
   * 判断两条线段是否共线
   * @param line1 线段①
   * @param line2 线段②
   * @param tol 阈值
   */
  public static calcCollineation(line1: Line2D, line2: Line2D, tol = 0.01) {
    const line1Dir = line1.getDirection();
    const line2Dir = line2.getDirection();
    if (line1Dir.x * line2Dir.y - line1Dir.y * line2Dir.x <= tol) {
      return true;
    }
    return false;
  }

  public static translationLine(l0: Line2D, offset: Vector2D) {
    return new Line2D(l0.start.addV(offset), l0.end.addV(offset));
  }

  public static exchangeVec(para: Line2D[]) {
    // @ts-ignore
    let tmp: Line2D = null;

    tmp = para[0];
    para[0] = para[1];
    para[1] = tmp;
  }

  // 注意：哪些点是线上的点，哪个点是测试点，不能搞混
  public static collinear(
    ptLine1: Vector2D,
    ptLine2: Vector2D,
    ptTest: Vector2D,
    tol = 0.00001
  ): boolean {
    // return MathTool.numberEquals(ptTest.distanceToLine(new Line2D(ptLine1, ptLine2)), 0.0, tol);

    // 			var dir1:Vector2D = ptTest.subtract(ptLine1);
    // 			var dir2:Vector2D = ptTest.subtract(ptLine2);
    // 			var angle:number = MathTool.toDegrees(Math.abs(dir1.angleBetween(dir2)));
    // 			return MathTool.numberEquals(angle, 0.0, tol) ||
    // 				MathTool.numberEquals(angle, 180, tol);

    // 			return new Line2D(ptLine1, ptLine2).isVector2DOnLine(ptTest, tol);

    const line: Line2D = new Line2D(ptLine1, ptLine2);
    const ptFoot: Vector2D = line.footPoint(line, ptTest);
    return ptFoot.distance(ptTest) <= tol;
  }

  public static Compute_Golden_Proportion(
    startPt: Vector2D,
    endPt: Vector2D
  ): Vector2D[] {
    const newline2d: Line2D = new Line2D(startPt, endPt);
    // var Golden_Proportion: number = 0.618;
    const TargetLength: number = Vector2D.GOLDEN_PROPORTION * newline2d.length;
    const LinelCenter: Vector2D = newline2d.center;
    // let Results: Vector2D[];
    const Results: Vector2D[] = [];

    if (MathTool.isZeroNumber(startPt.x - endPt.x)) {
      Results.push(new Vector2D(LinelCenter.x - TargetLength, LinelCenter.y));
      Results.push(new Vector2D(LinelCenter.x + TargetLength, LinelCenter.y));
    } else if (MathTool.isZeroNumber(startPt.y - endPt.y)) {
      Results.push(new Vector2D(LinelCenter.x, LinelCenter.y - TargetLength));
      Results.push(new Vector2D(LinelCenter.x, LinelCenter.y + TargetLength));
    } else {
      const verticalwallslope: number =
        -(startPt.x - endPt.x) / (startPt.y - endPt.y);
      const XStep: number =
        TargetLength / Math.sqrt(verticalwallslope * verticalwallslope + 1);
      Results[0] = new Vector2D(
        LinelCenter.x - XStep,
        LinelCenter.y - XStep * verticalwallslope
      );
      Results[1] = new Vector2D(
        LinelCenter.x + XStep,
        LinelCenter.y + XStep * verticalwallslope
      );
    }
    return Results;
  }

  public getLeftLine(halfWidth: number): Line2D {
    if (this.distance === 0) {
      throw new Error("why?");
    } // 这个墙的起点和终点在一起
    const normalize: Vector2D = this.leftNormal.divideNumber(this.distance);
    return new Line2D(
      this._start.add(normalize.multiply(halfWidth)),
      this._end.add(normalize.multiply(halfWidth))
    );
  }

  public getRightLine(halfWidth: number): Line2D {
    if (this.distance === 0) {
      throw new Error("why?");
    } // 这个墙的起点和终点在一起
    const normalize: Vector2D = this.rightNormal.divideNumber(this.distance);
    return new Line2D(
      this._start.add(normalize.multiply(halfWidth)),
      this._end.add(normalize.multiply(halfWidth))
    );
  }

  // endregion

  // 是否竖直
  public isVertical(tolDegrees = 1): boolean {
    if (!this.normalize) {
      return false;
    }
    return (
      this.start.equalsX(this.end, 1e-1) ||
      Math.abs(MathTool.toDegrees(this.angle) - 90) < tolDegrees ||
      Math.abs(Math.abs(MathTool.toDegrees(this.angle) - 90) - 180) < tolDegrees
    );
  }

  // 		是否水平
  public isHorizontal(tolDegrees = 1): boolean {
    if (!this.normalize) {
      return false;
    }
    return (
      this.start.equalsY(this.end, 1e-1) ||
      MathTool.toDegrees(this.angle) < tolDegrees ||
      Math.abs(MathTool.toDegrees(this.angle) - 180) < tolDegrees
    );
  }

  public clone(): Line2D {
    return new Line2D(this._start, this._end);
  }

  /**
   * 点在直线上
   */
  public isPointOnLine(vec: Vector2D, tol = 1e-3): boolean {
    const vec3: Vector2D = this.start.subtract(vec);
    const _loc3: Vector2D = this.end.subtract(vec);
    return Line2D.isZeroNumber(vec3.crossProduct(_loc3), tol);
  }

  /**
   * 是否超出直线
   * @returns {boolean}
   */
  public isOutLine(vec: Vector2D): boolean {
    if (MathTool.isZeroNumber(this.length)) {
      return true;
    }
    const len2: number =
      vec.subtract(this.start).dotProduct(this.end.subtract(this.start)) /
      this.lengthSquared;
    if (len2 < 0 || len2 > 1) {
      return true;
    }
    return false;
  }

  public isRight(vec: Vector2D) {
    // if (this.isOutLine(vec)) {
    //   return null;
    // }

    const vec3: Vector2D = this.start.clone().sub(vec);
    const loc3: Vector2D = this.end.clone().subtract(vec);

    return vec3.crossProduct(loc3) > 0;
  }

  /* the new one support when beTrueOnEndpoints is fasle, the old one can not.  */
  public isPointOnSegmentNew(
    vec: Vector2D,
    beTrueOnEndpoints = true,
    nummin = 1e-3
  ): boolean {
    const len: number =
      Vector2D.distance(vec, this.start) + Vector2D.distance(vec, this.end);

    if (Math.abs(len - this.length) <= nummin) {
      return (
        beTrueOnEndpoints ||
        (Vector2D.distance(vec, this.start) > nummin &&
          Vector2D.distance(vec, this.end) > nummin)
      );
    }
    return false;
  }

  public isPointOnSegment(
    vec: Vector2D,
    beTrueOnEndpoints = true,
    nummin = 1e-3
  ): boolean {
    const len: number =
      Vector2D.distance(vec, this.start) + Vector2D.distance(vec, this.end);

    if (Math.abs(len - this.length) <= nummin) {
      return (
        beTrueOnEndpoints ||
        Math.abs(this._start.x - vec.x) > nummin ||
        Math.abs(this._start.y - vec.y) > nummin ||
        Math.abs(this._end.x - vec.x) > nummin ||
        Math.abs(this._end.y - vec.y) > nummin
      );
    }
    return false;
  }

  // 根据叉乘结果，来判断是在左边还是右边，WebGL是右手坐标系，叉乘是右手法则，所以 1 表示左边，-1表示右边，0表示在线上
  public getPointSide(vec: Vector2D): number {
    const vec2: number = Vector2D.xmultiply(this._start, this._end, vec);
    if (vec2 > 0) {
      return 1;
    }
    if (vec2 < 0) {
      return -1;
    }
    return 0;
  }

  public getProjection(vec: Vector2D, beTRUE = false): Vector2D {
    if (MathTool.isZeroNumber(this.length)) {
      // @ts-ignore
      return null;
    }

    const len3: number =
      vec.subtract(this._start).dotProduct(this._end.subtract(this._start)) /
      this.lengthSquared;
    if (beTRUE && (len3 < 0 || len3 > 1)) {
      // @ts-ignore
      return null;
    }

    return this._end
      .subtract(this._start)
      .multiplyBy(len3)
      .incrementBy(this._start);
  }

  public reverse(): Line2D {
    const tmpend: Vector2D = this._end;
    this._end = this._start;
    this._start = tmpend;
    return this;
  }

  public contains(line: Line2D, num = 1e-3): boolean {
    if (line.lengthSquared > this.lengthSquared) {
      return false;
    }
    return (
      this.isPointOnSegment(line.start, true, num) &&
      this.isPointOnSegment(line.end, true, num)
    );
  }

  public contains_new(line: Line2D, num = 0.1): boolean {
    if (
      line.lengthSquared > this.lengthSquared ||
      !Line2D.isParallel(this, line)
    ) {
      return false;
    }
    return (
      this.isPointOnSegment(line.start, false, num) &&
      this.isPointOnSegment(line.end, false, num)
    );
  }

  public translate(vec: Vector2D): Line2D {
    return new Line2D(
      Vector2D.add(this._start, vec),
      Vector2D.add(this._end, vec)
    );
  }

  public translateBy(vec: Vector2D): Line2D {
    this.start = Vector2D.add(this._start, vec);
    this.end = Vector2D.add(this._end, vec);
    return this;
  }

  public translateRight(num: number): Line2D {
    return this.translate(this.rightNormal.normalize().multiplyBy(num));
  }

  public translateLeft(num: number): Line2D {
    return this.translate(this.leftNormal.normalize().multiplyBy(num));
  }

  // 新加的Line2D方法，from flash;
  public translatePrepToPoint(vec: Vector2D): Line2D {
    return this.translate(
      this.getRightNormal().normalize().multiplyBy(this.getSignedDistance(vec))
    );
  }

  /**
   * @Description: region 新加的Line2D方法，from flash;点到line的距离
   * @param
   * @data 2019/12/25
   */
  public getSignedDistance(vec: Vector2D): number {
    return vec
      .subtract(this._start)
      .dotProduct(this.getRightNormal().normalize());
  }

  public getY(num: number): number {
    if (this.start.x === this.end.x) {
      return (this.start.y - this.end.y) / 2;
    }
    return (
      ((num - this.end.x) / (this.start.x - this.end.x)) *
        (this.start.y - this.end.y) +
      this.end.y
    );
  }

  public getX(num: number): number {
    if (this.start.y === this.end.y) {
      return (this.start.x - this.end.x) / 2;
    }
    return (
      ((num - this.end.y) / (this.start.y - this.end.y)) *
        (this.start.x - this.end.x) +
      this.end.x
    );
  }

  /**
   * 线段是否相交(点是否在线上)
   * @param line1
   * @param line2
   * @param tolParallel
   */
  // 判断是否两线段有交点
  public isIntersection(line1: Line2D, tol = 0.0001): boolean {
    const dis: number = Line2D.distanceToSegment(
      this._start.x,
      this._start.y,
      this._end.x,
      this._end.y,
      line1.start.x,
      line1.start.y,
      line1.end.x,
      line1.end.y
    );
    return MathTool.numberEquals(dis, 0.0, tol);
  }

  // 单位向量
  public getDirectionUnit(): Vector2D {
    return new Vector2D(
      this.direction.x / this.length,
      this.direction.y / this.length
    );
  }

  /**
   * 延长缩短线长
   * @param {number} length
   * @param {Vector2D} fixedPoint
   * @returns {this}
   */
  public setLength(length: number, fixedPoint: Vector2D = this.center) {
    const center = fixedPoint;

    const start = center.add(
      this.start
        .subtract(center)
        .normalize()
        .setLength((this.start.distance(fixedPoint) * length) / this.length)
    );
    const end = center.add(
      this.end
        .subtract(center)
        .normalize()
        .setLength((this.end.distance(fixedPoint) * length) / this.length)
    );

    this.start.copy(start);
    this.end.copy(end);

    return this;
  }

  public copy(line: Line2D) {
    this.start.copy(line.start);
    this.end.copy(line.end);
  }

  public getNearestPoint(vec: Vector2D): Vector2D {
    if (Line2D.isZeroNumber(this.length)) {
      return this.start.clone();
    }

    const len2: number =
      vec.subtract(this.start).dotProduct(this.end.subtract(this.start)) /
      this.lengthSquared;
    if (len2 < 0) {
      return this.start.clone();
    }

    if (len2 > 1) {
      return this.end.clone();
    }
    return this.end
      .subtract(this.start)
      .multiplyBy(len2)
      .incrementBy(this.start);
  }

  /**
   * 求投影到直线距离
   * @param vec
   */
  public getProjectLength(vec: Vector2D): number {
    if (Line2D.isZeroNumber(this.length)) {
      return Number.MAX_VALUE;
    }
    let dir1 = vec.subtract(this.start);
    let dir2 = this.end.subtract(this.start);
    const len: number = dir1.length();
    dir1 = dir1.normalize();
    dir2 = dir2.normalize();
    return dir1.dotProduct(dir2) * len;
  }

  public getDistance(vec: Vector2D, beTRUE = false): number {
    if (Line2D.isZeroNumber(this.length)) {
      return Vector2D.distance(vec, this.start);
    }

    const _loc3: number =
      Vector2D.dotProduct(
        Vector2D.subtract(vec, this.start),
        Vector2D.subtract(this.end, this.start)
      ) / this.lengthSquared;
    if (_loc3 < 0 && beTRUE) {
      return Vector2D.distance(vec, this.start);
    }

    if (_loc3 > 1 && beTRUE) {
      return Vector2D.distance(vec, this.end);
    }

    const _loc4: Vector2D = Vector2D.subtract(this.end, this.start)
      .multiplyBy(_loc3)
      .incrementBy(this.start);
    return vec.distance(_loc4);
  }

  public interpolate(num = 0.5): Vector2D {
    return Vector2D.interpolate(this.start, this.end, num);
  }

  public getLeftNormal(): Vector2D {
    return new Vector2D(this.end.y - this.start.y, this.start.x - this.end.x);
  }

  // 取垂直向量
  public getRightNormal(): Vector2D {
    return new Vector2D(this.start.y - this.end.y, this.end.x - this.start.x);
  }

  // public static intersectLine(line1: Line2D, line2: Line2D, tol: number = 0.01):Vector2D {
  //   let v = new Vector2D();
  //   if(this.calcCollineation(line1,line2)) {}
  // }

  // ptRef - 参考点
  public getPerpDirection(ptRef: Vector2D): Vector2D {
    const vecRet = new Vector2D(0, 0);
    if (this.isPointOnLine(ptRef)) {
      return vecRet;
    }

    const ptFoot: Vector2D = this.footPoint(this, ptRef);
    return Vector2D.subtract(ptRef, ptFoot);
  }

  public equalsWithoutDirection(line: Line2D, tol = 1e-3): boolean {
    return (
      (this.start.equals(line.start, tol) && this.end.equals(line.end, tol)) ||
      (this.start.equals(line.end, tol) && this.end.equals(line.start, tol))
    );
  }

  public equalsDirection(line: Line2D, tol = 1e-3): boolean {
    const dir1: Vector2D = this.getDirectionUnit();
    const dir2: Vector2D = line.getDirectionUnit();
    return dir1.equals(dir2, tol);
  }

  public sameSide(vec1: Vector2D, vec2: Vector2D): number {
    return (
      Vector2D.xmultiply(this.start, this.end, vec1) *
      Vector2D.xmultiply(this.start, this.end, vec2)
    );
  }

  public getOthorPoint(point: Vector2D) {
    if (point === this.start) {
      return this.end;
    } else if (point === this.end) {
      return this.start;
    }

    return null;
  }

  public getDirection(): Vector2D {
    return this._end.subtract(this._start);
  }

  // 以start为起点的的延长线与另一条线的交点，如果平行就取end点
  public intersectionLineAndLine(line: Line2D, extendRate = 5): Vector2D {
    if (Line2D.isParallel(this, line)) {
      return this.start;
    }
    if (!line) {
      return this.start;
    }
    return Line2D.getIntersection(this, line);
  }

  /**
   * 获取线与线之间的最小距离
   * @param line
   * @returns {any}
   * @param returnNumber
   */
  public distanceToLine(line: Line2D, returnNumber = true): Vector2D | number {
    const getMinVector = (selfLine: Line2D, targetLine: Line2D): Vector2D => {
      const points = [targetLine.start, targetLine.end];
      const inPoints = points.filter(
        (linePoint) => !selfLine.isOutLine(linePoint)
      );
      if (inPoints.length) {
        const minPoint = minBy(inPoints, (point) =>
          selfLine.getDistance(point)
        );

        // @ts-ignore
        return this.footPoint(selfLine, minPoint).subtract(minPoint);
      } else {
        // 两个端点的最小距离
        const center = selfLine.center;
        const minPoint = minBy(points, (point) => center.distance(point));
        const thisMinPoint = minBy([selfLine.start, selfLine.end], (_point) =>
          _point.distance(minPoint)
        );

        // @ts-ignore
        return thisMinPoint.subtract(minPoint);
      }
    };

    const thisMinVector = getMinVector(this, line);
    const targetMinVector = getMinVector(line, this).getReverse();

    const resultVector = minBy([thisMinVector, targetMinVector], (vector) =>
      vector.length()
    );

    // @ts-ignore
    return returnNumber ? resultVector.length() : resultVector;
  }

  /**
   * @Description: 前提是两条线平行 是否共线
   * @param distance 两条线的距离
   * @data 2019/12/25
   * @param l1
   * @return {any}
   */
  public isCollinearForDistance(l1: Line2D, distance = 10) {
    if (!Line2D.isParallel(this, l1)) {
      // console.error('线段未平行');
      return null;
    }
    const newL = new Line2D(Vector2D.zero, this.start.subtract(l1.start));
    const lineDistance = Math.abs(
      newL.direction.dotProduct(this.getRightNormal().normalizeNo())
    );
    if (lineDistance < distance) {
      return true;
    }
    return false;
  }

  /**
   * @Description: 平行线的距离
   * @param
   * @data 2019/12/25
   */
  public lineToLineDistance(l1: Line2D): number {
    if (!Line2D.isParallel(this, l1)) {
      throw new Error("why");
    }
    const newV = l1.start.subtract(this.start);
    return Math.abs(newV.dotProduct(this.getRightNormal().normalizeNo()));
  }

  /**
   * @Description: 点或者投影是否在线上,包括端点
   * @author
   * @data 2019/12/25
   */
  public isInLine(v: Vector2D): boolean {
    const newL = v.subtract(this.start);
    const pV = this.direction.normalizeNo().dotProduct(newL);
    if (
      MathTool.numberGreaterEqual(pV, 0) &&
      MathTool.numberLessEqual(pV, this.distance)
    ) {
      return true;
    }
    return false;
  }

  // 线与线是否有重合区域

  /**
   * @Description: 点或者投影是否在线上,不包括端点NotEndPoint
   * @author
   * @data 2019/12/25
   */
  public isInLineNotEndPoint(v: Vector2D): boolean {
    const newL = v.subtract(this.start);
    const pV = this.direction.normalizeNo().dotProduct(newL);
    if (
      MathTool.numberGreater(pV, 0) &&
      MathTool.numberLess(pV, this.distance)
    ) {
      return true;
    }
    return false;
  }

  // 点在端点上
  public isInLineEndPoint(v: Vector2D): boolean {
    const newL = v.subtract(this.start);
    const pV = this.direction.normalizeNo().dotProduct(newL);
    if (
      MathTool.numberEquals(pV, 0) ||
      MathTool.numberEquals(pV, this.distance)
    ) {
      return true;
    }
    return false;
  }

  /**
   * @Description: 点在线上，不包括端点
   * @param
   * @data 2019/12/25
   */
  public isInsideLine(v: Vector2D, accuracy = 1e-3): boolean {
    const newL = v.subtract(this.start);
    const pV = this.direction.normalizeNo().dotProduct(newL.normalizeNo());
    const startToDropPoint =
      this.direction.dotProduct(newL) / this.lengthSquared;
    const dropPoint = this.direction
      .multiplyByNo(startToDropPoint)
      .addV(this.start);
    const pointDistanceLine = v.distanceSquared(dropPoint);
    const d1 = newL.getDistanceSquareVector2D;
    const d2 = this.direction.getDistanceSquareVector2D;
    if (
      MathTool.numberEquals(pV, 1, accuracy) &&
      MathTool.numberLess(d1, d2) &&
      MathTool.numberEquals(pointDistanceLine, 0, accuracy * accuracy)
    ) {
      return true;
    }
    return false;
  }

  /**
   * @Description: 点在线上，包括端点
   * @param
   * @data 2019/12/25
   */
  public isInsideLinePoint(v: Vector2D): boolean {
    const newL = v.subtract(this.start);
    const d1 = newL.getDistanceSquareVector2D;
    if (MathTool.isZeroNumber(d1)) {
      return true;
    }
    const pV = this.direction.normalizeNo().dotProduct(newL.normalizeNo());
    const d2 = this.direction.getDistanceSquareVector2D;
    if (
      MathTool.numberEquals(pV, 1, 0.01) &&
      MathTool.numberLessEqual(d1, d2)
    ) {
      return true;
    }
    return false;
  }

  /**
   * @Description: 点在直线上
   * @author
   * @data 2019/12/25
   */
  public isInsideLinePointNoSegment(v: Vector2D): boolean {
    const newL = v.subtract(this.start);
    const d1 = newL.getDistanceSquareVector2D;
    if (MathTool.isZeroNumber(d1)) {
      return true;
    }
    const pV = this.direction.normalizeNo().dotProduct(newL.normalizeNo());
    if (MathTool.numberEquals(pV, 1) || MathTool.numberEquals(pV, -1)) {
      return true;
    }
    return false;
  }

  /* @Description: 主要是平行线之间是否有重合区域
   * @author
   * @data 2019/12/25
   */
  public lineIntersectLine(l1: Line2D): boolean {
    if (
      this.isInLineNotEndPoint(l1.start) ||
      this.isInLineNotEndPoint(l1.end)
    ) {
      return true;
    }
    if (
      l1.isInLineNotEndPoint(this.start) ||
      l1.isInLineNotEndPoint(this.end)
    ) {
      return true;
    }
    const midP = this.start.addV(this.end).multiplyByNo(0.5);
    if (l1.isInLineNotEndPoint(midP)) {
      return true;
    }
    return false;
  }

  /**
   * @Description: 一条线属于另一条线
   * @param
   *  l1 > this
   * @data 2019/12/25
   */
  public lineInLine(l1: Line2D): boolean {
    if (
      l1 &&
      l1.isInsideLinePoint(this.start) &&
      l1.isInsideLinePoint(this.end)
    ) {
      return true;
    }
    return false;
  }

  /**
   * @Description: l0线段平移到与l1重合
   * @param
   * @data 2019/12/25
   */
  public lineToLine(l1: Line2D): Line2D {
    if (!Line2D.isParallel(this, l1)) {
      console.error("线段未平行");
      // @ts-ignore
      return null;
    }
    const lineN = this.getRightNormal().normalizeNo();
    const offset = lineN.multiplyByNo(
      lineN.dotProduct(l1.start.subtract(this.start))
    );
    return Line2D.translationLine(this, offset);
  }

  // @ts-ignore
  public droopingPoint(v): Vector2D {
    const droopPoint = v.subtract(this.start).projectionV(this.direction);
    return this.start.addV(droopPoint);
  }

  /**
   * @Description: 点到线的垂线
   * @param
   * @data 2019/12/25
   */
  public getDropPoint(v: Vector2D): Line2D {
    const droopPoint = v.subtract(this.start).projectionV(this.direction);
    return new Line2D(v, this.start.addV(droopPoint));
  }

  public getNewLineForDistance(dis: number): Line2D {
    const newdes = this.start.addV(
      this.direction.normalizeNo().multiplyByNo(dis)
    );
    return new Line2D(this.start, newdes);
  }

  /**
   * 获取该线段的矩阵
   * @param rotY 是否计算旋转
   * @returns {Matrix4}
   */
  public matrix(rotY = null): Matrix4 {
    const centerPosition = this.center;
    const position = new Vector3(centerPosition.x, 0, centerPosition.y);

    const angleY = rotY ? rotY : this.angle;
    // @ts-ignore
    const eulerTmp = new Euler(0, angleY, 0);
    const quaternionWithEuler = new Quaternion();
    quaternionWithEuler.setFromEuler(eulerTmp);

    const rotateMatrix = new Matrix4();
    rotateMatrix.compose(position, quaternionWithEuler, new Vector3(1, 1, 1));
    return rotateMatrix;
  }

  /**
   * 取反线段
   * @returns {Line2D}
   * * by lianbo.guo
   */
  public getInverse(): Line2D {
    return new Line2D(this.end, this.start);
  }

  /**
   * 返回共线线段的重合部分
   * @param compareLine
   * * by lianbo.guo
   */
  public getRegistration(compareLine: Line2D): Line2D {
    if (
      !(
        this.isCollinearForDistance(compareLine) &&
        this.lineIntersectLine(compareLine)
      )
    ) {
      // @ts-ignore
      return null;
    }

    const lines = [this, compareLine];

    return new Line2D(
      lines[0].isInsideLine(lines[1].start) ? lines[1].start : lines[0].start,
      lines[1].isInsideLine(lines[0].end) ? lines[0].end : lines[1].end
    );
  }

  /**
   * 返回共线线段的分割部分
   * @param compareLine
   * @param numMin
   * @return {any}
   */
  public getDifference(
    compareLine: Line2D | Line2D[],
    numMin = 1e-3
  ): Line2D[] {
    if (compareLine instanceof Line2D) {
      compareLine = [compareLine];
    }

    // if (compareLine.some(compare => !Line2D.lineIntersectLine(compare, this))) {
    //   return null;
    // }
    // if (compareLine.some(compare => compare.length >= this.length)) {
    //   return null;
    // }

    // 找出所有的点排列
    const allPoints = compareLine.reduce(
      (prev, next) => {
        const points = [next.start, next.end];

        return prev.concat(points);
      },
      [this.start]
    ) as Vector2D[];

    allPoints.push(this.end);
    const angleVect = this.end.subtract(this.start).angle();
    allPoints.sort((prev, next) => {
      // @ts-ignore
      const getNormal = (point) => {
        const vect = point.subtract(this.start);
        const isPlus = MathTool.numberEquals(angleVect, vect.angle()) ? 1 : -1;

        return vect.lengthSquared * isPlus;
      };
      // next.subtract(this.start).angle()
      return getNormal(next) - getNormal(prev);
    });

    let result = [];
    let nextPoint = null;
    for (let index = 0; index < allPoints.length; index++) {
      if (index % 2) {
        // @ts-ignore
        result.push(new Line2D(nextPoint, allPoints[index]));
      } else {
        nextPoint = allPoints[index];
      }
    }

    // 过滤超小的线段
    result = result.filter((line) => {
      return line.length > numMin && this.lineIntersectLine(line);
    });

    return result;
  }

  /**
   * 通过center确定线段
   * @param center
   */
  public setFromCenter(center: Vector2D) {
    const offset = center.subtract(this.center);
    this.start.sum(offset);
    this.end.sum(offset);

    return this;
  }

  /**
   * 是否共线
   * @param tarLine
   * @param dis
   * @return {boolean}
   */
  public isCollinear(tarLine: Line2D, dis = 1e-3): boolean {
    return (
      (this.isPointOnLine(tarLine.start, dis) &&
        this.isPointOnLine(tarLine.end, dis)) ||
      (tarLine.isPointOnLine(this.start, dis) &&
        tarLine.isPointOnLine(this.end, dis))
    );
  }

  /**
   * 是否重叠
   * @param line
   */
  public isOverlay(line: Line2D): boolean {
    if (!Line2D.isParallel(this, line)) {
      return false;
    }
    return this.isCollinear(line);
  }

  /**
   * 两线段是否重叠
   * .-------.
   *    .---------.    标准重叠 return true
   *
   *   .---------.
   *   .---------.   全部重叠 return true
   *
   * .--------..-------.  头尾相连不算重叠 return false
   *
   * .--------------------.
   *     .----------.        return true;
   *
   * @param line
   */
  public isSegmentOverlay(line: Line2D): boolean {
    if (!Line2D.isParallel(this, line)) {
      return false;
    }
    if (
      this.isPointOnSegmentNew(line.start, false) ||
      this.isPointOnSegmentNew(line.end, false)
    ) {
      return true;
    }
    if (this.start.equals(line.start) && this.end.equals(line.end)) {
      return true;
    }
    if (this.start.equals(line.end) && this.end.equals(line.start)) {
      return true;
    }
    if (
      line.isPointOnSegmentNew(this.start, false) ||
      line.isPointOnSegmentNew(this.end, false)
    ) {
      return true;
    }
    return false;
  }

  /**
   * 检测是否完全重叠
   * @param line
   */
  public isCompleteOverlap(line: Line2D): boolean {
    if (!Line2D.isParallel(this, line)) {
      return false;
    }
    if (this.start.equals(line.start) && this.end.equals(line.end)) {
      return true;
    }
    if (this.start.equals(line.end) && this.end.equals(line.start)) {
      return true;
    }
    return false;
  }

  /**
   * 比较细致计算重叠关系
   * @param line
   */
  public calcSegmentOverlap(line: Line2D): ESegOverlapType {
    if (!Line2D.isParallel(this, line)) {
      return ESegOverlapType.Nothing;
    }
    const thisSS = this.start.equals(line.start);
    const thisSE = this.start.equals(line.end);
    const thisES = this.end.equals(line.start);
    const thisEE = this.end.equals(line.end);

    if (thisSS && thisEE) {
      return ESegOverlapType.Complete;
    }

    if (thisSE && thisES) {
      return ESegOverlapType.Complete;
    }

    const thisStartOn = line.isPointOnSegmentNew(this.start, false);
    const thisEndOn = line.isPointOnSegmentNew(this.end, false);
    if (thisStartOn && thisEndOn) {
      return ESegOverlapType.OtherInclude;
    }
    if (thisStartOn !== thisEndOn) {
      return ESegOverlapType.Cross;
    }

    const lineStartOn = this.isPointOnSegmentNew(line.start, false);
    const lineEndOn = this.isPointOnSegmentNew(line.end, false);

    if (lineStartOn && lineEndOn) {
      return ESegOverlapType.IncludeOther;
    }
    if (lineStartOn !== lineEndOn) {
      return ESegOverlapType.Cross;
    }

    const thisLen = this.length;
    const lineLen = line.length;
    const lenTotal = thisLen + lineLen;

    const thisS2start = Vector2D.distance(this.start, line.start);
    const thisS2end = Vector2D.distance(this.start, line.end);

    const thisE2start = Vector2D.distance(this.end, line.start);
    const thisE2end = Vector2D.distance(this.end, line.end);
    const max = Math.max(
      Math.max(thisS2start, thisS2end),
      Math.max(thisE2start, thisE2end)
    );
    if (Math.abs(max - lenTotal) < 0.001) {
      return ESegOverlapType.Connect;
    }

    return ESegOverlapType.Split;
  }

  /**
   * 返回射线
   * @param length
   */
  public toRay(length = 2000): Line2D {
    return this.clone().setLength(length);
  }

  /**
   * 返回该线段的垂线
   * @param fixedPoint 旋转点
   * @param rightNormal
   * @returns {Line2D}
   */
  public perpendicularLine(fixedPoint?: Vector2D, rightNormal = true): Line2D {
    if (!fixedPoint) {
      fixedPoint = this.center;
    }
    const start = new Vector2D();
    const end = rightNormal ? this.rightNormal : this.leftNormal;
    const perpendicularLine = new Line2D(start, end);

    const offset = fixedPoint.subtract(start);

    perpendicularLine.translateBy(offset);

    perpendicularLine.setLength(this.length);

    return perpendicularLine;
  }

  /**
   * @Description: 找到离线最近的点
   * @param
   * @data 2019/12/25
   */
  public findClosestPoint(vecs: Vector2D[]): Vector2D {
    let minDis = Number.MAX_VALUE;
    let minV = null;
    for (const v of vecs) {
      const dis = Math.abs(this.getSignedDistance(v));
      if (MathTool.numberLess(dis, minDis)) {
        minDis = dis;
        minV = v;
      }
    }
    // @ts-ignore
    const index = vecs.indexOf(minV);
    if (index !== -1) {
      // @ts-ignore
      vecs[index] = null;
    }
    // @ts-ignore
    const newLine = this.getDropPoint(minV);

    return newLine.reverseDirection;
  }

  /**
   * @Description: 求点在线的范围内，且到点的距离
   * @param
   * @data 2019/12/25
   */
  public isInLineDistance(
    point: Vector2D,
    isSegment = true
  ): { distanceSquare: number; dropPoint: Vector2D } {
    if (MathTool.isZeroNumber(this.lengthSquared)) {
      // @ts-ignore
      return null;
    }
    const startToPoint = point.subtract(this.start);
    const dotProductResult =
      this.direction.dotProduct(startToPoint) / this.lengthSquared;
    if (isSegment) {
      if (
        MathTool.numberGreaterEqual(dotProductResult, 0) &&
        MathTool.numberLessEqual(dotProductResult, 1)
      ) {
        const dropPoint = this.direction
          .multiplyByNo(dotProductResult)
          .addV(this.start);
        return { distanceSquare: dropPoint.distanceSquared(point), dropPoint };
      }
    } else {
      const dropPoint = this.direction
        .multiplyByNo(dotProductResult)
        .addV(this.start);
      return { distanceSquare: dropPoint.distanceSquared(point), dropPoint };
    }

    // @ts-ignore
    return null;
  }

  /**
   * 判断点和直线的关系，在线上，左边 或右边
   *         Left
   * --------->---------
   *        Right
   * @param point
   */
  public checkPointWitchLineSide(
    point: Vector2D,
    precision = 1e-3
  ): EPointLineRelation {
    const area = MathHelper._calcArea([this.start, this.end, point]);
    if (Math.abs(area) < precision) {
      return EPointLineRelation.On;
    }
    if (area > 0) {
      return EPointLineRelation.Left;
    }
    return EPointLineRelation.Right;
  }

  /**
   * 获取中点
   */
  public getMidPoint(): Vector2D {
    return new Vector2D(
      0.5 * (this.start.x + this.end.x),
      0.5 * (this.start.y + this.end.y)
    );
  }

  public toArray(): number[][] {
    return [this.start.toArray(), this.end.toArray()];
  }

  public mergeSegement(line: Line2D): Line2D {
    if (!Line2D.isParallel(this, line)) {
      // @ts-ignore
      return null;
    }
    if (this.start.equals(line.start)) {
      return new Line2D(this.end, line.end);
    }
    if (this.start.equals(line.end)) {
      return new Line2D(this.end, line.start);
    }
    if (this.end.equals(line.start)) {
      return new Line2D(this.start, line.end);
    }
    if (this.end.equals(line.end)) {
      return new Line2D(this.start, line.start);
    }
    // @ts-ignore
    return null;
  }

  /**
   * 是否投影到起始点和端点之间的线段上，包括端点
   * @param point
   */
  public isProjectOn(point: Vector2D): boolean {
    if (point.equals(this.start) || point.equals(this.end)) {
      return true;
    }
    const dirS1 = point.subtract(this.start);
    const dirS2 = this.end.subtract(this.start);
    const dirE1 = point.subtract(this.end);
    const dirE2 = this.start.subtract(this.end);
    return (
      Vector2D.dotProduct(dirS1, dirS2) > 0 &&
      Vector2D.dotProduct(dirE1, dirE2) > 0
    );
  }

  /**
   * @Description: 线段旋转
   * @author
   * @data 2019/12/25
   */
  public rotateLine(rot: number): Line2D {
    const newEnd = Vector2D.rotateAroundPoint(this.end, -rot, this.start);
    return new Line2D(this.start, newEnd);
  }

  public scale(num: number): Line2D {
    return new Line2D(
      this.start.addV(this.reverseDirection.multiplyByNo(num)),
      this.end.addV(this.direction.multiplyByNo(num))
    );
  }

  /**
   * 从start开始，偏移距离，取出指定的点
   * @param value
   */
  public getPoint(value: number) {
    const dir = this.getDirectionUnit();
    return this.start.add(dir.multiplyBy(value));
  }

  // 找到此点到一条直线的垂足
  public footPoint(line: Line2D, v: Vector2D): Vector2D {
    let retVal: Vector2D = new Vector2D();

    const dx: number = line.start.x - line.end.x;
    const dy: number = line.start.y - line.end.y;
    if (Math.abs(dx) < 0.00000001 && Math.abs(dy) < 0.00000001) {
      retVal = line.start;
      return retVal;
    }

    let u: number =
      (v.x - line.start.x) * (line.start.x - line.end.x) +
      (v.y - line.start.y) * (line.start.y - line.end.y);
    u = u / (dx * dx + dy * dy);

    retVal.x = line.start.x + u * dx;
    retVal.y = line.start.y + u * dy;

    return retVal;
  }

  /**
   * @Description: 点到直线的矩离
   * @param
   * @data 2019/12/25
   */
  public distancePointToLine(line: Line2D, v: Vector2D): number {
    const ptFoot: Vector2D = this.footPoint(line, v);
    return v.distance(ptFoot);
  }
}
