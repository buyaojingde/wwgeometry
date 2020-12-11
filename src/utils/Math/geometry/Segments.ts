import Segment from "./Segment";

export default class Segments {
  public constructor(ps: Segment[]) {
    this._segs = ps;
  }
  private _segs: Segment[];

  /**
   * @author lianbo
   * @date 2020-11-27 16:18:54
   * @Description 多端线段减去另一条线段
   */
  public subtract(other: Segment): Segment[] {
    const remainderEdges: any[] = [];
    for (const edge of this._segs) {
      if (edge.isZero()) break;

      const dif = edge.subtract(other);
      if (dif.length > 0) {
        dif.forEach((item: Segment) => {
          if (!item.isZero()) {
            remainderEdges.push(item);
          }
        });
      }
    }
    return remainderEdges;
  }

  /**
   * @author lianbo
   * @date 2020-11-27 16:18:54
   * @Description 多端线段减去多条线段
   */
  public subtractSegs(otherEdgess: Segment[]): Segment[] {
    const remainderEdges: Segment[] = [];
    for (const edge of this._segs) {
      if (edge.isZero()) break;
      let difference: Segment[] = [edge.clone()];
      for (const other of otherEdgess) {
        if (difference.length === 0) {
          break;
        }
        const result: any[] = [];
        for (const seg of difference) {
          const dif = seg.subtract(other);
          if (dif.length > 0) {
            dif.forEach((item: Segment) => {
              if (!item.isZero()) {
                result.push(item);
              }
            });
          }
        }
        difference = result;
      }
      if (difference.length > 0) {
        remainderEdges.push(...difference);
      }
    }
    return remainderEdges;
  }
}
