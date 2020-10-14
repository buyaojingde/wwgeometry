import Vector3D from '../Geometry/Vector3D';
import { Vector3 } from 'three';
import Vector2D from '../Geometry/Vector2D';

export default class Vector3DTool {
  public static MAX_V3D: Vector3D = new Vector3D(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
  public static MIN_V3D: Vector3D = new Vector3D(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);

  constructor() {}

  public static swapYZ(vec: Vector3D): Vector3D {
    const _loc2: number = vec.y;
    vec.y = vec.z;
    vec.z = _loc2;
    return vec;
  }

  public static multiply(vec: Vector3D, num: number): Vector3D {
    const tmpvec: Vector3D = new Vector3D(0, 0, 0);
    tmpvec.x = vec.x * num;
    tmpvec.y = vec.y * num;
    tmpvec.z = vec.z * num;
    // tmpvec.w = vec.w
    return tmpvec;
  }

  public static multiplyBy(num: Vector3D, param2: number): Vector3D {
    num.x = num.x * param2;
    num.y = num.y * param2;
    num.z = num.z * param2;
    return num;
  }

  public static scale(vec1: Vector3D, vec2: Vector3D): Vector3D {
    const vec3: Vector3D = new Vector3D(0, 0, 0);
    vec3.x = vec1.x * vec2.x;
    vec3.y = vec1.y * vec2.y;
    vec3.z = vec1.z * vec2.z;
    // vec3.w = vec1.w
    return vec3;
  }

  public static add(vec1: Vector3D, vec2: Vector3D): Vector3D {
    const vec3: Vector3D = new Vector3D(0, 0, 0);
    vec3.x = vec1.x + vec2.x;
    vec3.y = vec1.y + vec2.y;
    vec3.z = vec1.z + vec2.z;
    return vec3;
  }

  public static dotProduct(vec1: Vector3D, vec2: Vector3D): number {
    // return vec1.dotProduct(vec2)
    const result = vec1.x * vec2.x + vec1.y * vec2.y + vec1.z * vec2.z;
    return result;
  }

  public static negate(vec: Vector3D): Vector3D {
    vec.x = vec.x * -1;
    vec.y = vec.y * -1;
    vec.z = vec.z * -1;
    return vec;
  }

  public static negateY(vec: Vector3D): Vector3D {
    vec.y = vec.y * -1;
    return vec;
  }

  public static multiplyAndNegateY(vec: Vector3D, num: number): Vector3D {
    if (!vec) {
      return null;
    }
    return Vector3DTool.negateY(Vector3DTool.multiply(vec, num));
  }

  public static angleBetween(vec1: Vector3D, vec2: Vector3D): number {
    return Math.acos(Vector3DTool.angleBetweenCos(vec1, vec2));
  }

  public static angleBetweenCos(vec1: Vector3D, vec2: Vector3D): number {
    const len: number = this.dotProduct(vec1, vec2) / (vec1.length() * vec2.length());

    if (len < -1) {
      return -1;
    }
    if (len > 1) {
      return 1;
    }
    return len;
  }

  public static max(vec1: Vector3D, vec2: Vector3D): Vector3D {
    return new Vector3D(Math.max(vec1.x, vec2.x), Math.max(vec1.y, vec2.y), Math.max(vec1.z, vec2.z));
  }

  public static min(vec1: Vector3D, vec2: Vector3D): Vector3D {
    return new Vector3D(Math.min(vec1.x, vec2.x), Math.min(vec1.y, vec2.y), Math.min(vec1.z, vec2.z));
  }

  public static normalize(vec: Vector3D, num: number = 1): Vector3D {
    let len: number = Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z);

    if (len !== 0 && len !== num) {
      len = num / len;
      vec.x = vec.x * len;
      vec.y = vec.y * len;
      vec.z = vec.z * len;
    }
    return vec;
  }

  public static subtract(vec1: Vector3D, vec2: Vector3D): Vector3D {
    const vec3: Vector3D = new Vector3D(0, 0, 0);
    vec3.x = vec1.x - vec2.x;
    vec3.y = vec1.y - vec2.y;
    vec3.z = vec1.z - vec2.z;
    return vec3;
  }

  public static crossProduct(vec1: Vector3D, vec2: Vector3D): Vector3D {
    // return vec1.crossProduct(vec2)
    const x = vec1.y * vec2.z - vec1.z * vec2.y;
    const y = vec1.z * vec2.x - vec1.x * vec2.z;
    const z = vec1.x * vec2.y - vec1.y * vec2.x;
    const vec3: Vector3D = new Vector3D(x, y, z);
    return vec3;
  }

  /**
   *
   * @param nums 转换世界坐标Y和Z的值
   */
  public static tanYZ(nums) {
    const newNum: number[] = [];
    for (let i = 0, iCount = nums.length / 3; i < iCount; i++) {
      newNum.push(nums[i * 3 + 0]);
      newNum.push(-nums[i * 3 + 2]);
      newNum.push(nums[i * 3 + 1]);
    }
    return newNum;
  }

  public static toVector2D(v:Vector3){
    return new Vector2D(v.x, v.z);
  }

  public static get up() {
    return new Vector3D(0, 1, 0);
  }

  public static get down() {
    return new Vector3D(0, -1, 0);
  }

  public static get zero() {
    return new Vector3D(0, 0, 0);
  }

  /**
   * @author lianbo
   * @date 2020-41-23 14:41:16
   * @Description: 向量与y轴的夹角
  */
  public static angleXZ(vec:Vector3):number{
    return Math.acos(vec.y / vec.length());
  }

  /**
   * @author lianbo
   * @date 2020-45-23 14:45:18
   * @Description: 在XZ平面上的投影的垂直向量
  */
  public static axisXZ(vec:Vector3):Vector3{
      const v2d = new Vector2D(vec.x,vec.z);
      const new2d = v2d.rotationTransform(Math.PI / 2);
      return new Vector3(new2d.x,0,new2d.y).normalize();
  }
}
