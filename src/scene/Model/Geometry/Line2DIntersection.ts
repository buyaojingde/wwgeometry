import Vector2D from './Vector2D';

export default class Line2DIntersection {
  private _U: number[];
  private _V: number[];

  constructor(param1: number = 2) {
    this._status = param1;
    this._U = [];
    this._V = [];
    this._point = new Vector2D();
  }

  // extends Object
  private _status: number;

  get status(): number {
    return this._status;
  }

  set status(value: number) {
    this._status = value;
  }

  private _point: Vector2D;

  get point(): Vector2D {
    return this._point;
  }

  set point(value: Vector2D) {
    this._point = value;
    return;
  }

  get u(): number[] {
    return this._U;
  }

  set u(value: number[]) {
    this._U = value;
    return;
  }

  get v(): number[] {
    return this._V;
  }

  set v(value: number[]) {
    this._V = value;
    return;
  }
}
