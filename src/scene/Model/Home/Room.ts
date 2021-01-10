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
class VirtualWall {
  public sts: Structure[];
  public wall: Segment;
  public width = 10;
  @observable
  public visible = false;
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
  @observable
  public isEdit = false;
  get virtualWalls(): VirtualWall[] {
    return this._virtualWalls;
  }
  get position(): Point {
    return this.polygon.box.center;
  }
  set polygon(value: Polygon) {
    this._polygon = value;
  }
  get polygon() {
    return this._polygon;
  }
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
    const edges = this._polygon.edges;
    for (const edge of edges) {
      this.addWall(new VirtualWall([], edge));
    }
  }
  private _topFaceGeo: any;

  @observable
  private _visible = true;
  private _active = true;

  private _rvtName = '';
  private _polygon!: Polygon;

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
    this._polygon = new Polygon(this._boundary);
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

  private _virtualWalls: VirtualWall[] = [];

  public addWall(wall: VirtualWall): boolean {
    if (this._virtualWalls.includes(wall)) {
      return false;
    }
    this._virtualWalls.push(wall);
    return true;
  }

  public addStructure(edge: Segment, st: Structure) {
    for (const wallData of this._virtualWalls) {
      if (wallData.wall.containSeg(edge)) {
        wallData.addSt(st);
      }
    }
  }

  public allSts(): Structure[] {
    const sts: Structure[] = [];
    for (const relStructure of this._virtualWalls) {
      for (const st of relStructure.sts) {
        if (sts.includes(st)) continue;
        sts.push(st);
      }
    }
    return sts;
  }

  /**
   * @author lianbo
   * @date 2020-12-31 16:21:00
   * @Description: 设置相应的墙的厚度
   */
  public setVirtualWallWidth(wall: VirtualWall, width: number): void {
    wall.width = width;
  }

  private _level!: Level;

  blurred() {
    this.emit('blurred');
  }

  public observeGeo!: any[];
}
