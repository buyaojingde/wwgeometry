/**
 * * by lianbo.guo
 **/
import ObservablePoint = PIXI.ObservablePoint;
import { action, observable } from "mobx";
import Vector2D from "../../Model/Geometry/Vector2D";

export default class PointObserve extends ObservablePoint {
  @observable
  public _x: number;
  @observable
  public _y: number;

  public toVector(): Vector2D {
    const { _x, _y } = this;
    return new Vector2D(_x, _y);
  }

  @action
  public set(x?: number, y?: number): this {
    return super.set(x, y);
  }
}
