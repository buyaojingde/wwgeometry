import { Debounce } from 'lodash-decorators';
import { action, observable } from 'mobx';
import ObserveVector2D from '../scene/Model/ObserveMath/ObserveVector2D';
import Model2DActive from './Model2DActive';

class View2DData {
  /**
   * 2D视图 缩放,位置,房屋名称，面积，标尺管理
   **/
  @observable
  public scaleNumber = 1;

  @observable
  public scale: ObserveVector2D = new ObserveVector2D(0.7, 0.7); // 比例
  @observable
  public scaleHD: ObserveVector2D = new ObserveVector2D(0.7, 0.7); // 比例
  @observable
  public position: ObserveVector2D = new ObserveVector2D(); // 位置
  public positionHD: ObserveVector2D = new ObserveVector2D(); // 位置

  @observable
  public isShowRoomName = true; // 是否显示房间名称
  @observable
  public isShowRoomArea = true; // 是否显示房间面积
  @observable
  public isShowRoomRuler = true; // 是否显示房间标尺

  @action.bound
  public setPosition(val) {
    Model2DActive.setCameraChanging(true);
    // this.position = val;
    this.position.copy(val);

    this.closeCameraChanging();
  }

  @action.bound
  public setPositionHD(val) {
    Model2DActive.setCameraChanging(true);
    // this.position = val;
    this.positionHD.copy(val);

    this.closeCameraChanging();
  }

  @action.bound
  public setScale(val) {
    Model2DActive.setCameraChanging(true);
    // this.scale = val;
    this.scale.copy(val);

    this.closeCameraChanging();
  }

  @action.bound
  public setScaleHD(val) {
    Model2DActive.setCameraChanging(true);
    // this.scale = val;
    this.scaleHD.copy(val);

    this.closeCameraChanging();
  }

  @Debounce(100)
  public closeCameraChanging() {
    Model2DActive.setCameraChanging(false);
  }

  public setRoomNameVisable(val) {
    this.isShowRoomName = val;
  }

  public setRoomAreaVisable(val) {
    this.isShowRoomArea = val;
  }

  public setRoomRulerVisable(val) {
    this.isShowRoomRuler = val;
  }
}

export default new View2DData();
