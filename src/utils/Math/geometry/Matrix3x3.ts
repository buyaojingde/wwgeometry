import MathUtils from '../math/MathUtils';
import Point from './Point';

/**
 * @author lianbo
 * @date 2020-11-09 14:56:40
 * @Description: 2d下的矩阵变换
 *
 *      m00 m01 m02
 *      m10 m11 m12
 *      m20 m21 m22
 *
 */
export default class Matrix3x3 {
  public m00: number;
  public m01: number;
  public m02: number;
  public m10: number;
  public m11: number;
  public m12: number;
  public m20: number;
  public m21: number;
  public m22: number;

  public constructor() {
    this.m00 = 1;
    this.m01 = 0;
    this.m02 = 0;

    this.m10 = 0;
    this.m11 = 1;
    this.m12 = 0;

    this.m20 = 0;
    this.m21 = 0;
    this.m22 = 1;
  }

  /**
   * @author lianbo
   * @date 2020-11-19 09:45:40
   * @Description: 平移
   */
  public translate(x: number, y: number) {
    this.m02 = this.m02 + this.m00 * x + this.m01 * y;
    this.m12 = this.m12 + this.m10 * x + this.m11 * y;
  }

  /**
   * @author lianbo
   * @date 2020-11-19 09:45:32
   * @Description: 旋转
   */
  public rotate(alpha: number) {
    const cos = Math.cos(alpha);
    const sin = Math.sin(alpha);
    const rMat = new Matrix3x3();
    rMat.m00 = cos;
    rMat.m01 = -sin;
    rMat.m10 = sin;
    rMat.m11 = cos;
    this.multiply(rMat);
  }

  /**
   * @author lianbo
   * @date 2020-11-19 09:45:18
   * @Description: 缩放
   */
  public scale(sX: number, sY: number): Matrix3x3 {
    this.m00 = this.m00 * sX;
    this.m01 *= sY;
    this.m10 *= sX;
    this.m11 *= sY;
    return this;
  }

  /**
   * @author lianbo
   * @date 2020-11-19 09:44:56
   * @Description: 左乘向量
   */
  public apply(p: Point) {
    const x1 = this.m00 * p.x + this.m01 * p.y + this.m02;
    const y1 = this.m10 * p.x + this.m11 * p.y + this.m12;
    return new Point(x1, y1);
  }

  /**
   * @author lianbo
   * @date 2020-11-19 09:44:31
   * @Description: 矩阵左乘
   */
  public multiply(mat: Matrix3x3): Matrix3x3 {
    const m00 = this.m00 * mat.m00 + this.m01 * mat.m10 + this.m02 * mat.m20;
    const m01 = this.m00 * mat.m01 + this.m01 * mat.m11 + this.m02 * mat.m21;
    const m02 = this.m00 * mat.m02 + this.m01 * mat.m12 + this.m02 * mat.m22;

    const m10 = this.m10 * mat.m00 + this.m11 * mat.m10 + this.m12 * mat.m20;
    const m11 = this.m10 * mat.m01 + this.m11 * mat.m11 + this.m12 * mat.m21;
    const m12 = this.m10 * mat.m02 + this.m11 * mat.m12 + this.m12 * mat.m22;

    const m20 = this.m20 * mat.m00 + this.m21 * mat.m10 + this.m22 * mat.m20;
    const m21 = this.m20 * mat.m01 + this.m21 * mat.m11 + this.m22 * mat.m21;
    const m22 = this.m20 * mat.m02 + this.m21 * mat.m12 + this.m22 * mat.m22;

    this.m00 = m00;
    this.m01 = m01;
    this.m02 = m02;

    this.m10 = m10;
    this.m11 = m11;
    this.m12 = m12;

    this.m20 = m20;
    this.m21 = m21;
    this.m22 = m22;
    return this;
  }

  /**
   * @author lianbo
   * @date 2020-11-19 09:43:58
   * @Description: 解析出位置旋转缩放
   */
  public decompose(): any {
    // sort out rotation / skew..
    const a = this.m00;
    const b = this.m10;
    const c = this.m01;
    const d = this.m11;

    const skewX = -Math.atan2(-c, d);
    const skewY = Math.atan2(b, a);

    const delta = Math.abs(skewX + skewY);
    const transform: any = {};
    if (delta < 0.00001 || Math.abs(Math.PI * 2 - delta) < 0.00001) {
      transform.rotation = skewY;
      transform.skew.x = transform.skew.y = 0;
    } else {
      transform.rotation = 0;
      transform.skew.x = skewX;
      transform.skew.y = skewY;
    }

    // next set scale
    transform.scale.x = Math.sqrt(a * a + b * b);
    transform.scale.y = Math.sqrt(c * c + d * d);

    // next set position
    transform.position.x = this.m02;
    transform.position.y = this.m12;

    return transform;
  }

  /**
   * @author lianbo
   * @date 2020-11-09 15:52:35
   * @Description: 通过逆矩阵从局部坐标转世界坐标
   */
  public applyInverse(pos: Point) {
    const newPos = new Point();

    const id = 1 / (this.m00 * this.m11 + this.m01 * -this.m10);

    const x = pos.x;
    const y = pos.y;

    newPos.x =
      this.m11 * id * x + -this.m01 * id * y + (this.m12 * this.m01 - this.m02 * this.m11) * id;
    newPos.y =
      this.m00 * id * y + -this.m10 * id * x + (-this.m12 * this.m00 + this.m02 * this.m10) * id;

    return newPos;
  }
}
