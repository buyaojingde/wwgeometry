import { reaction } from "mobx";
import { LayerOrder, layerOrderGroups } from "../Layer/LayerOrder";
import BaseController from "./BaseController";
import Container = PIXI.Container;

/**
 * 平面图的摄像机控制器
 * * by lianbo.guo
 **/
export default class CameraController extends BaseController {
  // @ts-ignore
  private view: Container;

  public constructor(scene: any) {
    super(scene);

    this.controllerGroup = layerOrderGroups[LayerOrder.Camera];

    this.initControllerView();

    this.switchArr.push(
      reaction(
        () => {
          return false;
        },
        (enable) => {
          this.enable = enable;
        },
        { fireImmediately: true }
      )
    );
  }

  public dispose() {
    super.dispose();
    this.view.visible = false;
  }

  public initEvents() {
    this.view.visible = true;
  }

  private initControllerView() {
    this.view = new Container();
    this.view.parentGroup = this.controllerGroup;

    this.view.visible = false;

    this.stage.addChild(this.view);
  }
}
