import Point from './Point';
import Segment from './Segment';

export default class Polygon {
  public vertices: Point[];
  public edges: Segment[];

  public constructor(vcs: Point[]) {
    this.vertices = vcs;
    this.edges = [];
    const lastV = this.vertices[this.vertices.length - 1];
    this.vertices.reduce((prev, current, index) => {
      const seg = new Segment(prev, current);
      this.edges.push(seg);
      return current;
    }, lastV);
  }

  /**
   * @author lianbo
   * @date 2020-10-10 15:39:18
   * @Description: 与其他多边形相切
   */
  // public touch(poly: Polygon): Point[] {
  //   const edgeList0:Segment[] = [];
  //     for (const edge of this.edges){
  //       for (const v of poly.vertices){
  //         if(edge.contain(v)){
  //           edgeList0.push(edge);
  //         }
  //       }
  //     }
  // }

}
