import MathUtils from '../math/MathUtils';
import GeometryTool from '../tool/GeometryTool';
import Box from './Box';
import Matrix3x3 from './Matrix3x3';
import Point from './Point';
import Segment from './Segment';
import Line2 from './Line2';
import Vector2 from './Vector2';

/**
 * @author lianbo
 * @date 2020-11-27 14:42:10
 * @Description: polygon，常用的七种简单关系
 *
 *   *******       &&&&&&&
 *   *     *       &     &        相离（外）
 *   *     *       &     &
 *   *******       &&&&&&&
 *
 *    *******&&&&&&&
 *    *     *&     &        相切(外）
 *    *     *&     &
 *    *******&&&&&&&
 *
 *
 *   ******&&&&&&&&&
 *   *    & *     &        相交
 *   *    & *     &
 *   *****&&&&&&&&&
 *
 *
 *
 *   ********
 *   *  & & *       相切（内）1包含2，或者2包含1
 *   *  & & *
 *   ********
 *
 *
 *   *********
 *   *       *
 *   *  & &  *       相离（内）1包含2，或者2包含1
 *   *  & &  *
 *   *       *
 *   *********
 *
 *
 */
export default class Polygon {
  /**
   * @author lianbo
   * @date 2021-04-11 11:22:28
   * @Description: 绕origin 旋转angleRad角度
   */
  polygonRotate(angleRad: number, origin: Point): Point[] {
    const mat = new Matrix3x3();
    mat.translate(origin.x, origin.y);
    mat.rotate(angleRad);
    const vs = this.vertices
      .map((item) => mat.applyInverse(item))
      .map((item) => new Point(item.x + origin.x, item.y + origin.y));
    return vs;
  }
  /**
   * @author lianbo
   * @date 2021-04-11 10:34:17
   * @Description: 多边形内的一点在一定角度的直线与多边形的最近的交点
   */
  polygonRayCast(origOrigin: Point, holes: Polygon[], angleRad = 0): any[] {
    const alpha = angleRad;
    const vector = new Vector2(Math.cos(alpha), Math.sin(alpha));
    const normal = vector.ccwNormal;
    const line = new Line2(origOrigin, normal);
    const idx = MathUtils.equal(alpha, Math.PI / 2) ? 1 : 0;
    const originValue = idx === 0 ? origOrigin.x : origOrigin.y;
    let minSqDistLeft = Number.MAX_VALUE;
    let minSqDistRight = Number.MAX_VALUE;
    let closestPointLeft = null;
    let closestPointRight = null;
    const edges = this.edges.concat(...holes.map((item) => item.edges));
    for (let i = 0; i < edges.length; i++) {
      const edge = edges[i];
      const p = line.intersectSeg(edge);

      if (p) {
        const sqDist = origOrigin.distanceToPointSquared(p);
        const pValue = idx === 0 ? p.x : p.y;

        if (pValue < originValue) {
          if (sqDist < minSqDistLeft) {
            minSqDistLeft = sqDist;
            closestPointLeft = p;
          }
        } else if (pValue > originValue) {
          if (sqDist < minSqDistRight) {
            minSqDistRight = sqDist;
            closestPointRight = p;
          }
        }
      }
    }
    if (closestPointLeft && closestPointRight) {
      return [closestPointLeft.toArray, closestPointRight.toArray];
    }
    return [closestPointLeft, closestPointRight];
  }
  public vertices: Point[];
  public edges!: Segment[];

  public constructor(vcs: any[]) {
    if (vcs.length < 3) {
      throw new Error('顶点不到三个！');
    }
    this.vertices = [];
    vcs.forEach((item) => this.vertices.push(new Point(item.x, item.y)));
    // if (this.isClockwise()) {
    // 按逆时针排序
    // this.reverseVertex();
    // }
    this.updateEdges();
  }

  /**
   * @author lianbo
   * @date 2020-11-19 21:02:04
   * @Description: 刷新边的数据
   */
  public updateEdges(): void {
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

  public get box(): Box {
    const xs = this.vertices.map((item) => item.x);
    const min = (x: number, y: number) => {
      if (x < y) return -1;
    };
    const max = (x: number, y: number) => {
      if (x > y) return -1;
    };
    const minX = MathUtils.getMinItem(xs, min);
    const maxX = MathUtils.getMinItem(xs, max);
    const ys = this.vertices.map((item) => item.y);
    const minY = MathUtils.getMinItem(ys, min);
    const maxY = MathUtils.getMinItem(ys, max);
    return new Box(new Point(minX, minY), new Point(maxX, maxY));
  }

  /**
   * @author lianbo
   * @date 2020-10-22 17:27:52
   * @Description: 获取多边形内的中点
   */
  public get centerPoint(): Point {
    return this.box.center;
  }

  public get length(): number {
    return this.vertices.length;
  }

  /**
   * @author lianbo
   * @date 2020-10-22 19:52:42
   * @Description: 多边形的凸顶点
   */
  public get convexP(): Point {
    let index: number;
    let v: Point = this.vertices[0];
    for (
      let i = 1;
      i < this.length;
      i++ //寻找一个凸顶点，实际上最低点肯定是凸顶点
    ) {
      if (this.vertices[i].y < v.y) {
        v = this.vertices[i];
        index = i;
      }
    }
    return v;
  }

  /**
   * @author lianbo
   * @date 2020-10-22 19:51:39
   * @Description: 在多边形内的一个点
   */
  public pointInsidePoly(): Point {
    const r: Point = new Point();
    let index = 0;
    let v = this.vertices[0];
    for (
      let i = 1;
      i < this.length;
      i++ //寻找一个凸顶点，实际上最低点肯定是凸顶点
    ) {
      if (this.vertices[i].y < v.y) {
        v = this.vertices[i];
        index = i;
      }
    }
    const a = this.vertices[(index - 1 + this.length) % this.length]; //得到v的前一个顶点
    const b = this.vertices[(index + 1) % this.length]; //得到v的后一个顶点
    let q: Point = new Point();
    const tri: Polygon = new Polygon([a, v, b]);
    let md = Number.MAX_VALUE;
    let bin = false;
    for (
      let i = 0;
      i < this.length;
      i++ //寻找在三角形avb内且离顶点v最近的顶点q
    ) {
      if (i === index) continue;
      if (i === (index - 1 + this.length) % this.length) continue;
      if (i === (index + 1) % this.length) continue;
      if (!tri.containR(this.vertices[i])) continue;
      bin = true;
      if (v.distanceToPointSquared(this.vertices[i]) < md) {
        q = this.vertices[i];
        md = v.distanceToPointSquared(q);
      }
    }
    if (!bin) {
      //没有顶点在三角形avb内，返回线段ab中点
      r.x = (a.x + b.x) / 2;
      r.y = (a.y + b.y) / 2;
      return r;
    }
    r.x = (v.x + q.x) / 2; //返回线段vq的中点
    r.y = (v.y + q.y) / 2;
    return r;
  }

  /**
   * @author lianbo
   * @date 2020-11-20 09:30:41
   * @Description: 点在多边形的边上，包括线段的端点
   */
  public onEdge(p: Point): boolean {
    for (const edge of this.edges) {
      if (edge.contain(p)) {
        return true;
      }
    }
    return false;
  }

  /**
   * @author lianbo
   * @date 2020-10-22 19:48:14
   * @Description: 多边形内点
   * use some raycasting to test hits,射线法 缺陷是，点在线上时判断不确定
   * 因为此算法所判断的区域都是半开闭区间
   */
  public containR(point: Point): boolean {
    if (this.box.exclude(point)) return false;
    const n = this.length,
      x: number = point.x,
      y: number = point.y;
    let p: Point = this.vertices[n - 1],
      x0: number = p.x,
      y0: number = p.y;
    let x1: number,
      y1: number,
      inside = false;

    for (let i = 0; i < n; ++i) {
      (p = this.vertices[i]), (x1 = p.x), (y1 = p.y);
      if (y1 > y !== y0 > y && x < ((x0 - x1) * (y - y1)) / (y0 - y1) + x1)
        inside = !inside;
      (x0 = x1), (y0 = y1);
    }

    return inside;
  }

  /**
   * @author lianbo
   * @date 2020-11-20 15:44:06
   * @Description: 在多边形外，不包括在线上
   */
  public outside(p: Point): boolean {
    if (this.onEdge(p)) return false; // 在线上
    return !this.containR(p);
  }

  /**
   * @author lianbo
   * @date 2020-11-20 15:45:05
   * @Description: 在多边形内，是真的内部，不包括在线上
   */
  public inside(p: Point): boolean {
    if (this.onEdge(p)) return false;
    return this.containR(p);
  }

  /**
   * @author lianbo
   * @date 2020-11-25 14:48:47
   * @Description: 完全包含，包括线 p内切或者内离
   */
  public insidePolygon(p: Polygon): boolean {
    return p.edges.every((item) => this.insideSeg(item));
  }

  /**
   * @author lianbo
   * @date 2020-11-26 20:16:45
   * @Description: 没有公共的内部空间,就是外切和外离的两种状态
   */
  public noIntersect(p: Polygon): boolean {
    if (this.box.noIntersect(p.box)) return true;
    if (this.segIntersection(p)) return false;
    if (this.insidePs(p.vertices)) return false;
    if (p.insidePs(this.vertices)) return false;
    for (const edge of p.edges) {
      if (this.insideSeg(edge)) {
        if (!this.boundaryContainSeg(edge)) {
          return false;
        }
      }
    }
    for (const edge of this.edges) {
      if (p.insideSeg(edge)) {
        if (!p.boundaryContainSeg(edge)) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * @author lianbo
   * @date 2021-04-15 23:35:28
   * @Description: 线段在边界上
   */
  public boundaryContainSeg(seg: Segment): boolean {
    if (!this.onEdge(seg.start)) {
      return false;
    }
    if (!this.onEdge(seg.end)) {
      return false;
    }
    const ps = this.intersectionSeg(seg);
    let i = 0;
    while (i < ps.length - 1) {
      const prev = ps[i];
      const next = ps[i + 1];
      i++;
      const center = new Point(
        (prev.x + next.x) * 0.5,
        (prev.y + next.y) * 0.5
      );
      if (!this.onEdge(center)) {
        return false;
      }
    }
    return true;
  }

  /**
   * @author lianbo 所有的点都在多边形内
   * @date 2021-04-07 21:51:52
   * @Description:
   */
  public insidePs(ps: Point[]): boolean {
    for (let i = 0; i < ps.length; i++) {
      if (this.outside(ps[i])) return false;
    }
    return true;
  }

  /**
   * @author lianbo
   * @date 2020-11-27 14:16:59
   * @Description: 与另一个polygon的线相交，不包括线段的端点（顶点)
   */
  public segIntersection(p: Polygon): boolean {
    const iEdges = this.edges;
    const otherEdges = p.edges;
    for (const iEdge of iEdges) {
      for (const otherEdge of otherEdges) {
        if (iEdge.isIntersect(otherEdge)) return true;
      }
    }
    return false;
  }

  /**
   * @author lianbo
   * @date 2020-11-20 10:41:58
   * @Description: 点在凸多边形内 O(logN)
   */
  public convexHullContain(p: Point): boolean {
    if (this.vertices.length < 3) return false;
    const pCross = function (cp0: Point, cp1: Point, cp2: Point) {
      return cp1.subtract(cp0).cross(cp2.subtract(cp0));
    };
    const p0 = this.vertices[0];
    const p1 = this.vertices[1];
    const pEnd = this.vertices[this.vertices.length - 1];
    const angle1 = pCross(p0, p1, p);
    const angle2 = pCross(p0, p, pEnd);
    const vP = p.subtract(p0);
    const determine = function (self: Polygon, fn: any): boolean {
      const b1 = fn(angle1, 0);
      const b2 = fn(angle2, 0);
      if (!(b1 && b2)) return false;
      let i = 1;
      let j = self.vertices.length - 1;
      while (i < j + 1) {
        const mid = Math.floor((i + j) * 0.5);
        const v1 = self.vertices[mid].subtract(p0);
        const angleMid = vP.cross(v1);
        if (fn(angleMid, 0)) {
          j = mid - 1;
        } else {
          i = mid;
        }
      }
      const line = i;
      const fAngle = self.vertices[line + 1]
        .subtract(self.vertices[line])
        .cross(p.subtract(self.vertices[line - 1]));
      return fn(fAngle, 0);
    };
    if (this.isHullConvexAntiClockwise()) {
      return determine(this, MathUtils.greater);
    }
    return determine(this, MathUtils.less);
  }

  /**
   * @author lianbo
   * @date 2020-11-20 11:51:01
   * @Description: 凸多边形逆时针
   */
  public isHullConvexAntiClockwise(): boolean {
    const p0 = this.vertices[0];
    const p1 = this.vertices[1];
    const pEnd = this.vertices[this.vertices.length - 1];
    const angle0 = p1.subtract(p0).cross(pEnd.subtract(p0));
    return MathUtils.greater(angle0, 0);
  }

  /// <summary>
  /// Returns true if point inside polygon, using fast winding-number computation绕线法
  /// </summary>
  public containW(p: Point): boolean {
    if (!this.box.contain(p)) return false;
    // based on http://geomalgorithms.com/a03-_inclusion.html
    let nWindingNumber = 0;

    const N = this.vertices.length;
    let a: Point = this.vertices[0],
      b = Point.ZERO;
    for (let i = 0; i < N; ++i) {
      b = this.vertices[(i + 1) % N];

      if (a.y <= p.y) {
        // y <= P.y (below)
        if (b.y > p.y) {
          // an upward crossing
          if (GeometryTool.isLeftSign(a, b, p) > 0)
            // P left of edge
            ++nWindingNumber; // have a valid up intersect
        }
      } else {
        // y > P.y  (above)
        if (b.y <= p.y) {
          // a downward crossing
          if (GeometryTool.isLeftSign(a, b, p) < 0)
            // P right of edge
            --nWindingNumber; // have a valid down intersect
        }
      }
      a = b;
    }
    return nWindingNumber != 0;
  }

  /**
   * @author lianbo
   * @date 2020-11-04 10:19:40
   * @Description: 更新每个顶点的位置信息，确保顶点的顺序和数量不变
   */
  public updateVertices(vcs: Point[]): void {
    for (let i = 0; i < this.vertices.length; i++) {
      this.vertices[i].copy(vcs[i]);
    }
  }

  /**
   * @author lianbo
   * @date 2020-11-18 09:12:55
   * @Description: 多边形的质点 from d3-polygon
   */
  public centroid(): Point {
    const n = this.vertices.length;

    let i = -1,
      x = 0,
      y = 0,
      a,
      b = this.vertices[n - 1],
      c,
      k = 0;

    while (++i < n) {
      a = b;
      b = this.vertices[i];
      k += c = a.x * b.y - b.x * a.y;
      x += (a.x + b.x) * c;
      y += (a.y + b.y) * c;
    }
    k *= 3;
    return new Point(x / k, y / k);
  }

  /**
   * @author lianbo
   * @date 2020-11-19 20:00:26
   * @Description: 将一个polygon切成两个box，类似这样
   *
   *       *********
   *       *       *
   *       *       *****
   *       *           *
   *       *           *
   *       *           *
   *       *************
   *
   */
  public cutBox(): any[] {
    // for (const seg of this.edges) {
    //   if (!(seg.isHorizontal() || seg.isVertical())) {
    //     return null; // 没法切
    //   }
    // }

    if (this.isBox()) {
      return [this.box]; // 本身就是box
    }

    for (let i = 0; i < this.edges.length; i++) {
      const next = i < this.edges.length - 1 ? i + 1 : 0;
      const segi = this.edges[i]; // 边
      const segNext = this.edges[next]; // 下一条边
      const segP = this.vertices[i]; // 两条边夹的点
      const diagonally = GeometryTool.diagonal(segi.start, segP, segNext.end);
      const diagonallyP = new Point(diagonally.x, diagonally.y);
      const newSeg = new Segment(segi.start, diagonallyP);
      const newSeg1 = new Segment(segNext.end, diagonallyP);
      if (this.insideSeg(newSeg) && this.insideSeg(newSeg1)) {
        const minX = segP.x < diagonallyP.x ? segP.x : diagonallyP.x;
        const maxX = segP.x < diagonallyP.x ? diagonallyP.x : segP.x;
        const minY = segP.y < diagonallyP.y ? segP.y : diagonallyP.y;
        const maxY = segP.y < diagonallyP.y ? diagonallyP.y : segP.y;
        const box = new Box(new Point(minX, minY), new Point(maxX, maxY));
        const delCount = 3;
        const delIndex = (i - 1 + this.vertices.length) % this.vertices.length;
        const maxDel = this.vertices.length - delIndex;
        const needCount = delCount - maxDel;
        const newArr = [...this.vertices];
        newArr.splice(delIndex, delCount, diagonallyP);
        if (needCount > 0) {
          newArr.splice(0, needCount);
        }
        return [box].concat(new Polygon(newArr).cutBox());
      }
    }
    return [];
  }

  /**
   * @author lianbo
   * @date 2020-11-19 20:51:19
   * @Description: 所有的边都是垂直和水平的，这种多边形可以细分成多个box
   */
  public similarBox(): boolean {
    for (const seg of this.edges) {
      if (!(seg.isHorizontal(0.1) || seg.isVertical(0.1))) {
        return false;
      }
    }
    return true;
  }

  /**
   * @author lianbo
   * @date 2020-11-19 20:52:13
   * @Description: 对多边形的点优化，不会出现共线的点
   */
  public optimize(): void {
    const discardPoints: Point[] = [];
    for (let i = 0; i < this.vertices.length; i++) {
      const next = i < this.vertices.length - 1 ? i + 1 : 0;
      const segi = this.vertices[i]; //
      const segNext = this.vertices[next]; //
      if (segi.equalTo(segNext)) {
        discardPoints.push(segNext);
      }
    }
    //删除重复的点
    if (discardPoints.length > 0) {
      for (const discard of discardPoints) {
        const disIdx = this.vertices.indexOf(discard);
        this.vertices.splice(disIdx, 1);
      }
    }
    this.updateEdges();
    for (let i = 0; i < this.edges.length; i++) {
      const next = i < this.edges.length - 1 ? i + 1 : 0;
      const segi = this.edges[i]; // 边
      const segNext = this.edges[next]; // 下一条边
      if (segi.parallel(segNext)) {
        this.vertices.splice(i, 1);
      }
    }
    this.updateEdges();
  }

  /**
   * @author lianbo
   * @date 2020-11-19 21:02:50
   * @Description: 删除点后新生成的polygon
   */
  public removeVertex(p: Point): void {
    const index = this.vertices.findIndex((item) => item.equalTo(p));
    this.vertices.splice(index, 1);
    this.updateEdges();
  }

  /**
   * @author lianbo
   * @date 2020-11-24 10:16:43
   * @Description: 多边形面积
   */
  public get area(): number {
    let fArea = 0;
    const N = this.vertices.length;
    if (N == 0) return 0;
    let v1 = this.vertices[0],
      v2 = Point.ZERO;
    for (let i = 0; i < N; ++i) {
      v2 = this.vertices[(i + 1) % N];
      fArea += v1.x * v2.y - v1.y * v2.x;
      v1 = v2;
    }
    return fArea * 0.5;
  }

  /**
   * @author lianbo
   * @date 2020-11-24 10:18:27
   * @Description: 是否是顺时针
   */
  public isClockwise(): boolean {
    return this.area < 0;
  }

  /**
   * @author lianbo
   * @date 2020-11-25 14:59:30
   * @Description: 完全重叠
   */
  public completeOverlap(other: Polygon): boolean {
    this.optimize();
    other.optimize();
    if (this.vertices.length !== other.vertices.length) return false;

    const otherVes = [...other.vertices];
    if (this.isClockwise() !== other.isClockwise()) {
      otherVes.reverse();
    }
    const thisStart = this.vertices[0];
    const index = otherVes.findIndex((item) => item.equalTo(thisStart));
    if (index === -1) return false;
    for (let i = 1; i < this.vertices.length; i++) {
      const otherIdx = (index + i) % this.vertices.length;
      if (!this.vertices[i].equalTo(otherVes[otherIdx])) {
        return false;
      }
    }
    return true;
  }

  /**
   * @author lianbo
   * @date 2020-11-25 15:13:17
   * @Description: 反转顶点顺序
   */
  public reverseVertex() {
    this.vertices.reverse();
  }

  /**
   * @author lianbo
   * @date 2020-11-25 21:43:48
   * @Description: 判断polygon是不是box
   */
  public isBox() {
    this.optimize();
    const box = this.box;
    let isBox = false;
    for (const p of this.vertices) {
      if (
        (MathUtils.equal(p.x, box.min.x) || MathUtils.equal(p.x, box.max.x)) &&
        (MathUtils.equal(p.y, box.min.y) || MathUtils.equal(p.y, box.max.y))
      ) {
        isBox = true;
      } else {
        isBox = false;
        break;
      }
    }
    return isBox;
  }

  /**
   * @author lianbo
   * @date 2020-11-26 16:45:18
   * @Description: 线段在多边形内，包括边界，两个点都在多边形内，且线段被多边形分割成多段后的中点还是在多半形内
   */
  public insideSeg(seg: Segment): boolean {
    if (this.outside(seg.start) || this.outside(seg.end)) return false;
    for (const edge of this.edges) {
      if (seg.isIntersect(edge)) return false;
    }
    const ps = this.intersectionSeg(seg);
    let i = 0;
    while (i < ps.length - 1) {
      const prev = ps[i];
      const next = ps[i + 1];
      i++;
      const center = new Point(
        (prev.x + next.x) * 0.5,
        (prev.y + next.y) * 0.5
      );
      if (this.outside(center)) {
        return false;
      }
    }
    return true;
  }

  /**
   * @author lianbo
   * @date 2020-12-08 17:31:29
   * @Description: 与线段相交，不包括端点
   */
  // public intersectionSeg(seg: Segment): boolean {
  //   return this.edges.some((item) => item.intersect(seg));
  // }

  /**
   * @author lianbo
   * @date 2020-12-08 14:52:16
   * @Description: 绕多边形的一点旋转多边形，一定角度
   */
  public rotate(): Polygon {
    const firstP = this.vertices[0];
    const firstEdgeArc = GeometryTool.arc(this.vertices[0], this.vertices[0]);
    const polygonMat = new Matrix3x3(); // 多边形的坐标变换矩阵
    polygonMat.translate(firstP.x, firstP.y);
    polygonMat.rotate(firstEdgeArc);
    const rotateVs = [...this.vertices].map((item) =>
      polygonMat.applyInverse(item)
    );
    return new Polygon(rotateVs);
  }

  public intersectionSeg(seg: Segment): Point[] {
    const ps: Point[] = [];
    for (const edge of this.edges) {
      const intersectP = seg.intersect(edge, true);
      if (intersectP) ps.push(intersectP);
    }
    ps.sort((a, b) => {
      const offsetX = a.x - b.x;
      if (offsetX !== 0) return offsetX;
      return a.y - b.y;
    });
    return ps;
  }

  /**
   * @Author: lianbo
   * @Date: 2021-03-23 00:05:58
   * @LastEditors: lianbo
   * @Description: 多边形变换成到卧倒的姿势
   * @param {number} scale
   * @return {*}
   */
  public calcMat(scale: number): Matrix3x3 {
    const mat = new Matrix3x3();
    mat.scale(scale, scale);
    const angle = this.calcAngle();
    mat.rotate(angle);
    const rotatePolygon = new Polygon(
      this.vertices.map((item) => mat.apply(item))
    );
    const rotateBox = rotatePolygon.box;
    mat.translate(rotateBox.min.x, rotateBox.max.y);

    return mat;
  }

  /**
   * @Author: lianbo
   * @Date: 2021-03-23 00:05:09
   * @LastEditors: lianbo
   * @Description: 计算多边形的角度，用最长边和X轴的角度表示
   * @param {*}
   * @return {*}
   */
  public calcAngle(): number {
    let longN = Number.MIN_VALUE;
    let longEdge = this.edges[0];
    for (let i = 0; i < this.edges.length; i++) {
      const edgeLength = this.edges[i].length;
      if (edgeLength > longN) {
        longEdge = this.edges[i];
        longN = edgeLength;
      }
    }
    return longEdge.dir.slope;
  }

  /**
   * @author lianbo
   * @date 2021-04-15 23:40:20
   * @Description: 带洞的多边形判断
   */
  public insidePolygonWithHoles(poly: Polygon | Box, holes: Polygon[]) {
    let rectPoly = poly instanceof Polygon ? poly : new Polygon(poly.points);
    if (!this.insidePolygon(rectPoly)) return false;
    for (let i = 0; i < holes.length; i++) {
      if (!holes[i].noIntersect(rectPoly)) return false;
    }
    return true;
  }

  public insideWithHoles(centroid: Point, holes: Polygon[]) {
    if (!this.inside(centroid)) return false;
    for (let i = 0; i < holes.length; i++) {
      if (holes[i].inside(centroid)) return false;
    }
    return true;
  }

  public expand(box: Box, holes: Polygon[]): Box {
    const width = box.width;
    const height = box.height;
    const landBox = this.box;
    const tolerance = Math.min(width, height) * 0.01;
    for (let i = 0; i < 4; i++) {
      const leftStart = box.boundary[i];
      let left = leftStart;
      let right = landBox.boundary[i];
      while (!MathUtils.equal(left, right, tolerance)) {
        const mid = (left + right) / 2;
        box.expand(i, mid);
        const inside = this.insidePolygonWithHoles(box, holes);
        if (inside) {
          left = mid;
        } else {
          right = mid;
        }
      }
      box.expand(i, left);
    }
    return box;
  }
}
