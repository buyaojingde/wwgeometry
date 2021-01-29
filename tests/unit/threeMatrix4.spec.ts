import { Matrix4, Vector3 } from 'three';
import GeoSurface from '../../src/scene/Model/Geometry/GeoSurface';
import MathUtils from '../../src/utils/Math/math/MathUtils';

describe('threeMatrix4', () => {
  it('GeoSurface', () => {
    const v0 = new Vector3(400, 400, 10);
    const v1 = new Vector3(500, 400, 20);
    const v2 = new Vector3(400, 500, 30);
    const face = new GeoSurface([v0, v1, v2]);
    const mat = face.getMat();
    const invertMat = new Matrix4().getInverse(mat);
    const r0 = v0.applyMatrix4(invertMat);
    const r1 = v1.applyMatrix4(invertMat);
    const r2 = v2.applyMatrix4(invertMat);
    console.log(r0);
    console.log(r1);
    console.log(r2);
    expect(
      MathUtils.equalZero(r0.y) &&
        MathUtils.equalZero(r1.y) &&
        MathUtils.equalZero(r2.y)
    ).toBe(true);
  });
});
