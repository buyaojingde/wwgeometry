/**
 * * by lianbo.guo
 **/
import { action, observable } from "mobx";
import Vector2 from "../../../utils/Math/geometry/Vector2";

export default class ObserveVector2D extends Vector2 {
  @observable
  public x!: number;

  @observable
  public y!: number;

  @action.bound
  public copy(v: Vector2): this {
    return super.copy(v);
  }

  @action.bound
  public set(x: number, y: number): this {
    return super.set(x, y);
  }
}
