import MathUtils from '../math/MathUtils';

/**
 * @author lianbo
 * @date 2020-10-13 14:41:15
 * @Description: 和Vector相关的工具，不适合直接在Vector中实现
 */

export default class GeometryTool {
  /**
   * @author lianbo
   * @date 2020-10-13 14:46:24
   * @Description: Vector3转换为Vector2，作用主要是去掉Y
   */
  public static vector3toVector2(v: any): any {
    return { x: v.x, y: v.z };
  }

  /**
   * @author lianbo
   * @date 2020-11-04 14:59:43
   * @Description: 当前坐标相对于设定的标的坐标
   */
  public static relativeCoordinates(v: any, subjectV: any): any {
    return { x: v.x - subjectV.x, y: v.y - subjectV.y, z: v.z - subjectV.z };
  }

  /**
   * @author lianbo
   * @date 2020-11-04 15:27:15
   * @Description: 对应Revit的z轴表示高度
   */
  public static vector3toVector2Revit(v: any): any {
    return { x: v.x, y: v.y };
  }

  /**
   * @author lianbo
   * @date 2020-11-12 20:00:53
   * @Description: 两个点之间去插值
   */
  public static interpolate(vec1: any, vec2: any, num = 0.5): any {
    return {
      x: vec1.x + (vec2.x - vec1.x) * num,
      y: vec1.y + (vec2.y - vec1.y) * num,
    };
  }

  /**
   * @author lianbo
   * @date 2020-12-03 19:29:33
   * @Description: 平面的法向量
   */
  public static normal(vertices: any[]): any {
    if (vertices.length < 3) return false;
    const v0 = GeometryTool.subtract(vertices[1], vertices[0]);
    const v1 = GeometryTool.subtract(vertices[2], vertices[0]);
    const result = GeometryTool.cross(v0, v1);
    return result;
  }

  public static subtract(v: any, v1: any) {
    return { x: v.x - v1.x, y: v.y - v1.y, z: v.z - v1.z };
  }

  public static cross(v0: any, v1: any) {
    const var3 = v0.y * v1.z - v0.z * v1.y;
    const var5 = v1.x * v0.z - v1.z * v0.x;
    const result: any = {
      x: undefined,
      y: undefined,
      z: undefined,
    };
    result.z = v0.x * v1.y - v0.y * v1.x;
    result.x = var3;
    result.y = var5;
    return result;
  }

  public static dot(v0: any, var1: any) {
    return v0.x * var1.x + v0.y * var1.y + v0.z * var1.z;
  }

  /**
   * @author lianbo
   * @date 2020-12-03 19:45:47
   * @Description: X -> x,Y -> y,Z -> z
   */
  public static convert(v: any): any {
    return { x: v.X, y: v.Y, z: v.Z };
  }

  public static normalized(v: any): any {
    const length = 1 / Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    return { x: v.x * length, y: v.y * length, z: v.z * length };
  }

  /**
   * @author lianbo
   * @date 2020-12-08 11:19:34
   * @Description: p2 在以p0为起点，p1为方向的左边
   */
  public static isLeft(P0: any, P1: any, P2: any): boolean {
    return (P1.x - P0.x) * (P2.y - P0.y) - (P2.x - P0.x) * (P1.y - P0.y) > 0;
  }

  /**
   * @author lianbo
   * @date 2020-10-09 14:36:36
   * @Description:二维旋转
   */
  public static rotationTransform(from: any, alpha: number): any {
    const newX = from.x * Math.cos(alpha) - from.y * Math.sin(alpha);

    const newY = from.x * Math.sin(alpha) + from.y * Math.cos(alpha);
    return { x: newX, y: newY };
  }

  public static arc(p: any, p1: any): number {
    return Math.atan2(p1.y - p.y, p1.x - p.x);
  }

  /**
   * @author lianbo
   * @date 2020-12-08 11:19:34
   * @Description: p2 在以p0为起点，p1为方向的左边
   */
  public static isLeftSign(P0: any, P1: any, P2: any): number {
    return MathUtils.Sign(
      (P1.x - P0.x) * (P2.y - P0.y) - (P2.x - P0.x) * (P1.y - P0.y)
    );
  }

  /**
   * @author lianbo
   * @date 2020-12-11 09:02:39
   * @Description: p2 p3在以p0,p1为分割线的同侧(严格的，不包括在分割线上）
   */
  public static sameSide(p0: any, p1: any, p2: any, p3: any): boolean {
    const b2 = GeometryTool.isLeftSign(p1, p1, p2);
    const b3 = GeometryTool.isLeftSign(p1, p1, p3);
    return b2 * b3 > 0;
  }

  /**
   * @author lianbo
   * @date 2020-12-11 09:02:39
   * @Description: p2 p3在以p0,p1为分割线的同侧(不严格的，包括在分割线上）
   */
  public static sameSideSim(p0: any, p1: any, p2: any, p3: any): boolean {
    const b2 = GeometryTool.isLeftSign(p1, p1, p2);
    const b3 = GeometryTool.isLeftSign(p1, p1, p3);
    return b2 * b3 >= 0;
  }
}
