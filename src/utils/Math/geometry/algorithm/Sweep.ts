import SplayTree from "splayTree";
import MathUtils from "../../math/MathUtils";
import Point from "../Point";
import Segment from "../Segment";

class EventItem {
  public p: Point;
  public seg!: Segment[];
  public index!: number; // 事件分组，不同组之间才做运算
  public constructor(p: Point, seg?: Segment) {
    this.p = p;
    if (seg) {
      this.seg = [seg];
    }
  }
}

class EventPointStatus {
  private splayTree: SplayTree<Point, EventItem>;
  public constructor() {
    this.splayTree = new SplayTree<Point, EventItem>(this.byX);
  }
  public isEmpty(): boolean {
    return this.splayTree.isEmpty();
  }
  public byX(a: Point, b: Point) {
    if (a.x > b.x) return 1;
    if (a.x === b.x) {
      if (a.y > b.y) {
        return 1;
      } else {
        return -1;
      }
    }
    return -1;
  }

  add(seg: Segment, group = 0) {
    const eItem = new EventItem(seg.start, seg);
    eItem.index = group;
    const eItem1 = new EventItem(seg.end, seg);
    eItem1.index = group;
    this.splayTree.add(eItem.p, eItem);
    this.splayTree.add(eItem1.p, eItem1);
  }

  pop() {
    const p = this.splayTree.pop();
    return p && p.data;
  }
}

class SweepLineStatus {
  public splayTree: SplayTree<Segment, undefined>;
  public constructor() {
    this.splayTree = new SplayTree<Segment, undefined>(this.compareSeg);
  }
  public currentP!: Point;

  compareSeg(a: Segment, b: Segment) {
    if (a.equalTo(b)) return 0;
    const ak = a.intersectionY(this.currentP);
    const bk = b.intersectionY(this.currentP);
    if (!ak || !bk) {
      throw new Error(" EventPoint exception...");
    }
    if (!MathUtils.equal(ak, bk)) return ak - bk;
    const aVertical = a.isVertical();
    const bVertical = b.isVertical();
    const currentY = this.currentP.y;
    const aMax = a.maxY;
    const bMax = b.maxY;
    if (aVertical && bVertical) {
      if (MathUtils.equal(currentY, a.maxY)) {
        return a.minY - b.minY;
      }
      return aMax - bMax;
    }
    if (aVertical) {
      if (MathUtils.equal(aMax, bk)) {
        return -1;
      }
      return 1;
    }
    if (bVertical) {
      if (MathUtils.equal(bMax, ak)) {
        return 1;
      }
      return -1;
    }
    return a.rad - b.rad;
  }
}

export default class Sweep {
  public eps: EventPointStatus;
  public sls: SweepLineStatus;

  public result: any[] = [];

  public constructor(segss: Segment[][]) {
    this.eps = new EventPointStatus();
    this.sls = new SweepLineStatus();
    let group = 0;
    for (const segs of segss) {
      for (const seg of segs) {
        this.eps.add(seg, group);
      }
      group++;
    }
  }

  public calc() {
    while (this.eps.isEmpty) {
      const currentEvent = this.eps.pop();
      currentEvent && this.handle(currentEvent);
    }
    return this.result;
  }

  private handle(currentEvent: EventItem) {
    const p = currentEvent.p;
    const group = currentEvent.index;
  }
}
