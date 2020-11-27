/**
 * * by lianbo.guo
 **/
import { computed, observable } from 'mobx';

class VueStoreData {
  @observable
  public unitScale = 10; // 全局单位 相对于cm 的放大倍数
  public enableStage2D: boolean = false; // 开启2D场景

  @computed
  public get unit() {
    switch (this.unitScale) {
      case 10:
        return 'mm';
      case 1:
        return 'cm';
      case 0.01:
        return 'm';

      default:
        return '';
    }
  }

  public setEnableStage2D(b: boolean) {
    this.enableStage2D = b;
  }
}

export default new VueStoreData();
