/**
 * * by lianbo.guo
 **/
import { action, observable } from 'mobx';

export default class ObserveVector2D {
  @observable
  public x!: number;

  @observable
  public y!: number;

  public constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  @action.bound
  public copy(v: any): this {
    this.set(v.x, v.y);
    return this;
  }

  @action.bound
  public set(x: number, y: number): this {
    this.x = x;
    this.y = y;
    return this;
  }
}
