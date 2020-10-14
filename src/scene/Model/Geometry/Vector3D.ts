import { Vector3 } from 'three';
import Vector2D from './Vector2D';

class Vector3D extends Vector3 {
  protected _x: number;
  protected _y: number;
  protected _z: number;

  get x() {
    return this._x;
  }
  set x(val) {
    this._x = val;
  }

  get y() {
    return this._y;
  }
  set y(val) {
    this._y = val;
  }

  get z() {
    return this._z;
  }
  set z(val) {
    this._z = val;
  }

  get w() {
    return this._z;
  }

  set w(val) {
    this._z = val;
  }

  constructor(x?: number, y?: number, z?: number) {
    super(x, y, z);
  }

  public equals(vec: Vector3 | Vector3D, numMin = 1e-3): boolean {
    return Math.abs(this._x - vec.x) < numMin && Math.abs(this._y - vec.y) < numMin;
  }
  /**
   *去掉Ｙ分量，转成Vector2D
   */
  public transToVector2(): Vector2D {
    return new Vector2D(this.x, this.z);
  }

  public toVector2(): Vector2D {
    return new Vector2D(this.x, this.z);
  }
}

export default Vector3D;
