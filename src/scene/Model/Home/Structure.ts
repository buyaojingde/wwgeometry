import Level from '../../../scene/Model/Home/Level';
import Room from '../../../scene/Model/Home/Room';
import Model2DActive from '../../../store/Model2DActive';
import ConfigStructure from '../../../utils/ConfigStructure';
import Box from '../../../utils/Math/geometry/Box';
import Polygon from '../../../utils/Math/geometry/Polygon';
import Segment from '../../../utils/Math/geometry/Segment';
import Segments from '../../../utils/Math/geometry/Segments';
import Vector2 from '../../../utils/Math/geometry/Vector2';
import { action, observable } from 'mobx';
import Point from '../../../utils/Math/geometry/Point';
import JSTSUtils from '../../2D/Utils/JSTSUtils';
import { IDataObject } from '../../Interface/IDataObject';
import IBuildable from '../BaseInterface/IBuildable';
import ObjectIndex from '../BaseInterface/ObjectIndex';

export const StType = {
  Wall: 'OST_Walls',
  PCWall: 'OST_GenericModel',
  Framing: 'OST_StructuralFraming',
  Column: 'OST_StructuralColumns',
  Door: 'OST_Doors',
  Window: 'OST_Windows',
  Floor: 'OST_Floors',
};
class RelRoom {
  room!: Room;
  segs!: Segment[];
  public constructor(r: Room, segs: Segment[]) {
    this.room = r;
    this.segs = segs;
  }
}

export default class Structure
  extends ObjectIndex
  implements IBuildable, IDataObject {
  public addRoomRel(r: Room, segs: Segment[]) {
    const item = new RelRoom(r, segs);
    this.roomRels.push(item);
  }
  get roomRels(): RelRoom[] {
    return this._roomRels;
  }

  set roomRels(value: RelRoom[]) {
    this._roomRels = value;
  }
  get level(): Level {
    return this._level;
  }

  set level(value: Level) {
    this._level = value;
  }
  get midSeg(): Segment {
    return this._midSeg;
  }
  isMoving!: boolean;
  @observable
  public isEdit = false;
  public destroyed = false;

  constructor() {
    super();
  }

  private _polygon!: Polygon;

  get polygon(): Polygon {
    return this._polygon;
  }

  get stType() {
    return this.ele.builtInCategory;
  }

  private _ele: any;

  get ele(): any {
    return this._ele;
  }

  set ele(value: any) {
    this._ele = value;
  }

  private _boundary!: Point[];

  get boundary(): Point[] {
    return this._boundary;
  }

  /**
   * @author lianbo
   * @date 2020-11-04 10:45:47
   * @Description: 仅在boundingPoints初始化时设置
   */
  set boundary(value: Point[]) {
    this._boundary = value;
    this._polygon = new Polygon(this._boundary);
  }

  private _geo: any;

  get geo(): any {
    return this._geo;
  }

  set geo(value: any) {
    this._geo = value;
  }

  private _topFaceGeo: any;

  get topFaceGeo(): any {
    return this._topFaceGeo;
  }

  set topFaceGeo(value: any) {
    this._topFaceGeo = value;
  }

  @observable
  private _visible = true;

  get visible(): boolean {
    return this._visible;
  }

  set visible(value: boolean) {
    this._visible = value;
  }

  private _editedVertex!: Point;

  get editedVertex(): Point {
    return this._editedVertex;
  }

  set editedVertex(value: Point) {
    this._editedVertex = value;
  }

  private _editedSeg!: Segment;

  get editedSeg(): Segment {
    return this._editedSeg;
  }

  set editedSeg(value: Segment) {
    this._editedSeg = value;
  }

  get box(): Box {
    return this.polygon.box;
  }

  /**
   * @author lianbo
   * @date 2020-11-13 15:35:03
   * @Description: 为四叉树创建的item
   */
  get quadData() {
    const box = this.box;
    return {
      data: this,
      x: box.min.x,
      y: box.min.y,
      width: box.width,
      height: box.height,
    };
  }

  get position(): Point {
    return this.polygon.box.center;
  }

  private _midSeg!: Segment;

  @action
  public setEdit(val: boolean) {
    this.isEdit = val;
  }

  doRender() {
    if (this.destroyed) {
      return;
    }
    this.emit('render');
  }

  build(): void {}

  buildFromData(data: object) {}

  public destroy(emitLayer = true) {
    if (!this.destroyed) {
      this.destroyed = true;

      this.emit('destroy');
      if (emitLayer) {
        this.emit('destroyLayerData');
      }
      this.removeAllListeners();
    }
  }

  public move(offset: Vector2): void {
    this.boundary.forEach((item) => item.add(offset));
  }

  /**
   * @author lianbo
   * @date 2020-11-04 16:30:18
   * @Description: 从当前取得的坐标点中取得对应的几何数据的坐标
   */
  public getFaceP(p: Point): any {
    const index = this.boundary.indexOf(p);
    if (index !== -1) {
      return this.topFaceGeo[index];
    }
    throw new Error('输入参数不是构建的顶点！');
  }

  /**
   * @author lianbo
   * @date 2020-11-06 09:35:14
   * @Description: 编辑顶点数据
   */
  public editVertex() {
    const currentP = ConfigStructure.computePoint({
      x: Model2DActive.structureVec3.x,
      y: Model2DActive.structureVec3.y,
    });
    const offset = currentP.subtract(this.editedVertex);
    this.editedVertex.move(offset);
    this.doRender();
  }

  /**
   * @author lianbo
   * @date 2020-11-06 09:34:13
   * @Description: 编辑边的数据
   */
  public editSeg(): void {
    const wPoint = ConfigStructure.localToWorldGeo();
    const currentP = ConfigStructure.computePoint(wPoint);
    const offset = currentP.subtract(this.editedSeg.center);
    this.editedSeg.move(offset);
    this.doRender();
  }

  public editPosition(): void {
    const currentP = ConfigStructure.computePoint({
      x: Model2DActive.structureVec3.x,
      y: Model2DActive.structureVec3.y,
    });
    const offset = currentP.subtract(this.position);
    this.boundary.forEach((item) => item.move(offset));
    this.doRender();
  }

  setMidLine(number: number, number2: number) {
    const edges = this.box.edges;
    const start = edges[number].center;
    const end = edges[number2].center;
    this._midSeg = new Segment(start, end);
  }

  private updateMatrix(vcs: Point[]): void {
    this._polygon.updateVertices(vcs);
  }

  public wallFaces(): Segment[] {
    const segs = this.polygon.edges;
    const midSeg = this.midSeg;
    if (!midSeg) return [];
    return segs.filter((item) => item.parallel(midSeg));
  }

  public insideWall(): boolean {
    if (this.stType !== StType.Wall) return false;
    const wallFaces = this.wallFaces.bind(this)();
    if (wallFaces.length === 0) return false;
    const interactionRoom = this.level.quadTree
      .retrieve(this.quadData)
      .filter((item) => item.data instanceof Room)
      .map((item) => item.data);
    for (const face of wallFaces) {
      let isContain = false;
      for (const room of interactionRoom) {
        const roomPoly = room.polygon;
        const result = roomPoly.edges.some((item: any) =>
          item.containSeg(face)
        );
        const result1 = roomPoly.box.edges.some((item: any) =>
          item.containSeg(face)
        );
        if (result || result1) isContain = true;
      }
      if (!isContain) return false;
    }
    return true;
  }

  private _level!: Level;

  private _roomRels: RelRoom[] = [];

  public outFace(sts: any[]): Segment[] {
    const diffSt = (plg: Polygon, plg2: Polygon): Segment[][] => {
      const diffPlg = JSTSUtils.iDifference(plg, plg2);
      const diffEdges = []; // diff后还剩余的线段
      const ply2LoseSeg = []; // polygon2在diff过程中失去的线段
      const diffSegs = diffPlg.edges;

      for (const diffSeg of diffSegs) {
        if (thisPoly.insideSeg(diffSeg)) {
          ply2LoseSeg.push(diffSeg);
        } else {
          diffEdges.push(diffSeg);
        }
      }
      return [diffEdges, ply2LoseSeg];
    };
    const thisPoly = this.polygon;
    const remainderEdges: any[] = [];
    const discardSt: any[] = [];
    const otherEdgess: Segment[] = [];
    const iEdges = thisPoly.edges;
    const iSegss: Segment[][] = [iEdges];
    for (const otherSt of sts) {
      const otherPolygon = otherSt.polygon;
      // if (thisPoly.isBox() && otherPolygon.isBox()) {
      //   const thisBox = thisPoly.box;
      //   const otherBox = otherPolygon.box;
      //   if (thisBox.doubleCollinear(otherBox)) {
      //     discardSt.push(otherSt);
      //   }
      // }
      if (thisPoly.insidePolygon(otherPolygon)) {
        // 完全重叠的情况
        // discardSt.push(otherSt);
      } else {
        if (otherPolygon.insidePolygon(thisPoly)) {
          // 如果完全被其他多边形包围，直接过滤
          return remainderEdges;
        } else {
          if (!thisPoly.noIntersect(otherPolygon)) {
            // const iSegs = diffSt(thisPoly, otherPolygon);
            // iSegss.push(iSegs);
            const otherSegs = diffSt(otherPolygon, thisPoly);
            otherEdgess.push(...otherSegs[0]);
            const iSegs = new Segments(iEdges).subtractSegs(otherSegs[1]);
            iSegss.push(iSegs);
          } else {
            otherEdgess.push(...otherPolygon.edges);
          }
        }
      }
    }

    const edges = JSTSUtils.iIntersecionSegss(iSegss);
    // for (const otherSt of sts) {
    //   const otherPolygon = otherSt.polygon;
    //   // if (thisPoly.isBox() && otherPolygon.isBox()) {
    //   //   const thisBox = thisPoly.box;
    //   //   const otherBox = otherPolygon.box;
    //   //   if (thisBox.doubleCollinear(otherBox)) {
    //   //     discardSt.push(otherSt);
    //   //   }
    //   // }
    //   const diffPlg = JSTSUtils.iDifference(thisPoly, otherPolygon);
    //   if (!diffPlg.completeOverlap(thisPoly)) {
    //     // 又减到
    //     console.log(otherSt.rvtId);
    //   }
    //   edges = diffPlg.edges.filter((item) => !thisPoly.insideSeg(item));
    // }
    let filterOtherSt = sts;
    if (discardSt.length > 0) {
      filterOtherSt = sts.filter((item) => !discardSt.includes(item));
    }
    // const otherEdges = flatten(filterOtherSt.map((item) => item.polygon.edges));
    for (const edge of edges) {
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
    // return remainderEdges;
    // 过滤有梁在房间种的情况
    const roomBoxs = filterOtherSt
      .filter(
        (item) => item instanceof Room //||
        // item.stType === StType.Wall ||
        // item.stType === StType.Framing ||
        // item.stType === StType.Column
      )
      .map((item) => item.polygon.box.offset(1));
    return remainderEdges.filter(
      (rEdge) => !roomBoxs.some((item) => item.containSeg(rEdge)) //&&
      // this.parallelSeg(rEdge)
    );
  }

  private parallelSeg(seg: Segment): boolean {
    if (!this.midSeg) return true;
    return this.midSeg.parallel(seg);
  }

  public updateGeoData(): any {
    this.boundary = this.observeGeo.map((item) => new Point(item.x, item.y));
    return this.buildToData();
  }

  public observeGeo!: any[];
  /**
   * @author lianbo
   * @date 2021-01-10 14:59:15
   * @Description: 编辑完成后，保存的空间几何数据
   */
  public buildToData(): object {
    const worldPs: any[] = this.boundary.map((item) =>
      ConfigStructure.computeGeo(item)
    );
    // 一个立方体怎么根据一个面的改变，同步整个solid的数据
    return worldPs;
  }
}
