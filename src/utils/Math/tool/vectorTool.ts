/**
 * @author lianbo
 * @date 2020-10-13 14:41:15
 * @Description: 和Vector相关的工具，不适合直接在Vector中实现
 */
export default class VectorTool {
  /**
   * @author lianbo
   * @date 2020-10-13 14:46:24
   * @Description: Vector3转换为Vector2，作用主要是去掉Y
  */
  public static vector3toVector2(v: any): any {
    return { x: v.x, y: v.z };
  }
}
