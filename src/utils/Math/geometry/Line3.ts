import MathUtils from '../math/MathUtils';
import Vector3 from './Vector3';

export default class Line3 {
  public p: Vector3; // 点
  public u: Vector3; // 方向
  constructor(p: Vector3, u: Vector3) {
    this.p = p;
    this.u = u;
  }

  /**
   * @author lianbo
   * @date 2020-11-16 20:59:35
   * @Description: http://geomalgorithms.com/a07-_distance.html
   * 线与线的距离
   * D 为0 平行
   * 距离为0，就是相交
   */
  public distance(l: Line3, epsilon: number = MathUtils.Epsilon) {
    const u = this.u;
    const v = l.u;
    const w = this.p.subtract(l.p);
    const a = u.dot(u); // always >= 0
    const b = u.dot(v);
    const c = v.dot(v); // always >= 0
    const d = u.dot(w);
    const e = v.dot(w);
    const D = a * c - b * b; // always >= 0
    let sc, tc;

    // compute the line parameters of the two closest points
    if (D < epsilon) {
      // the lines are almost parallel
      sc = 0.0;
      tc = b > c ? d / b : e / c; // use the largest denominator
    } else {
      sc = (b * e - c * d) / D;
      tc = (a * e - b * d) / D;
    }

    // get the difference of the two closest points
    //const dP = w + sc * u - tc * v; // =  L1(sc) - L2(tc)
    const dP = w.add(u.multiply(sc)).subtract(v.multiply(tc));

    return dP.length; // return the closest distance
  }
}
