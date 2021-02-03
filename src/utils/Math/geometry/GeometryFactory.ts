import { Vector3 } from 'three';
import MathUtils from '../math/MathUtils';

class GeometryFactory {
  public createVector3(inData: any): Vector3 {
    const x = MathUtils.isNum(inData.x) ? inData.x : inData.X;
    const y = MathUtils.isNum(inData.y) ? inData.y : inData.Y;
    const z = MathUtils.isNum(inData.z) ? inData.z : inData.Z;
    return new Vector3(x, y, z);
  }
}
export default new GeometryFactory();
