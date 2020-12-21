import * as isect from 'isect';
import CircularLinkedList from '../dataStructure/CircularLinkedList';
import Point from './Point';
import Polygon from './Polygon';
import Segment from './Segment';

interface IslsEdgeNode {
  pointA: Point[];
  pointB: Point[];
  oddEvenA: boolean;
  oddEvenB: boolean;
  typeA: number;
  typeB: number;
}
enum OpType {
  differ,
  union,
  intersect,
}

class IntersectionNode {
  nextS: IntersectionNode; // 主多边形
  nextC: IntersectionNode; // 裁剪多边形
  isIntersect: boolean;
  point: Point;

  public constructor(p: Point, options?: any) {
    this.point = p;
    this.nextS = options.nextS ? options.nextS : null;
    this.nextC = options.nextC ? options.nextC : null;
    this.isIntersect = options.isIntersect ? options.isIntersect : false;
  }
}

class LinkedList {
  public current!: IntersectionNode;

  public addS(node: IntersectionNode): boolean {
    if (!this.current) {
      this.current = node;
      this.current.nextS = this.current;
    }
    node.nextS = this.current.nextS;
    this.current.nextS = node;
    return true;
  }
}

// export default class PolygonOp {
//   public intersection(a: Polygon, b: Polygon, op: OpType) {
//     if (a.insidePolygon(b)) {
//       if (op === OpType.union) {
//         return [a];
//       }
//       if (op === OpType.differ) {
//         // TODO:
//         return [];
//       }
//       if (op === OpType.intersect) {
//         return [b];
//       }
//     }
//     if (a.noIntersect(b)) {
//       if (op === OpType.union) {
//         return [a, b];
//       }
//       if (op === OpType.differ) {
//         return [a];
//       }
//       if (op === OpType.intersect) {
//         return [];
//       }
//     }
//     const aLinks = this.polygon2Circular(a);
//     const bLinks = this.polygon2Circular(b);
//     const bIntersections: any[] = [];
//     for (let i = 0; i < a.edges.length; i++) {
//       const aEdge = a.edges[i];
//       const preNode = aLinks.index(i - 1);
//       const ips = [];
//       for (let j = 0; j < b.edges.length; j++) {
//         const bEdge = b.edges[j];
//         const iP = aEdge.intersect(bEdge, true);
//         if (iP) {
//           iP && ips.push(iP);
//           bIntersections[j].push(iP);
//         }
//       }
//       ips.sort((a, b) => {
//         if (
//           a.distanceToPointSquared(aEdge.start) >
//           b.distanceToPointSquared(aEdge.start)
//         ) {
//           return 1;
//         }
//         return -1;
//       });
//       aLinks.insertNodes(ips, preNode);
//     }
//   }
//
//   public polygon2Circular(a: Polygon): LinkedList {
//     const linkedList = new LinkedList();
//     for (const v of a.vertices) {
//       linkedList.addS(new IntersectionNode(v));
//     }
//     return linkedList;
//   }
// }
