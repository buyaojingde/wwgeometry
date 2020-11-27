/**
 * @author lianbo
 * @date 2020-10-13 14:41:15
 * @Description: 和Vector相关的工具，不适合直接在Vector中实现
 */
import Segment from "@/utils/Math/geometry/Segment";

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
  public static interpolate(vec1: any, vec2: any, num: number = 0.5): any {
    return {
      x: vec1.x + (vec2.x - vec1.x) * num,
      y: vec1.y + (vec2.y - vec1.y) * num,
    };
  }
}
