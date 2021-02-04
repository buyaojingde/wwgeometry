import { Matrix4, Vector3 } from 'three';
import GeoSurface from '../../src/scene/Model/Geometry/GeoSurface';
import MathUtils from '../../src/utils/Math/math/MathUtils';

describe('threeMatrix4', () => {
  const v0 = new Vector3(400, 400, 10);
  const v1 = new Vector3(500, 400, 20);
  const v2 = new Vector3(400, 500, 30);
  const face = new GeoSurface([v0, v1, v2]);
  const mat = face.getMat();
  const invertMat = new Matrix4().getInverse(mat);
  const r0 = v0.clone().applyMatrix4(invertMat);
  const r1 = v1.clone().applyMatrix4(invertMat);
  const r2 = v2.clone().applyMatrix4(invertMat);
  console.log(r0);
  console.log(r1);
  console.log(r2);
  const toWorld = r0.clone().applyMatrix4(mat);
  const toWorld1 = r1.clone().applyMatrix4(mat);
  const toWorld2 = r2.clone().applyMatrix4(mat);
  it('GeoSurface', () => {
    expect(MathUtils.equalZero(r0.y)).toBe(true);
  });
  it('GeoSurface1', () => {
    expect(MathUtils.equalZero(r1.y)).toBe(true);
  });
  it('GeoSurface2', () => {
    expect(MathUtils.equalZero(r2.y)).toBe(true);
  });
  it('GeoSurface3', () => {
    expect(MathUtils.equalV3(toWorld, v0)).toBe(true);
  });
  it('GeoSurface4', () => {
    expect(MathUtils.equalV3(toWorld1, v1)).toBe(true);
  });

  it('GeoSurface5', () => {
    expect(MathUtils.equalV3(toWorld2, v2)).toBe(true);
  });

  it('Horizontal', () => {
    const v0 = new Vector3(-7418.3, 20807.3, -7270.9);
    const v1 = new Vector3(-7418.3, 20807.3, -7470.9);
    const v2 = new Vector3(-6739.5, 20790.3, -7470.9);
    const v3 = new Vector3(-6739.5, 20790.3, -7270.9);
    const face = new GeoSurface([v0, v1, v2, v3]);
    expect(face.isHorizontal).toBe(false);
  });
  it('isHorizontal', () => {
    const v0 = new Vector3(-7418.3, 0, -7270.9);
    const v1 = new Vector3(-7418.3, 0, -7470.9);
    const v2 = new Vector3(-6739.5, 0, -7470.9);
    const v3 = new Vector3(-6739.5, 0, -7270.9);
    const face = new GeoSurface([v0, v1, v2, v3]);
    expect(face.isHorizontal).toBe(true);
  });
});
