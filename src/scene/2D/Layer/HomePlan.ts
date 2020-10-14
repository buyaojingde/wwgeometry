import 'pixi-layers';
import * as PIXI from 'pixi.js';
import Stage = PIXI.display.Stage;
import RouterData from '../../../store/RouterData';
import ColumnLayer from './ColumnLayer';
import View2DData from '../../../store/View2DData';

export enum HomeLayers {
  Column,
}
const SCENE_2D = 'scene2D';
export default class HomePlan2D {
  private _columnLayer: ColumnLayer;
  private _layers: object;
  // private container: any;
  public container: Stage;
  private scene: any;

  public constructor(scene: any) {
    console.log('new HomePlan');
    this.scene = scene;
    this.container = new Stage();
    this.container.interactive = false;
    this.container.name = SCENE_2D + '_HP';
    Object.defineProperty(this.container, 'scaleNumber', {
      get: () => View2DData.scaleNumber,
    });
    const homePlanScene = {
      getStage: () => this.container,
      getScene: () => this.scene,
    };
    Object.defineProperty(homePlanScene, 'home', {
      get: () => scene.home,
    });

    this._columnLayer = new ColumnLayer(homePlanScene);
    this.init();
  }

  protected init() {
    this._layers = {
      [HomeLayers.Column]: this._columnLayer,
    };
  }


  public get columnLayer(): ColumnLayer {
    return this._columnLayer;
  }


  public get allLayers(): any {
    return this._layers;
  }

  public render(ignoreLayerList: any[] = []) {
    Object.values(this._layers)
      .filter(layer => !ignoreLayerList.some(layerClass => layer instanceof layerClass))
      .forEach(layer => layer && layer.render());

    this.checkLayerShow(ignoreLayerList);
  }

  public load() {
    Object.values(this._layers).forEach(layer => layer.load());
  }

  public clear(): void {
    Object.values(this._layers).forEach(layer => {
      layer.clear();
      layer.disposeArr();
    });
  }

  public clearMaps() {
    Object.values(this._layers).forEach(layer => layer.clearMap());
  }

  public checkIsEmpty() {
    return this.scene.home.curLevel.isEmptyLevel();
  }

  public save(): void {
  }

  public get layers() {
    return this._layers;
  }

  /**
   * 销毁视图层层
   */
  public destroy() {
    this.container.parent && this.container.parent.removeChild(this.container);
    Object.values(this._layers).forEach(layer => layer.destroy && layer.destroy());
    this.scene = null;
    this.clearMaps();
  }

  /**
   * 检查Layer显示
   */
  public checkLayerShow(ignoreLayerList: any[] = []) {
    Object.values(this._layers).forEach(layer => {
      if (ignoreLayerList.includes(layer)) {
        return;
      }
      if (!!layer && !!layer.checkLayerShow) {
        this.hideLayer(layer);
        const routerNow = RouterData.routeNow;
        if (routerNow) {
          layer.checkLayerShow(routerNow.name);
        }
      }
    });
  }

  /**
   * 路由离开时检查处理数据
   * @param routeName
   * @param ignoreLayerList
   */
  public checkLeaveLayerShow(routeName: string, ignoreLayerList: any[] = []) {
    Object.values(this._layers).forEach(layer => {
      if (ignoreLayerList.includes(layer)) {
        return;
      }
      if (!!layer.checkLeaveLayerShow) {
        const routerNow = RouterData.routeNow;
        if (routerNow) {
          layer.checkLeaveLayerShow(routerNow.name);
        }
      }
    });
  }

  /**
   * 隐藏层的显示
   */
  public hideLayer(layer) {
    const layerObjects = layer.getObjects();
    layerObjects.forEach(val => {
      if (val.visible !== undefined) {
        val.visible = false;
      }
      if (val.interactive !== undefined) {
        val.interactive = false;
      }
    });
  }
}
