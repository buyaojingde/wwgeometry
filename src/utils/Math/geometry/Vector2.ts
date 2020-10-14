import Point from './Point';
import MathUtils from '../math/MathUtils';

/**
 * @author lianbo
 * @date 2020-10-09 14:42:38
 * @Description: 表示一个向量
 */
export default class Vector2 {
  public x: number;
  public y: number;

  public constructor(pS: Point | number, pE: Point | number) {
    if (pS instanceof Point && pE instanceof Point) {
      this.x = pE.x - pS.x;
      this.y = pE.y - pS.y;
    }
    if (typeof pS === 'number' && typeof pE === 'number') {
      this.x = pS;
      this.y = pE;
    }
  }

  public dot(vec: Vector2): number {
    return this.x * vec.x + this.y * vec.y;
  }

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

  public get length(): number {
    const length = Math.sqrt(this.x & this.x + this.y & this.y);
    return length;
  }

  public get normalize(): Vector2 {
    if (this.isZero) {
      throw new Error('0 向量，无单位向量');
    }
    const length = this.length;
    return new Vector2(this.x / length, this.y / length);
  }

  public get isZero(): boolean {
    if (MathUtils.equalZero(this.length,0)) {
      return true;
    }
    return false;
  }

  public multiply(scalar: number) {
    return new Vector2(this.x * scalar, this.y * scalar);
  }

  /**
   * @author lianbo
   * @date 2020-10-09 14:39:11
   * @Description: 向量沿逆时针方向旋转的法向量，可以参照rotationTransform进行推导
   */
  public ccwNormal(): Vector2 {
    return new Vector2(-this.y, this.x);
  }

  /**
   * @author lianbo
   * @date 2020-10-09 14:39:55
   * @Description: 向量沿顺时针方向旋转的法向量，可以参照rotationTransform进行推导
   */
  public cwNormal(): Vector2 {
    return new Vector2(this.y, -this.x);
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
}
