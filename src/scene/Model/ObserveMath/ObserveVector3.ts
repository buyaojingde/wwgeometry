/**
 * * by lianbo.guo
 **/
import { action, observable } from "mobx";
import MathUtils from "../../../utils/Math/math/MathUtils";

export default class ObserveVector3 {
  @observable
  public x: number;
  @observable
  public y: number;
  @observable
  public z: number;

  public constructor(x?: number, y?: number, z?: number) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
  }

  @action.bound
  public copy(v: any): ObserveVector3 {
    MathUtils.isNum(v.x) && (this.x = v.x);
    MathUtils.isNum(v.y) && (this.y = v.y);
    MathUtils.isNum(v.z) && (this.z = v.z);
    // this.x = v.x
    // this.y = v.y
    // this.z = v.z
    return this;
  }

  @action.bound
  public set(x: number, y: number, z: number): ObserveVector3 {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }
}
