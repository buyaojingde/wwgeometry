/**
* * by lianbo.guo
 **/
import { action, observable } from 'mobx';
import { Vector2 } from 'three';
import Vector2D from '../Geometry/Vector2D';

export default class ObserveVector2D extends Vector2D {
  @observable
  protected _x: number;

  @observable
  protected _y: number;

  @action.bound
  public copy(v: this | Vector2D | Vector2): this {
    super.copy(v as any);
    return this;
  }

  @action.bound
  public set(x: number, y?: number): this {
    return super.set(x, y);
  }
}
