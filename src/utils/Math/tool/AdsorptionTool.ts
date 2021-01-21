/**
 * @author lianbo
 * @date 2020-10-20 17:07:35
 * @Description: 计算吸附的工具
 */
import MathUtils from '../math/MathUtils';

export class AdsorptionTool {
  /**
   * @Description: 点到点的吸附点
   * @fn: 计算距离的方法，因为类型不确定
   * @accuracy 精度
   * @date 2018/11/05 14:52:16
   */
  public static findAdsorptionPoint(
    p: any,
    vs: any[],
    fn: any,
    accuracy = 10
  ): any {
    const allowanceSquared = accuracy * accuracy;
    let min: number = Number.MAX_VALUE;
    let minPos: any = null;
    for (const v of vs) {
      const dis = fn(p, v);
      if (MathUtils.lessEqual(dis, allowanceSquared)) {
        if (dis < min) {
          min = dis;
          minPos = v;
        }
      }
    }
    return minPos;
  }

  /**
   * @author lianbo
   * @date 2020-11-13 09:11:36
   * @Description: 寻找吸附的线段
   */
  public static findAdsorptionSeg(
    p: any,
    segs: any[],
    fn: any,
    accuracy = 10
  ): any {
    let min: number = Number.MAX_VALUE;
    let closestP: any = null;
    let closestSeg: any = null;
    for (const seg of segs) {
      const result: any = fn(p, seg);
      if (MathUtils.lessEqual(result.dis, accuracy)) {
        if (result.dis < min) {
          min = result.dis;
          closestP = result.closest;
          closestSeg = seg;
        }
      }
    }
    return { seg: closestSeg, point: closestP };
  }

  /**
   * @author lianbo
   * @date 2021-01-18 16:07:59
   * @Description: 以ps为顶点的多边形和边的吸附
   */
  static findAdsorptionPolygon(
    p: any,
    ps: any[],
    segs: any[],
    fn: any,
    accuracy = 10
  ): any {
    let minX: number = Number.MAX_VALUE;
    let minY: number = Number.MAX_VALUE;
    let closestPX: any = null;
    let closestSegX: any = null;
    let adsorptionPX: any = null;

    let closestPY: any = null;
    let closestSegY: any = null;
    let adsorptionPY: any = null;
    for (const p of ps) {
      for (const seg of segs[0]) {
        const result: any = fn(p, seg);
        if (MathUtils.lessEqual(result.dis, accuracy)) {
          if (result.dis < minY) {
            minY = result.dis;
            closestPY = result.closest;
            closestSegY = seg;
            adsorptionPY = p;
          }
        }
      }

      for (const seg of segs[1]) {
        const result: any = fn(p, seg);
        if (MathUtils.lessEqual(result.dis, accuracy)) {
          if (result.dis < minX) {
            minX = result.dis;
            closestPX = result.closest;
            closestSegX = seg;
            adsorptionPX = p;
          }
        }
      }
    }
    let x = p.x;
    let y = p.y;
    if (closestPX) {
      x = p.x + (closestPX.x - adsorptionPX.x);
    }
    if (closestPY) {
      y = p.y + (closestPY.y - adsorptionPY.y);
    }
    return { x: x, y: y };
  }

  static findHorizontalAndVertical(
    position: any,
    points: any,
    accuracy = 10
  ): any {
    let minX = Number.MAX_VALUE;
    let pX;
    let minY = Number.MAX_VALUE;
    let pY;
    for (const p of points) {
      const offsetX = Math.abs(position.x - p.x);
      if (offsetX < accuracy) {
        if (offsetX < minX) {
          minX = offsetX;
          pX = p;
        }
      }

      const offsetY = Math.abs(position.y - p.y);
      if (offsetY < accuracy) {
        if (offsetY < minY) {
          minY = offsetY;
          pY = p;
        }
      }
    }
    let x = position.x;
    let y = position.y;
    if (pX) {
      x = pX.x;
    }
    if (pY) {
      y = pY.y;
    }
    if (pX || pY) {
      return { x, y };
    }
    return null;
  }
}
