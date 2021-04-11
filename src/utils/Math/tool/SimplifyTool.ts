import Polygon from '../geometry/Polygon';
import Point from '../geometry/Point';

/*
 * @Author: lianbo
 * @Date: 2021-03-24 22:50:36
 * @LastEditors: lianbo
 * @LastEditTime: 2021-03-24 22:50:53
 * @Description:
 */
export default class SimplifyTool {
  static simplify(
    poly: Polygon,
    tolerance: number,
    highestQuality = false
  ): any {
    const sqTolerance = tolerance * tolerance;
    let polySim = highestQuality
      ? poly
      : SimplifyTool.simplifyRadialDist(poly, sqTolerance);
    polySim = new Polygon(
      SimplifyTool.simplifyDouglasPeucker(polySim, sqTolerance)
    );
    return polySim;
  }

  /**
   @desc square distance from a point to a segment
   @param {Array} point
   @param {Array} segmentAnchor1
   @param {Array} segmentAnchor2
   @private
   */

  public static getSqSegDist(p: number[], p1: number[], p2: number[]) {
    let x = p1[0],
      y = p1[1];
    let dx = p2[0] - x,
      dy = p2[1] - y;

    if (dx !== 0 || dy !== 0) {
      const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);

      if (t > 1) {
        x = p2[0];
        y = p2[1];
      } else if (t > 0) {
        x += dx * t;
        y += dy * t;
      }
    }

    dx = p[0] - x;
    dy = p[1] - y;
    return dx * dx + dy * dy;
  }
  /**
   @desc basic distance-based simplification
   @param {Array} polygon
   @param {Number} sqTolerance
   @private
   */
  public static simplifyRadialDist(
    poly: Polygon,
    sqTolerance: number
  ): Polygon {
    let point;
    let prevPoint: Point = poly.vertices[0];
    const newPoints = [prevPoint];

    for (let i = 1, len = poly.length; i < len; i++) {
      point = poly.vertices[i];

      if (point.distanceToPointSquared(prevPoint) > sqTolerance) {
        newPoints.push(point);
        prevPoint = point;
      }
    }

    if (!!point && prevPoint !== point) newPoints.push(point);
    return new Polygon(newPoints);
  }
  /**
   @param {Array} polygon
   @param {Number} first
   @param {Number} last
   @param {Number} sqTolerance
   @param {Array} simplified
   @private
   */

  public static simplifyDPStep(
    poly: Polygon,
    first: number,
    last: number,
    sqTolerance: number,
    simplified: Point[]
  ) {
    let index = 0;
    let maxSqDist = sqTolerance;

    for (let i = first + 1; i < last; i++) {
      const sqDist = SimplifyTool.getSqSegDist(
        poly.vertices[i].toArray,
        poly.vertices[first].toArray,
        poly.vertices[last].toArray
      );

      if (sqDist > maxSqDist) {
        index = i;
        maxSqDist = sqDist;
      }
    }

    if (maxSqDist > sqTolerance) {
      if (index - first > 1)
        SimplifyTool.simplifyDPStep(
          poly,
          first,
          index,
          sqTolerance,
          simplified
        );
      simplified.push(poly.vertices[index]);
      if (last - index > 1)
        SimplifyTool.simplifyDPStep(poly, index, last, sqTolerance, simplified);
    }
  }
  /**
   @desc simplification using Ramer-Douglas-Peucker algorithm
   @param {Array} polygon
   @param {Number} sqTolerance
   @private
   */

  public static simplifyDouglasPeucker(
    poly: Polygon,
    sqTolerance: number
  ): Point[] {
    const last = poly.length - 1;
    const simplified = [poly.vertices[0]];
    SimplifyTool.simplifyDPStep(poly, 0, last, sqTolerance, simplified);
    simplified.push(poly.vertices[last]);
    return simplified;
  }
}
