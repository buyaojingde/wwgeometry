/**
* * by lianbo.guo
 **/
import { action, observable } from 'mobx';
import { Vector3 } from 'three';
import Vector3D from '../Geometry/Vector3D';

export default class ObserveVector3D extends Vector3D {
  @observable
  protected _x: number;
  @observable
  protected _y: number;
  @observable
  protected _z: number;

  @action.bound
  public copy(v: this | Vector3D | Vector3): this {
    super.copy(v as any);
    return this;
  }

  @action.bound
  public set(x: number, y: number, z: number): this {
    return super.set(x, y, z);
  }
}
