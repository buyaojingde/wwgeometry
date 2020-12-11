/**
 * @author lianbo
 * @date 2020-10-09 14:42:38
 * @Description: 表示一个向量
 */
export default class Vector3 {
  public static ZERO = new Vector3();
  public x: number;
  public y: number;
  public z: number;

  public constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  public dot(v: Vector3) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  public subtract(v: Vector3) {
    return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
  }

  public add(v: Vector3) {
    return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
  }

  public multiply(s: number) {
    return new Vector3(this.x * s, this.y * s, this.z * s);
  }

  public get length() {
    return Math.sqrt(this.dot(this));
  }
}
