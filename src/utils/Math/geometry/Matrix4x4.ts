import { Matrix4, Vector3 } from 'three';

export default class Matrix4x4 {
  public static vs2Mat(vs: Vector3[]): any {
    if (vs.length < 3) return null;
    const mat = new Matrix4();
    const p0 = vs[0];
    const p1 = vs[1];
    const pEnd = vs[vs.length - 1];
    const v0 = p1.clone().sub(p0);
    const vEnd = pEnd.clone().sub(p0);
    const planeNormal = v0.clone().cross(vEnd);
    mat.setPosition(p0);
    mat.lookAt(planeNormal, new Vector3(0, 0, 0), v0);
    return mat;
  }

  public static worldToLocal(v: Vector3, matrixWorld: Matrix4): Vector3 {
    const mat = new Matrix4();
    const inverse = mat.getInverse(matrixWorld);
    return v.applyMatrix4(inverse);
  }

  public static localToWorld(v: Vector3, matrixWorld: Matrix4): Vector3 {
    return v.applyMatrix4(matrixWorld);
  }
}
