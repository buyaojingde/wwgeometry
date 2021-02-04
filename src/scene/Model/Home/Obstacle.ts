import { observable } from 'mobx';
import ConfigStructure from '../../../utils/ConfigStructure';
import Matrix3x3 from '../../../utils/Math/geometry/Matrix3x3';
import Point from '../../../utils/Math/geometry/Point';
import Polygon from '../../../utils/Math/geometry/Polygon';
import { IDataObject } from '../../Interface/IDataObject';
import IBuildable from '../BaseInterface/IBuildable';
import ObjectIndex from '../BaseInterface/ObjectIndex';
import ObserveVector2D from '../ObserveMath/ObserveVector2D';
import Level from './Level';

export default class Obstacle
  extends ObjectIndex
  implements IBuildable, IDataObject {
  set zPlane(value: number) {
    this._zPlane = value;
  }
  public name!: string;
  get position(): ObserveVector2D {
    return this._position;
  }
  set boundary(value: any) {
    this._boundary = value;
    this._polygon = new Polygon(this._boundary);
    // const p = this._polygon.centerPoint;
    // this._position = new ObserveVector2D(p.x, p.y);
  }
  /**
   * @author lianbo
   * @date 2021-01-15 18:21:18
   * @Description: 这个boundary指的是障碍物的局部坐标的包围盒
   */
  private _boundary: any;
  private _height!: number;
  private _zPlane!: number;
  private _position: ObserveVector2D = new ObserveVector2D();
  private _rotate = 0;
  private _polygon!: Polygon;
  level!: Level;
  obPoints!: ObserveVector2D[];
  public constructor() {
    super();
  }
  @observable
  public isEdit = false;

  private _visible = true;

  get mat() {
    const mat = new Matrix3x3();
    mat.translate(this._position.x, this._position.y);
    mat.rotate(this._rotate);
    return mat;
  }
  get visible(): boolean {
    return this._visible;
  }

  set visible(value: boolean) {
    this._visible = value;
    this.emit('visibleEvent');
  }
  public get polygon(): Polygon {
    return new Polygon(this._boundary);
  }
  build(): void {}
  buildData(): any {
    const solid: any = {};
    solid.code = `${this.level.bimMapCode}-Obstacle-${this.rvtId}`;
    solid.id = this.rvtId;
    const faces: any[] = [];
    solid.faces = faces;
    const makeFace = (ps: any[]) => {
      const face: any = {};
      face.innerLoop = [];
      face.outLoop = [];
      const loop: any[] = ps;
      face.outLoop.push(loop);
      return face;
    };
    const bimBoundary = this._boundary.map((item: any) => {
      return ConfigStructure.computeGeo(item);
    });
    const topBoundary = bimBoundary.map((item: any) => {
      const top: any = {};
      top.x = item.x;
      top.y = item.y;
      top.z = this._zPlane + this._height * 10;
      return top;
    });
    const topFace = makeFace(topBoundary);
    solid.faces.push(topFace);

    const bottomBoundary = bimBoundary.map((item: any) => {
      const bottom: any = {};
      bottom.x = item.x;
      bottom.y = item.y;
      bottom.z = this._zPlane;
      return bottom;
    });

    for (let i = 0; i < topBoundary.length; i++) {
      const prev = i === 0 ? topBoundary.length - 1 : i - 1;
      const current = i;
      const faceBoundary = [topBoundary[prev], topBoundary[current]];
      faceBoundary.push(bottomBoundary[current], bottomBoundary[prev]);
      const face = makeFace(faceBoundary);
      solid.faces.push(face);
    }
    const bottomFace = makeFace(bottomBoundary);
    solid.faces.push(bottomFace);
    return { solids: [solid] };
  }

  public get quadData(): any {
    const box = this.polygon.box;
    return {
      data: this,
      x: box.min.x,
      y: box.min.y,
      width: box.width,
      height: box.height,
    };
  }

  setPosition(position: any) {
    // const origin = this._position;
    // const offset = { x: position.x - origin.x, y: position.y - origin.y };
    // this.obPoints.forEach((item) => {
    //   item.x = item.x + offset.x;
    //   item.y = item.y + offset.y;
    // });
    this.position.set(position.x, position.y);
  }

  public destroy() {
    this.emit('destroy');
  }

  public updateBoundary() {
    this.boundary = this.obPoints.map((item) => new Point(item.x, item.y));
  }

  public translateGeoEle(bimV: any, moveType: any, indices: number[]) {}

  setParams(obstacleData: any) {
    this.boundary = obstacleData.boundary;
    this._zPlane = obstacleData.zPlane;
    this._height = obstacleData.height;
  }

  updateBoundaryToWorld() {
    for (const op of this.obPoints) {
      op.set(op.x + this.position.x, op.y + this.position.y);
    }
    this.updateBoundary();
  }
}
