import { observable } from 'mobx';
import Point from '../../../utils/Math/geometry/Point';
import Polygon from '../../../utils/Math/geometry/Polygon';
import ObjectNamed from '../BaseInterface/ObjectNamed';
import Level from './Level';
import Structure from './Structure';

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
  get relStructures(): Structure[] {
    return this._relStructures;
  }

  set relStructures(value: Structure[]) {
    this._relStructures = value;
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

  constructor() {
    super();
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

  private _relStructures: Structure[] = [];

  public addStructure(st: Structure): boolean {
    if (this._relStructures.includes(st)) {
      return false;
    }
    this._relStructures.push(st);
    return true;
  }

  private _level!: Level;
}
