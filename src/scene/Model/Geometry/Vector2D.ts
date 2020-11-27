// import Vector2 from 'THREE'
import { Vector2, Vector3 } from 'three';
import MathTool from '../Util/MathTool';

// extends Vector2 {
export default class Vector2D extends Vector2 {
  public static X_AXIS: Vector2D = new Vector2D(1, 0);
  public static Y_AXIS: Vector2D = new Vector2D(0, 1);
  public static ORIGIN_V2D: Vector2D = new Vector2D(0, 0);
  public static MAX_V2D: Vector2D = new Vector2D(Number.MAX_VALUE, Number.MAX_VALUE);
  public static MIN_V2D: Vector2D = new Vector2D(-Number.MAX_VALUE, -Number.MAX_VALUE);
  public static VAL_NULL: Vector2D = new Vector2D(-Number.MAX_VALUE, Number.MAX_VALUE);
  public static GOLDEN_PROPORTION: number = 0.618;

  constructor(x: number = 0, y: number = 0) {
    super(x, y);
    this._x = x;
    this._y = y;
  }

  public toString(): string {
    return '(' + this._x + ',' + this._y + ')';
  }

  static get zero(): Vector2D {
    return new Vector2D();
  }

  static get one(): Vector2D {
    return new Vector2D(1, 1);
  }

  protected _x: number;

  protected _y: number;

  get debugCad(): string {
    return 'Circle ' + this.x + ',' + this.y + ' 5 ';
  }

  set debugCad(s: string) {
    // only for debug
  }

  public get getDistanceVector2D(): number {
    return Math.sqrt(Math.pow(this._x, 2) + Math.pow(this._y, 2));
  }

  // 获得垂直向量

  public get getDistanceSquareVector2D(): number {
    return Math.pow(this._x, 2) + Math.pow(this._y, 2);
  }

  get positive(): Vector2D {
    this._x = Math.abs(this._x);
    this._y = Math.abs(this._y);
    return this;
  }

  get getXYFlag(): Vector2D {
    return new Vector2D(
      this._x ? this._x / Math.abs(this._x) : 0,
      this._y ? this._y / Math.abs(this._y) : 0,
    );
  }

  get toVector2D(): Vector2D {
    return new Vector2D(this._x, this._y);
  }

  get lengthSquared(): number {
    return Math.pow(this._x, 2) + Math.pow(this._y, 2);
  }

  get isZero(): boolean {
    return this.x > -0.00001 && this.x < 0.00001 && this.y > -0.00001 && this.y < 0.00001;
  }

  // 长度和角度  求向量
  public static polar(num1: number, num2: number): Vector2D {
    return new Vector2D(num1 * Math.cos(num2), num1 * Math.sin(num2));
  }

  public static offset(vec: Vector2D, num1: number, num2: number): Vector2D {
    return vec.offset(num1, num2);
  }

  // 距离比较近的情况下使用这个
  public static distanceOptimization(vec: Vector2D, vec2: Vector2D): number {
    const x = Math.abs(vec.x - vec2.x);
    const y = Math.abs(vec.y - vec2.y);
    const max = x > y ? x : y;
    return max * 1.4;
  }

  public static distance(vec: Vector2D, vec2: Vector2D): number {
    return Math.sqrt(Math.pow(vec.x - vec2.x, 2) + Math.pow(vec.y - vec2.y, 2));
  }

  public static distanceSquared(vec1: Vector2D, vec2: Vector2D): number {
    return Math.pow(vec1.x - vec2.x, 2) + Math.pow(vec1.y - vec2.y, 2);
  }

  public static angleTo(vec1: Vector2D, vec2: Vector2D): number {
    return MathTool.roundAngle(Math.atan2(vec2.y - vec1.y, vec2.x - vec1.x));
  }

  public static add(vec1: Vector2D, vec2: Vector2D): Vector2D {
    return new Vector2D(vec1.x + vec2.x, vec1.y + vec2.y);
  }

  public static subtract(vec1: Vector2D, vec2: Vector2D): Vector2D {
    return new Vector2D(vec1.x - vec2.x, vec1.y - vec2.y);
  }

  public static dotProduct(vec1: Vector2D, vec2: Vector2D): number {
    return vec1.x * vec2.x + vec1.y * vec2.y;
  }

  public static crossProduct(vec1: Vector2D, vec2: Vector2D): number {
    return vec1.x * vec2.y - vec1.y * vec2.x;
  }

  public static xmultiply(vec1: Vector2D, vec2: Vector2D, vec3: Vector2D): number {
    return (vec3.x - vec1.x) * (vec2.y - vec1.y) - (vec2.x - vec1.x) * (vec3.y - vec1.y);
  }

  public static multiply(vec1: Vector2D, num: number): Vector2D {
    return new Vector2D(vec1.x * num, vec1.y * num);
  }

  public static interpolate(vec1: Vector2D, vec2: Vector2D, num: number = 0.5): Vector2D {
    return new Vector2D(vec1.x + (vec2.x - vec1.x) * num, vec1.y + (vec2.y - vec1.y) * num);
  }

  public static center(vec1: Vector2D, vec2: Vector2D): Vector2D {
    return new Vector2D((vec1.x + vec2.x) / 2, (vec1.y + vec2.y) / 2);
  }

  public static isParallel(vec1: Vector2D, vec2: Vector2D, tol: number = 1e-3): boolean {
    // var num:number = this.dotProduct(vec1, vec2) / vec1.length / vec2.length;
    // return num === 1 || num === -1;

    const angle: number = vec1.angleBetween(vec2);
    return MathTool.numberEquals(angle, 0.0, tol) || MathTool.numberEquals(angle, Math.PI, tol);
  }

  public static isOpposite(vec1: Vector2D, vec2: Vector2D): boolean {
    return this.dotProduct(vec1, vec2) / vec1.length() / vec2.length() === -1;
  }

  public static isNormalized(vec1: Vector2D): boolean {
    return vec1.setLength(1);
  }

  public static max(vec1: Vector2D, vec2: Vector2D): Vector2D {
    return new Vector2D(Math.max(vec1.x, vec2.x), Math.max(vec1.y, vec2.y));
  }

  public static min(vec1: Vector2D, vec2: Vector2D): Vector2D {
    return new Vector2D(Math.min(vec1.x, vec2.x), Math.min(vec1.y, vec2.y));
  }

  // @ts-ignore
  public static rotate(vec1: Vector2D, radian: number, vec2: Vector2D = null): Vector2D {
    return vec1.rotateBy(radian, vec2);
  }

  public static fromVector2D(point: Vector2D): Vector2D {
    return new Vector2D(point.x, point.y);
  }

  public static fromVector3D(vec3d: Vector3): Vector2D {
    return new Vector2D(vec3d.x, vec3d.y);
  }

  public static isConvex(vec1: Vector2D, vec2: Vector2D, vec3: Vector2D): boolean {
    return Vector2D.crossProduct(vec2.subtract(vec1), vec3.subtract(vec1)) > 0;
  }

  public static getPosFromSegment(vStart: Vector2D, vEnd: Vector2D, len: number): Vector2D {
    const res: Vector2D = this.polar(len, this.angleTo(vStart, vEnd));

    if (MathTool.isZeroNumber(res.x)) {
      res.x = 0;
    }
    if (MathTool.isZeroNumber(res.y)) {
      res.y = 0;
    }

    res.incrementBy(vStart);

    return res;
  }

  public static Lerp(Start: Vector2D, End: Vector2D, power: number): Vector2D {
    power = Math.min(Math.max(0.0, power), 1.0);
    return new Vector2D(
      Start.x * (1 - power) + End.x * power,
      Start.y * (1 - power) + End.y * power,
    );
  }

  public static divideBetweenPts(
    start: Vector2D,
    end: Vector2D,
    SubsectionNum: number,
  ): Vector2D[] {
    const subsectionPts: Vector2D[] = [];
    const LinePartNum: number = SubsectionNum + 1;
    const SubsectionPercent: number = 0.0 / LinePartNum;
    for (let i: number = 1; i < LinePartNum; i++) {
      subsectionPts[i - 1] = Vector2D.Lerp(start, end, i * SubsectionPercent);
    }
    return subsectionPts;
  }

  /**
   * 一个点绕另一个点旋转
   * @param sourceVec 操作点
   * @param angle  弧度
   * @param pos 中心点
   */
  public static rotateAroundPoint(sourceVec: Vector2D, angle: number, pos: Vector2D): Vector2D {
    const x1 =
      (sourceVec.x - pos.x) * Math.cos(angle) - (sourceVec.y - pos.y) * Math.sin(angle) + pos.x;
    const y1 =
      (sourceVec.x - pos.x) * Math.sin(angle) + (sourceVec.y - pos.y) * Math.cos(angle) + pos.y;

    return new Vector2D(x1, y1);
  }

  public static hadVector2D(points: Vector2D[], point: Vector2D): boolean {
    for (const tmpVector2D of points) {
      if (tmpVector2D.equals(point)) {
        return true;
      }
    }
    return false;
  }

  public static getMidPoint(vec1: Vector2D, vec2: Vector2D): Vector2D {
    return new Vector2D(0.5 * (vec1.x + vec2.x), 0.5 * (vec1.y + vec2.y));
  }

  public static vectorArray(numbers: any, n: number): Vector2D[] {
    const vecs: Vector2D[] = [];
    if (!numbers || numbers.length === 0 || numbers.length % n !== 0) {
      return vecs;
    }
    const len = numbers.length;
    const lineNum = len / n;
    for (let i = 0; i < lineNum; i++) {
      const temp = numbers.slice(i * n, i * n + n);
      const tmpVector2D = new Vector2D(temp[0], temp[1]);
      vecs.push(tmpVector2D);
    }
    return vecs;
  }

  /**
   * @Description: 最小矩形
   * @author
   * @data 2019/12/25
   */
  public static minRect(points: Vector2D[]) {
    const arrU: number[] = points.map(it => it.x);
    const arrV: number[] = points.map(it => it.y);
    const minX = Math.min(...arrU);
    const maxX = Math.max(...arrU);
    const minY = Math.min(...arrV);
    const maxY = Math.max(...arrV);
    return { minX, maxX, minY, maxY };
  }

  // public normalize(): Vector2D {
  //   let tmpnum: number = NaN;
  //   if (this.length()) {
  //     tmpnum = 1 / this.length();
  //     this._x = this._x * tmpnum;
  //     this._y = this._y * tmpnum;
  //   }

  //   super.normalize();

  //   return this;
  // }

  public zero() {
    this._x = 0;
    this._y = 0;
  }

  public copyTo(vec: Vector2D): Vector2D {
    vec.x = this._x;
    vec.y = this._y;
    return vec;
  }

  public copyFrom(vec: Vector2D): Vector2D {
    this._x = vec.x;
    this._y = vec.y;
    return this;
  }

  // @ts-ignore
  public rotate(radian: number, vec2: Vector2D = null): Vector2D {
    return this.clone().rotateBy(radian, vec2);
  }

  // @ts-ignore
  public prep(vec2: Vector2D = null): Vector2D {
    return this.clone().rotate(Math.PI / 2, vec2);
  }

  public incrementBy(vec: Vector2D): Vector2D {
    this._x = this._x + vec.x;
    this._y = this._y + vec.y;
    return this;
  }

  public decrementBy(vec: Vector2D): Vector2D {
    this._x = this._x - vec.x;
    this._y = this._y - vec.y;
    return this;
  }

  public scaleBy(vec: Vector2D): Vector2D {
    this._x = this._x * vec.x;
    this._y = this._y * vec.y;
    return this;
  }

  public divideBy(vec: Vector2D): Vector2D {
    if (!vec.x || !vec.y) {
      throw new Error('cannot divide zero');
    }

    this._x = this._x / vec.x;
    this._y = this._y / vec.y;
    return this;
  }

  public multiplyBy(bun: number): Vector2D {
    this._x = this._x * bun;
    this._y = this._y * bun;
    return this;
  }

  public multiplyByNo(bun: number): Vector2D {
    const v = new Vector2D();
    v.x = this._x * bun;
    v.y = this._y * bun;
    return v;
  }

  // @ts-ignore
  public rotateBy(radian: number, vec: Vector2D = null): Vector2D {
    if (!vec) {
      vec = new Vector2D();
    }

    const num5: number = Math.cos(radian);
    const num3: number = Math.sin(radian);
    const vec4: Vector2D = this.subtract(vec);
    this._x = this.subtract(vec).x * num5 - vec4.y * num3;
    this._y = vec4.x * num3 + vec4.y * num5;
    return this.incrementBy(vec);
  }

  public project(vec: Vector2D): Vector2D {
    const num: number = this.dotProduct(vec) / vec.lengthSquared;
    return this.copyFrom(vec).multiplyBy(num);
  }

  public reflect(vec: Vector2D): Vector2D {
    let num2: number = 2 * this.angleBetween(vec);
    if (vec.sign(this) > 0) {
      num2 = num2 * -1;
    }

    this.rotateBy(num2);
    return this;
  }

  public dotProduct(vec: Vector2D): number {
    return this._x * vec.x + this._y * vec.y;
  }

  public crossProduct(vec: Vector2D): number {
    return this._x * vec.y - this._y * vec.x;
  }

  public sign(vec: Vector2D): number {
    return this.getRightNormal().dotProduct(vec) < 0 ? -1 : 1;
  }

  public angleBetween(vec: Vector2D): number {
    return MathTool.roundAngle(Math.acos(this.angleBetweenCos(vec)));
  }

  public angleBetweenSin(vec: Vector2D): number {
    let nun2: number = this.crossProduct(vec) / (this.length() * vec.length());
    if (nun2 < -1) {
      nun2 = -1;
    }
    if (nun2 > 1) {
      nun2 = 1;
    }
    return nun2;
  }

  public angleBetweenCos(vec: Vector2D): number {
    let num2: number = this.dotProduct(vec) / (this.length() * vec.length());
    if (num2 < -1) {
      num2 = -1;
    }
    if (num2 > 1) {
      num2 = 1;
    }
    return num2;
  }

  public angleBetweenCCW(vec: Vector2D, tol: number = 1e-3): number {
    const ccw: number = this.crossProduct(vec);
    let ang: number = this.angleBetween(vec);

    if (!MathTool.isZeroNumber(ccw, tol) && ccw < 0) {
      ang = Math.PI * 2 - ang;
    }

    return ang;
  }

  /**
   * 向量与向量之间的距离
   * 如果只需要比较大小，请使用distanceSquared , 更优
   * @param vec
   * @returns {number}
   */
  public distance(vec: Vector2D = Vector2D.zero): number {
    return Math.sqrt(Math.pow(this._x - vec.x, 2) + Math.pow(this._y - vec.y, 2));
  }

  public distanceSquared(vec: Vector2D): number {
    return Math.pow(this._x - vec.x, 2) + Math.pow(this._y - vec.y, 2);
  }

  public distanceX(vec: Vector2D): number {
    return Math.abs(this.x - vec.x);
  }

  public distanceY(vec: Vector2D): number {
    return Math.abs(this.y - vec.y);
  }

  public getLeftNormal(): Vector2D {
    return new Vector2D(this._y, -this._x);
  }

  public getRightNormal(): Vector2D {
    return new Vector2D(-this._y, this._x);
  }

  public setTo(x: number = 0, y: number = 0): Vector2D {
    this._x = x;
    this._y = y;
    return this;
  }

  public offsetBy(num2: number, param2: number): Vector2D {
    this._x = this._x + num2;
    this._y = this._y + param2;
    return this;
  }

  public normals(vec: Vector2D): boolean {
    return this.dotProduct(vec) === 0;
  }

  public equalsX(vec: any, numMin: number = 1e-3): boolean {
    return Math.abs(this._x - vec.x) < numMin;
  }

  public equalsY(vec: any, numMin: number = 1e-3): boolean {
    return Math.abs(this._y - vec.y) < numMin;
  }

  public swap(vec: Vector2D): Vector2D {
    const tmpx: number = this._x;
    const tmpy: number = this._y;
    this._x = vec.x;
    this._y = vec.y;
    vec.x = tmpx;
    vec.y = tmpy;
    return this;
  }

  public swapXY(): Vector2D {
    const temp: number = this._x;
    this._x = this._y;
    this._y = temp;
    return this;
  }

  public negateY(): Vector2D {
    this._y = this._y * -1;
    return this;
  }

  public negateX(): Vector2D {
    this._x = this._x * -1;
    return this;
  }

  public offset(num1: number, num2: number): Vector2D {
    return this.add(Vector2D.polar(num1, num2));
  }

  public normalizeNo(): Vector2D {
    let tmpnum: number = NaN;
    const v = Vector2D.zero;
    if (this.length()) {
      tmpnum = 1 / this.length();
      v.x = this._x * tmpnum;
      v.y = this._y * tmpnum;
    }
    return v;
  }

  public toVector3D(num: number = 0): Vector3 {
    return new Vector3(this._x, this._y, num);
  }

  public setAngle(num: number) {
    let _loc2: number = 0;
    if (!isNaN(num)) {
      _loc2 = num;
    }

    const _loc3: number = Math.sqrt(Math.pow(this._x, 2) + Math.pow(this._y, 2));
    this._x = _loc3 * Math.cos(_loc2);
    this._y = _loc3 * Math.sin(_loc2);
  }

  public add(vec: any): any {
    return new Vector2D(this._x + vec.x, this._y + vec.y);
  }

  public angle(): number {
    const angle = MathTool.roundAngle(Math.atan2(this._y, this._x));
    return angle;
  }

  public clone(): any {
    return new Vector2D(this._x, this._y);
  }

  public divide(vec: any): any {
    if (!vec.x || !vec.y) {
      throw new Error('cannot divide zero');
    }
    return new Vector2D(this._x / vec.x, this._y / vec.y);
  }

  public equals(vec: any, nummin: number = 1e-3): boolean {
    return this.equalsX(vec, nummin) && this.equalsY(vec, nummin);
  }

  public length(): number {
    return Math.sqrt(Math.pow(this._x, 2) + Math.pow(this._y, 2));
  }

  public multiply(vec: any): any {
    return new Vector2D(this._x * vec, this._y * vec);
  }

  public negate(): any {
    this._x = this._x * -1;
    this._y = this._y * -1;
    return this;
  }

  public set(x: number, y?: number): this {
    if (y === undefined) {
      y = x;
    }

    if (Number.isNaN(x) || Number.isNaN(y)) {
      // @ts-ignore
      return;
    }

    return super.set(x, y);
  }

  public setLength(num: number): any {
    if (isNaN(num)) {
      this._y = 0;
      this._x = 0;
    }

    const sqrtRoot: number = Math.sqrt(Math.pow(this._x, 2) + Math.pow(this._y, 2));
    if (sqrtRoot > 0) {
      this.multiplyBy(num / sqrtRoot);
    } else {
      this._y = 0;
      this._x = num;
    }
    return this;
  }

  // @ts-ignore
  get x(): number {
    return this._x;
  }

  set x(num: number) {
    this._x = num;
    return;
  }

  // @ts-ignore
  get y(): number {
    return this._y;
  }

  set y(num: number) {
    this._y = num;
    return;
  }

  public addV(vec: Vector2D): Vector2D {
    return new Vector2D(this._x + vec.x, this._y + vec.y);
  }

  public sum(vec: Vector2D): Vector2D {
    return super.add(vec) as Vector2D;
  }

  public subtract(vec: Vector2D): Vector2D {
    return new Vector2D(this._x - vec.x, this._y - vec.y);
  }

  public scale(vec: Vector2D): Vector2D {
    return new Vector2D(this._x * vec.x, this._y * vec.y);
  }

  public divideNumber(n: number): Vector2D {
    if (!n) {
      throw new Error('cannot divide zero');
    }
    return new Vector2D(this._x / n, this._y / n);
  }

  // vec : 偏移向量
  public transformBy(vec: Vector2D): Vector2D {
    this._x = this._x + vec.x;
    this._y = this._y + vec.y;
    return this;
  }

  public transform(vec: Vector2D): Vector2D {
    const vecRet: Vector2D = this.clone();
    vecRet.transformBy(vec);
    return vecRet;
  }

  public transThreeJsVector2(): Vector2 {
    return new Vector2(this._x, this._y);
  }

  public transToVector3(hei: number = 0): Vector3 {
    return new Vector3(this._x, hei, this._y);
  }

  /**
   * 取背面
   * @returns {this}
   */
  public getReverse() {
    this.x = -this.x;
    this.y = -this.y;

    return this;
  }

  public subtractNormal(v: Vector2D): Vector2D {
    const n = this.normalizeNo();
    const d0 = v.dotProduct(n);
    const v0 = n.multiplyByNo(d0);
    const cha = this.subtract(v0);
    return cha;
  }

  // 在v上的投影向量
  public projectionV(v: Vector2D): Vector2D {
    const vN = v.normalizeNo();
    return vN.multiplyByNo(this.dotProduct(vN));
  }

  // 投影的逆运算
  public projectionReverseV(v: Vector2D): Vector2D {
    const thisN = this.normalizeNo();
    const vN = v.normalizeNo();
    const cos = thisN.dotProduct(vN);
    if (cos === 0) {
      return Vector2D.zero;
    }
    const hypotenuse = this.getDistanceVector2D / cos;
    return vN.multiplyByNo(hypotenuse);
  }

  /**
   * @author lianbo
   * @date 2020-51-23 14:51:16
   * @Description:二维旋转
   */
  public rotationTransform(alpha: number): Vector2D {
    const newX = this.x * Math.cos(alpha) - this.y * Math.sin(alpha);

    const newY = this.x * Math.sin(alpha) + this.y * Math.cos(alpha);
    return new Vector2D(newX, newY);
  }
}
