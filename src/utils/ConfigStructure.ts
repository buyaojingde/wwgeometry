import Model2DActive from "../store/Model2DActive";
import Matrix3x3 from "./Math/geometry/Matrix3x3";
import Point from "./Math/geometry/Point";
import MathUtils from "./Math/math/MathUtils";

class ConfigStructure {
  public zeroPoint: any = {};
  maxGeoV3!: { x: number; y: number; z: number };
  minGeoV3!: { x: number; y: number; z: number };
  maxCanvasV3!: { x: number; y: number };
  minCanvasV3!: { x: number; y: number };
  debugger: boolean = false;
  public accuracy = 0.1;

  /**
   * @author lianbo
   * @date 2020-11-11 15:14:57
   * @Description: 几何坐标的坐标转换矩阵
   */
  public get subjectMat(): Matrix3x3 {
    const mat = new Matrix3x3();
    mat.translate(Model2DActive.subjectVec3.x, Model2DActive.subjectVec3.y);
    mat.rotate(MathUtils.Deg2Rad * Model2DActive.subjectVec3.z);
    return mat;
  }

  /**
   * @author lianbo
   * @date 2020-11-05 10:00:06
   * @Description: 缩小尺寸在画布中显示
   */
  smallVertex(origin: any): any {
    // if (!this.zeroPoint) {
    //   this.zeroPoint = origin;
    //   Model2DActive.subjectVec3.x = this.zeroPoint.x;
    //   Model2DActive.subjectVec3.y = this.zeroPoint.y;
    //   Model2DActive.subjectVec3.z = 0;
    // }
    return {
      x: (origin.x - this.zeroPoint.x) / 10,
      y: (origin.y - this.zeroPoint.y) / 10,
      z: (origin.z - this.zeroPoint.z) / 10,
    };
  }

  /**
   * @author lianbo
   * @date 2020-11-04 15:04:56
   * @Description: 建筑坐标转换为渲染所用的坐标
   */
  public topFaceToBoundingPoints(face: any, points: Point[]): Point[] {
    for (let i = 0; i < face.length; i++) {
      const faceP = face[i];
      const p = points[i];
      this.face2P(faceP, p);
    }
    return points;
  }

  public face2P(faceP: any, p: Point): Point {
    if (p === null) p = new Point();
    const smallV = this.smallVertex(faceP);
    p.x = smallV.x;
    p.y = -smallV.y;
    return p;
  }

  /**
   * @author lianbo
   * @date 2020-11-04 15:14:10
   * @Description: 渲染所用的坐标转换为顶面的face所用的坐标
   */
  public boundingPoint2TopFace(ps: Point[], face: any[]): any {
    for (let i = 0; i < ps.length; i++) {
      const p = ps[i];
      const faceP = face[i];
      face.push(this.p2FaceP(p, faceP));
    }
    return face;
  }

  /**
   * @author lianbo
   * @date 2020-11-06 08:57:55
   * @Description: 顶面的几何数据发生变化后，需要整个几何数据进行同步
   */
  public geoData(): any {
    // TODO：这个过程可能放在后台进行计算
  }

  public p2FaceP(p: Point, faceP: any): any {
    faceP.x = p.x * 10 + this.zeroPoint.x;
    faceP.y = p.y * -10 + this.zeroPoint.y;
    return faceP;
  }

  /**
   * @author lianbo
   * @date 2020-11-11 15:11:36
   * @Description: Canvas坐标转几何坐标
   */
  public computeGeo(p: any): any {
    const faceP: any = {};
    faceP.x = p.x * 10 + this.zeroPoint.x;
    faceP.y = p.y * -10 + this.zeroPoint.y;
    return faceP;
  }

  /**
   * @author lianbo
   * @date 2020-11-11 15:12:26
   * @Description: 几何坐标转Canvas坐标
   */
  public computePoint(face: any): Point {
    const p = new Point();
    const smallV = this.smallVertex(face);
    p.x = smallV.x;
    p.y = -smallV.y;
    return p;
  }

  /**
   * @author lianboj
   * @date 2020-11-11 15:16:28
   * @Description: localToWorld 几何的局部坐标转世界坐标
   */
  public localToWorldGeo(): Point {
    const wGeo = this.subjectMat.apply(
      new Point(Model2DActive.structureVec3.x, Model2DActive.structureVec3.y)
    );
    return wGeo;
  }
}

export default new ConfigStructure();