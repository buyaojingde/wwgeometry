import { Matrix4, Vector2, Vector3 } from 'three';
import Point from '../../../utils/Math/geometry/Point';
import Polygon from '../../../utils/Math/geometry/Polygon';
import MathUtils from '../../../utils/Math/math/MathUtils';

export default class GeoSurface {
  points: Vector3[];
  public mat: Matrix4;
  public inverse: Matrix4;

  constructor(points: Vector3[]) {
    if (points.length < 3) {
      throw new Error('cant compose face');
    }
    this.points = points;
    const height = Number.NEGATIVE_INFINITY;
    for (let i = 0; i < this.points.length; i++) {
      if (this.points[i].y > height) {
        this._height = this.points[i].y;
      }
    }
    this.mat = this.getMat();
    this.inverse = new Matrix4().getInverse(this.mat);
  }

  private _height: number = Number.NEGATIVE_INFINITY;

  get height(): number {
    return this._height;
  }

  /**
   * @author lianbo
   * @date 2020-11-04 15:38:09
   * @Description: 平面是否水平
   */
  public get isHorizontal(): boolean {
    const v1 = new Vector3().subVectors(
      this.points[0],
      this.points[this.points.length - 1]
    );
    const v0 = new Vector3().subVectors(this.points[0], this.points[1]);
    const normal = new Vector3().crossVectors(v0, v1);
    return MathUtils.equalZero(normal.x) && MathUtils.equalZero(normal.z);
  }

  /**
   * @author lianbo
   * @date 2020-40-23 14:40:01
   * @Description: 平面的法向量的单位向量
   */
  public get normal(): Vector3 {
    const v0: Vector3 = this.points[0];
    const v1: Vector3 = this.points[1];
    const v2: Vector3 = this.points[2];
    const normal = new Vector3().crossVectors(
      v1.clone().sub(v0),
      v2.clone().sub(v0)
    );
    return normal.normalize();
  }

  /**
   * @author lianbo
   * @date 2020-00-24 11:00:03
   * @Description: 平面的变换矩阵 C=TR,如果需要把世界坐标转换到此平面空间，需要使用(TR)' = R'T'
   * 在OpenGL中的LookAt是直接求出的R'T',所以这个一点要注意，只有理解原理了，才能理解此lookAt和彼lookAt并不一样
   */
  public getMat(): Matrix4 {
    const mat = new Matrix4();
    mat.setPosition(this.points[0]);
    mat.lookAt(this.points[0], this.points[1], this.normal);
    return mat;
  }

  /**
   * @author lianbo
   * @date 2021-01-11 17:31:11
   * @Description: 在XZ平面上的投影完全重叠
   */
  overlapXZ(face: GeoSurface) {
    const polygon = this.projectXZ();
    const polygon1 = face.projectXZ();
    return polygon.completeOverlap(polygon1);
  }

  private projectXZ(): Polygon {
    const vertices = this.points.map((item) => new Point(item.x, item.z));
    return new Polygon(vertices);
  }

  public toLocalVertices(points: Vector3[]): Vector2[] {
    const locals = points.map((p) => p.applyMatrix4(this.inverse));
    return locals.map((item) => new Vector2(item.x, item.z));
  }
}
