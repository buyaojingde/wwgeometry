import { observable } from 'mobx';
import Point from '../../../utils/Math/geometry/Point';
import Polygon from '../../../utils/Math/geometry/Polygon';
import Segment from '../../../utils/Math/geometry/Segment';
import ObjectNamed from '../BaseInterface/ObjectNamed';
import Level from './Level';
import Structure from './Structure';

/**
 * @author lianbo
 * @date 2020-12-25 14:55:23
 * @Description: 房间的墙，直观的墙，不是Structure里的墙，一般来说，一面墙就是一条线段
 */
class RoomWall {
  public sts: Structure[];
  public wall: Segment;
  public constructor(sts: Structure[], seg: Segment) {
    this.sts = sts;
    this.wall = seg;
  }

  public addSt(st: Structure) {
    if (this.sts.includes(st)) return;
    this.sts.push(st);
  }
}

export default class Room extends ObjectNamed {
  get level(): Level {
    return this._level;
  }

  set level(value: Level) {
    this._level = value;
  }
  get topFaceGeo(): any {
    return this._topFaceGeo;
  }

  set topFaceGeo(value: any) {
    this._topFaceGeo = value;
  }
  get active(): boolean {
    return this._active;
  }

  set active(value: boolean) {
    this._active = value;
  }

  get rvtName(): string {
    return this._rvtName;
  }

  set rvtName(value: string) {
    this._rvtName = value;
  }
  public destroyed = false;

  constructor(roomBoundary: Point[]) {
    super();
    this.boundary = roomBoundary;
    const polygon = new Polygon(this.boundary);
    const edges = polygon.edges;
    for (const edge of edges) {
      this.addWall(new RoomWall([], edge));
    }
  }
  private _topFaceGeo: any;

  @observable
  private _visible = true;
  private _active = true;

  private _rvtName = '';

  get visible(): boolean {
    return this._visible;
  }
  set visible(value: boolean) {
    this._visible = value;
  }

  private _boundary!: Point[];

  get boundary(): Point[] {
    return this._boundary;
  }

  set boundary(value: Point[]) {
    this._boundary = value;
  }

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
  public get polygon(): Polygon {
    return new Polygon(this.boundary);
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

  private _relStructures: RoomWall[] = [];

  public addWall(wall: RoomWall): boolean {
    if (this._relStructures.includes(wall)) {
      return false;
    }
    this._relStructures.push(wall);
    return true;
  }

  public addStructure(edge: Segment, st: Structure) {
    for (const wallData of this._relStructures) {
      if (wallData.wall.containSeg(edge)) {
        wallData.addSt(st);
      }
    }
  }

  public allSts(): Structure[] {
    const sts: Structure[] = [];
    for (const relStructure of this._relStructures) {
      for (const st of relStructure.sts) {
        if (sts.includes(st)) continue;
        sts.push(st);
      }
    }
    return sts;
  }

  private _level!: Level;
}
