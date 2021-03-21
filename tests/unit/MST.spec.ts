import MST, { Edge } from '../../src/utils/Math/geometry/algorithm/MST';

describe('MST', () => {
  it('kruskals', () => {
    const edges = [
      new Edge(4, 5, 1),
      new Edge(6, 5, 2),
      new Edge(1, 2, 3),
      new Edge(3, 2, 4),
      new Edge(3, 4, 5),
      new Edge(1, 6, 6),
      new Edge(0, 1, 10),
      new Edge(6, 7, 11),
    ];
    const result = MST.kruskals(edges);
    console.log(result);
    expect(result).toBe(36);
  });
});
