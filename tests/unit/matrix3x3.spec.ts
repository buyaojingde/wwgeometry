/*
 * @Author: lianbo
 * @Date: 2021-02-08 20:22:30
 * @LastEditors: lianbo
 * @LastEditTime: 2021-03-25 00:00:40
 * @Description:
 */

import Matrix3x3 from '../../src/utils/Math/geometry/Matrix3x3';
import Point from '../../src/utils/Math/geometry/Point';
import Polygon from '../../src/utils/Math/geometry/Polygon';

describe('matrix3x3', () => {
  it('decompose', () => {
    const mat = new Matrix3x3();
    mat.translate(123, 345);
    mat.rotate(1.678);
    const tf = mat.decompose();
    expect(tf.rotation === 1.678).toBe(true);
  });
  it('world2Local', () => {
    const polygon = new Polygon([
      new Point(11, 10),
      new Point(10, 11),
      new Point(9, 10),
      new Point(10, 9),
    ]);
    const mat = new Matrix3x3();
    const center = polygon.box.center;
    mat.translate(center.x, center.y);
    mat.rotate(polygon.edges[0].dir.slope);
    const polygon2 = new Polygon(
      polygon.vertices.map((item) => mat.applyInverse(item))
    );
    const zero = polygon2.box.min;
    mat.translate(zero.x, zero.y);
    const rectPoly: Polygon = new Polygon(
      polygon.vertices.map((item) => mat.applyInverse(item))
    );
    expect(rectPoly.vertices[0].x === 0 && rectPoly.vertices[0].y === 0).toBe(
      true
    );
  });
});
