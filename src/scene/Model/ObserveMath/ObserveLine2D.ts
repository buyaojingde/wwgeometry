/**
* * by lianbo.guo
 **/
import Line2D from '../Geometry/Line2D';
import Vector2D from '../Geometry/Vector2D';
import ObserveVector2D from './ObserveVector2D';

export default class ObserveLine2D extends Line2D {
  protected _start: ObserveVector2D;
  protected _end: ObserveVector2D;

  public get start(): ObserveVector2D {
    return this._start;
  }

  public get end(): ObserveVector2D {
    return this._end;
  }

  constructor(vec1: Vector2D, vec2: Vector2D) {
    super(vec1, vec2);

    this._start = new ObserveVector2D().copy(vec1);
    this._end = new ObserveVector2D().copy(vec2);
  }
}
