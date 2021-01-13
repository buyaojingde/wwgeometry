import { observable } from 'mobx';
import ConfigStructure from '../../../utils/ConfigStructure';
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
  public name!: string;
  get position(): ObserveVector2D {
    return this._position;
  }
  set boundary(value: any) {
    this._boundary = value;
    this._polygon = new Polygon(this._boundary);
    const p = this._polygon.centerPoint;
    this._position = new ObserveVector2D(p.x, p.y);
  }
  private _boundary: any;
  private _height: number;
  private _zPlane: number;
  private _position!: ObserveVector2D;
  private _polygon!: Polygon;
  level!: Level;
  obPoints!: ObserveVector2D[];
  public constructor(obstacle: any = ConfigStructure.obstacleData) {
    super();
    this.boundary = obstacle.boundary;
    this._zPlane = obstacle.zPlane;
    this._height = obstacle.height;
  }
  @observable
  public isEdit = false;

  private _visible = true;

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
      const geo = ConfigStructure.computeGeo(item);
    });
    const topBoundary = bimBoundary.map((item: any) => {
      item.z = this._zPlane + this._height;
    });
    const topFace = makeFace(topBoundary);
    solid.faces.push(topFace);

    const bottomBoundary = bimBoundary.map((item: any) => {
      item.z = this._zPlane;
    });

    for (let i = 0; i < topBoundary.length; i++) {
      const prev = i === 0 ? topBoundary[topBoundary.length - 1] : i - 1;
      const current = i;
      const faceBoundary = [topBoundary[prev], topBoundary[current]];
      faceBoundary.push(bottomBoundary[current], bottomBoundary[prev]);
      const face = makeFace(faceBoundary);
      solid.faces.push(face);
    }
    const bottomFace = makeFace(bottomBoundary);
    solid.faces.push(bottomFace);
    return solid;
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

  public updateBoundary(og: any[]) {
    this.boundary = og.map((item) => new Point(item.x, item.y));
  }

  public translateGeoEle(bimV: any, moveType: any, indices: number[]) {}
}
