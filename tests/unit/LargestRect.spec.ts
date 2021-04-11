import Polygon from '../../src/utils/Math/geometry/Polygon';
import LargestRect from '../../src/utils/Math/geometry/algorithm/LargestRect';

describe('LargestRect', () => {
  it('basic', () => {
    const poly = new Polygon([
      { x: 1, y: 1 },
      { x: 2, y: 2 },
      { x: 3, y: 3 },
      { x: 3, y: 1 },
    ]);
    const result = LargestRect.largestRectWithHole(poly, []);
    console.log(result);
  });
});
