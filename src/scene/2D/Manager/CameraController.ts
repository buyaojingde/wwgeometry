import { reaction } from 'mobx';
import CameraData, { ViewType } from '../../../store/CameraData';
import RouterData from '../../../store/RouterData';
import VueStoreData from '../../../store/VueStoreData';
import Container = PIXI.Container;
import { LayerOrder, layerOrderGroups } from '../Layer/LayerOrder';
import CameraViewBase from '../ViewObject/CameraOverlook/CameraViewBase';
import OribitLayer from '../ViewObject/CameraOverlook/OribitLayer';
import BaseController from './BaseController';

/**
 * 平面图的摄像机控制器
* * by lianbo.guo
 **/
export default class CameraController extends BaseController {
  private view: Container;
  private cameraViews: { overlook: OribitLayer };
  public constructor(scene: any) {
    super(scene);

    this.controllerGroup = layerOrderGroups[LayerOrder.Camera];

    this.initControllerView();

    this.switchArr.push(
      reaction(
        () => {
          const router = RouterData.routeNow;
          return router.name === 'Preview';
        },
        enable => {
          this.enable = enable;
        },
        { fireImmediately: true },
      ),
    );
  }

  public initEvents() {
    this.view.visible = true;

    this.disposeArr.push(
      reaction(
        () => {
          const viewType = CameraData.viewType;
          const tabShow = VueStoreData.previewTabShow;
          if (viewType === ViewType.ThreeD) {
            return 'overlook';
          } else {
            return tabShow;
          }
        },
        val => {
          this.switchView(val);
        },
        { fireImmediately: true },
      ),
    );
  }

  public dispose() {
    super.dispose();
    this.view.visible = false;
    this.hideAllCameras();
  }

  private initControllerView() {
    this.view = new Container();
    this.view.parentGroup = this.controllerGroup;

    this.cameraViews = {
      overlook: new OribitLayer(this.scene),
    };

    Object.values(this.cameraViews).forEach((cameraView: CameraViewBase) => {
      if(cameraView){
        this.view.addChild(cameraView.getContainer());
      }
    });

    this.view.visible = false;

    this.stage.addChild(this.view);
  }

  private switchView(val: string) {
    this.hideAllCameras();

    const cameraView = this.cameraViews[val];

    cameraView.getContainer().visible = true;
    cameraView.enable = true;
    // const action = this.getAction(val);
  }

  private getAction(val: string): string {
    switch (val) {
      case 'normal':
      case 'panorama':
        return 'switchToRoam';
      case 'overlook':
        return 'switchTo3D';
      default:
        return null;
    }
  }

  private hideAllCameras() {
    Object.values(this.cameraViews).forEach(cameraView => {
      cameraView.enable = false;
      cameraView.getContainer().visible = false;
    });
  }
}
