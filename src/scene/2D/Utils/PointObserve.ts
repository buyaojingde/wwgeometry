/**
* * by lianbo.guo
 **/
import Point = PIXI.Point;
import { action, observable } from 'mobx';
import Vector2D from '../../Model/Geometry/Vector2D';

export default class PointObserve extends Point {
  @observable
  public x: number;
  @observable
  public y: number;

  public toVector(): Vector2D {
    const { x, y } = this;
    return new Vector2D(x, y);
  }

  @action
  public set(x?: number, y?: number) {
    super.set(x, y);
  }
}
