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
  public static findAdsorptionPoint(p: any, vs: any[], fn: any, accuracy: number = 10): any {
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
  public static findAdsorptionSeg(p: any, segs: any[], fn: any, accuracy: number = 10): any {
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
}
