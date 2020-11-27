import RoomLayer from '@/scene/2D/Layer/RoomLayer';
import 'pixi-layers';
import * as PIXI from 'pixi.js';
import View2DData from '../../../store/View2DData';
import StructureLayer from './StructureLayer';
import Stage = PIXI.display.Stage;

export enum HomeLayers {
  Structure,
  Room,
}

const SCENE_2D = 'scene2D';
export default class HomePlan2D {
  // private container: any;
  public container: Stage;
  private scene: any;
  private _roomLayer: RoomLayer;

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

    this._structureLayer = new StructureLayer(homePlanScene);
    this._roomLayer = new RoomLayer(homePlanScene);
    this.init();
  }

  private _structureLayer: StructureLayer;

  public get structureLayer(): StructureLayer {
    return this._structureLayer;
  }

  // @ts-ignore
  private _layers: object;

  public get layers() {
    return this._layers;
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

  public save(): void {}

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
        layer.checkLayerShow('');
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
        layer.checkLeaveLayerShow('');
      }
    });
  }

  /**
   * 隐藏层的显示
   */
  // @ts-ignore
  public hideLayer(layer) {
    const layerObjects = layer.getObjects();
    // @ts-ignore
    layerObjects.forEach(val => {
      if (val.visible !== undefined) {
        val.visible = false;
      }
      if (val.interactive !== undefined) {
        val.interactive = false;
      }
    });
  }

  protected init() {
    this._layers = {
      [HomeLayers.Structure]: this._structureLayer,
      [HomeLayers.Room]: this._roomLayer,
    };
  }
}
