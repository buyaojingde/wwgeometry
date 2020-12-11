import { action, observable } from "mobx";
import ObserveVector2D from "../scene/Model/ObserveMath/ObserveVector2D";

class View2DData {
  /**
   * 2D视图 管理
   **/
  @observable
  public scaleNumber = 1;

  @observable
  public scale: ObserveVector2D = new ObserveVector2D(0.7, 0.7); // 比例
  @observable
  public position: ObserveVector2D = new ObserveVector2D(); // 位置

  @action.bound
  // @ts-ignore
  public setPosition(val) {
    this.position.copy(val);
  }

  @action.bound
  // @ts-ignore
  public setScale(val) {
    this.scale.copy(val);
  }
}

export default new View2DData();
