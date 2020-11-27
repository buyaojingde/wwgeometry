import MathUtils from "../math/MathUtils";

/**
 * @author lianbo
 * @date 2020-10-09 14:42:38
 * @Description: 表示一个向量
 */
export default class Vector2 {
  public static ZERO: Vector2 = new Vector2(0, 0);
  public x!: number;
  public y!: number;

  public constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  /**
   * @author lianbo
   * @date 2020-11-10 15:40:59
   * @Description: 向量的角度与X轴的夹角，范围在-π到π之间
   */
  public get slope(): number {
    return Math.atan2(this.y, this.x);
  }

  public get reverse(): Vector2 {
    return new Vector2(-this.x, -this.y);
  }

  public get length(): number {
    const length = Math.sqrt(this.x * this.x + this.y * this.y);
    return length;
  }

  public get normalize(): Vector2 {
    if (this.isZero) {
      throw new Error("0 向量，无单位向量");
    }
    const length = this.length;
    return new Vector2(this.x / length, this.y / length);
  }

  public get isZero(): boolean {
    if (MathUtils.equalZero(this.length, 0)) {
      return true;
    }
    return false;
  }

  /**
   * @author lianbo
   * @date 2020-10-09 14:39:11
   * @Description: 向量沿逆时针方向旋转的法向量，可以参照rotationTransform进行推导
   */
  public get ccwNormal(): Vector2 {
    return new Vector2(-this.y, this.x);
  }

  /**
   * @author lianbo
   * @date 2020-10-09 14:39:55
   * @Description: 向量沿顺时针方向旋转的法向量，可以参照rotationTransform进行推导
   */
  public get cwNormal(): Vector2 {
    return new Vector2(this.y, -this.x);
  }

  public copy(vec: Vector2): Vector2 {
    this.x = vec.x;
    this.y = vec.y;
    return this;
  }

  public set(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  public setX(n: number): void {
    this.x = n;
  }

  public setY(n: number): void {
    this.y = n;
  }

  public dot(vec: Vector2): number {
    return this.x * vec.x + this.y * vec.y;
  }

  /**
   * @author lianbo
   * @date 2020-11-20 10:56:18
   * @Description: 顺时针的角度为正，逆时针角度为负
   */
  public cross(vec: Vector2): number {
    return this.x * vec.y - this.y * vec.x;
  }

  public add(vec2: Vector2): Vector2 {
    return new Vector2(this.x + vec2.x, this.y + vec2.y);
  }

  public subtract(vec2: Vector2): Vector2 {
    return new Vector2(this.x - vec2.x, this.y - vec2.y);
  }

  public invert() {
    return new Vector2(-this.x, -this.y);
  }

  public normalized(): this {
    if (this.isZero) {
      throw new Error("0 向量，无单位向量");
    }
    const length = this.length;
    this.x = this.x / length;
    this.y = this.y / length;
    return this;
  }

  public multiply(scalar: number) {
    return new Vector2(this.x * scalar, this.y * scalar);
  }

  /**
   * @author lianbo
   * @date 2020-10-09 14:36:36
   * @Description:二维旋转
   */
  public rotationTransform(alpha: number): Vector2 {
    const newX = this.x * Math.cos(alpha) - this.y * Math.sin(alpha);

    const newY = this.x * Math.sin(alpha) + this.y * Math.cos(alpha);
    return new Vector2(newX, newY);
  }

  /**
   * @author lianbo
   * @date 2020-11-12 15:52:50
   * @Description: 与其他向量的夹角
   */
  angleTo(v: Vector2) {
    const norm1 = this.normalize;
    const norm2 = v.normalize;
    let angle = Math.atan2(norm1.cross(norm2), norm1.dot(norm2));
    if (angle < 0) angle += 2 * Math.PI;
    return angle;
  }

  /**
   * @author lianbo
   * @date 2020-11-12 15:55:47
   * @Description: 在v上的投影
   */
  projectionOn(v: Vector2) {
    const n = v.normalize;
    const d = this.dot(n);
    return n.multiply(d);
  }
}
