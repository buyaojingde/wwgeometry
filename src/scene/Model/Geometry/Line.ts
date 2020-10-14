import Vector2D from './Vector2D';

export default class Line {
  // extends Element
  private static SELECT_WIDE: number = 7;
  private static SELECTED_SHADOW: number = 5;
  private _start: Vector2D;
  private _end: Vector2D;
  private _color: number;

  constructor(x1: number, y1: number, x2: number, y2: number) {
    // super();
    this._start.x = x1;
    this._start.y = y1;
    this._end.x = x2;
    this._end.y = y2;

    this._color = 0xffffff;
  }

  get start() {
    return this._start;
  }

  set start(value: Vector2D) {
    this._start = value;
  }

  get end() {
    return this._start;
  }

  set end(value: Vector2D) {
    this._start = value;
  }
}
