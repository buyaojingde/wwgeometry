import SplayTree from 'splaytree';
import MathUtils from '../../math/MathUtils';
import Point from '../Point';
import Segment from '../Segment';

class SegItem {
  seg: Segment;
  group: number;

  public constructor(seg: Segment, group: number) {
    this.seg = seg;
    this.group = group;
  }
}

class EventItem {
  public p: Point;
  public seg: SegItem | undefined;

  public constructor(p: Point, seg?: SegItem) {
    this.p = p;
    this.seg = seg;
  }
}

class EventPointStatus {
  private splayTree: SplayTree<Point, EventItem>;

  public constructor() {
    this.splayTree = new SplayTree<Point, EventItem>(this.byX);
  }

  public get isEmpty(): boolean {
    return this.splayTree.isEmpty();
  }

  public byX(a: Point, b: Point) {
    if (a.x > b.x) return 1;
    if (a.x === b.x) {
      if (a.y > b.y) {
        return 1;
      } else {
        if (a.y === b.y) {
          return 0;
        }
        return -1;
      }
    }
    return -1;
  }

  add(seg: Segment, group = 0) {
    const eItem = new EventItem(seg.start, new SegItem(seg, group));
    const eItem1 = new EventItem(seg.end, new SegItem(seg, group));
    this.splayTree.add(eItem.p, eItem);
    this.splayTree.add(eItem1.p, eItem1);
  }

  insert(e: EventItem) {
    this.splayTree.add(e.p, e);
  }

  pop() {
    const p = this.splayTree.pop();
    return p && p.data;
  }
}

class SweepLineStatus {
  public splayTree: SplayTree<SegItem, undefined>;
  public currentP!: Point;

  public constructor() {
    this.splayTree = new SplayTree<SegItem, undefined>((a, b) =>
      this.compareSeg(a, b)
    );
  }

  /**
   * @author lianbo
   * @date 2020-12-23 16:08:00
   * @Description: 相邻的上面的线段
   */
  public above(seg: SegItem): SegItem | undefined {
    let find = this.splayTree.find(seg);
    if (!find) return;
    let done;
    while (!done) {
      const next = this.splayTree.next(find);
      if (!next) return;
      const ab = next.key;
      if (!ab) return;
      if (ab.group !== seg.group) {
        return ab;
      }
      find = next;
    }
    return;
  }

  public insert(seg: SegItem) {
    this.splayTree.insert(seg);
  }

  public del(seg: SegItem) {
    this.splayTree.remove(seg);
  }

  /**
   * @author lianbo
   * @date 2020-12-24 16:58:09
   * @Description: 当this.current.p变化时,为啥不能自动排序.
   */
  public sort() {
    if (this.splayTree.isEmpty()) return;
    const item = this.splayTree.keys();
    this.splayTree.clear();
    if (!item) return;
    item.forEach((item) => this.splayTree.insert(item));
  }

  /**
   * @author lianbo
   * @date 2020-12-23 16:08:00
   * @Description: 相邻的下面的线段
   */
  public below(seg: SegItem): SegItem | undefined {
    let find = this.splayTree.find(seg);
    if (!find) return;
    let done;
    while (!done) {
      const prev = this.splayTree.prev(find);
      if (!prev) return;
      const ab = prev.key;
      if (!ab) return;
      if (ab.group !== seg.group) {
        return ab;
      }
      find = prev;
    }
    return;
  }

  compareSeg(seg: SegItem, seg1: SegItem) {
    const a = seg.seg;
    const b = seg1.seg;
    if (a.equalTo(b)) return 0;
    const ak = a.intersectionY(this.currentP);
    const bk = b.intersectionY(this.currentP);
    if (ak === null || bk === null) {
      throw new Error(' EventPoint exception...'); //理论上不可能出现，如果出现，证明代码逻辑有问题
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
    // if (aVertical) {
    //   return aMax - bk;
    // }
    // if (bVertical) {
    //   return ak - bMax;
    // }
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
    while (!this.eps.isEmpty) {
      const currentEvent = this.eps.pop();
      if (!currentEvent) break;

      currentEvent && this.handle(currentEvent);
      if (currentEvent.seg && currentEvent.seg.seg) {
        const seg = currentEvent.seg.seg;
        if (seg.byX()[1] === currentEvent.p) {
          this.sls.del(currentEvent.seg);
        }
      }
    }
    return this.result;
  }

  private handle(currentEvent: EventItem) {
    const p = currentEvent.p;
    if (!currentEvent.seg) return;
    const current = currentEvent.seg;
    this.sls.currentP = p;

    if (currentEvent.seg && currentEvent.seg.seg) {
      const seg = currentEvent.seg.seg;
      if (seg.byX()[0] === currentEvent.p) {
        // 起点
        this.sls.insert(currentEvent.seg);
      }
      if (seg.byX()[1] === currentEvent.p) {
        // 起点
        this.sls.sort();
        // console.log(this.sls.splayTree);
      }
    }

    const above = current && this.sls.above(current);
    const below = current && this.sls.below(current);
    if (above) {
      const intersect = current.seg.intersect(above.seg, true);
      if (intersect) {
        this.result.push(intersect);
        const event = new EventItem(intersect);
        this.eps.insert(event);
      }
    }

    if (below) {
      const intersect = current.seg.intersect(below.seg, true);
      if (intersect) {
        this.result.push(intersect);
        const event = new EventItem(intersect);
        this.eps.insert(event);
      }
    }
  }
}
