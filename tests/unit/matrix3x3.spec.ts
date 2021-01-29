import Matrix3x3 from '../../src/utils/Math/geometry/Matrix3x3';

describe('matrix3x3', () => {
  it('decompose', () => {
    const mat = new Matrix3x3();
    mat.translate(123, 345);
    mat.rotate(1.678);
    const tf = mat.decompose();
    expect(tf.rotation === 1.678).toBe(true);
  });
});
