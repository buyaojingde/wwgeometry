import Graphics = PIXI.Graphics;
import { Debounce } from 'lodash-decorators';
import { computed } from 'mobx';
import ModelActiveData from '../../../../store/ModelActiveData';
import HookManager from '../../../../utils/HookManager';
import { IScene2D } from '../../../Interface/IScene';
import View2DData from '../../../../store/View2DData';

export default class CameraViewBase extends HookManager {
  protected mainContainer: Graphics;
  protected _enable: boolean = false;
  protected scene2D: IScene2D;

  constructor(scene2d: IScene2D) {
    super();
    this.scene2D = scene2d;
  }

  public getContainer() {
    return this.mainContainer;
  }

  public get enable() {
    return this._enable;
  }

  public set enable(val: boolean) {
    this._enable = val;
    val === false && this.dispose();
    val === true && this.initData();
  }

  @computed
  get scaleStyle() {
    return Math.min(View2DData.scaleNumber * 0.4, 1.2);
  }

  protected initData() {}

  protected dispose() {
    super.dispose();
  }

  @Debounce(200)
  protected closeActiveCameraChanging() {
    ModelActiveData.setChangingCamera(false);
  }

  protected activeCameraChanging() {
    ModelActiveData.setChangingCamera(true);
    this.closeActiveCameraChanging();
  }
}
