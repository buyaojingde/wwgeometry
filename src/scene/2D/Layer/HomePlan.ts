import View2DData from '../../../store/View2DData';
import BimElementLayer from './BimElementLayer';
import RoomLayer from './RoomLayer';
import StructureLayer from './StructureLayer';

export enum HomeLayers {
  Structure,
  Room,
}

const SCENE_2D = 'scene2D';
export default class HomePlan2D {
  // private container: any;
  public container: PIXI.Container;
  private scene: any;
  private _roomLayer!: RoomLayer;
  private _bimEleLayer!: BimElementLayer;

  public constructor(scene: any) {
    console.log('new HomePlan');
    this.scene = scene;
    this.container = new PIXI.Container();
    this.container.sortableChildren = true;
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
    // this.createStructureLayer(homePlanScene);
    // this.createRoomLayer(homePlanScene);

    // this._structureLayer = new StructureLayer(homePlanScene);
    // this._roomLayer = new RoomLayer(homePlanScene);
    this.createBimLayer();
    // this.init();
  }

  private createBimLayer() {
    this._bimEleLayer = new BimElementLayer(
      this.scene.home.curLevel.allElements
    );
    Object.defineProperty(this._layers, 'bimEles', {
      value: this._bimEleLayer,
      enumerable: true,
    });
    this._bimEleLayer.attachContainer(this.container);
  }

  private _structureLayer!: StructureLayer;

  public get structureLayer(): StructureLayer {
    return this._structureLayer;
  }

  private _layers: object = {};

  public get layers() {
    return this._layers;
  }

  public get allLayers(): any {
    return this._layers;
  }

  public render(ignoreLayerList: any[] = []) {
    const allLayers = Object.values(this._layers).filter(
      (layer) =>
        !ignoreLayerList.some((layerClass) => layer instanceof layerClass)
    );
    for (const allLayer of allLayers) {
      allLayer && allLayer.render();
    }
    // this.checkLayerShow(ignoreLayerList);
  }

  public load() {
    Object.values(this._layers).forEach((layer) => layer.load());
  }

  public clear(): void {
    Object.values(this._layers).forEach((layer) => {
      layer.clear();
      layer.disposeArr();
    });
  }

  public clearMaps() {
    Object.values(this._layers).forEach((layer) => layer.clearMap());
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
    Object.values(this._layers).forEach(
      (layer) => layer.destroy && layer.destroy()
    );
    this.scene = null;
    this.clearMaps();
  }

  /**
   * 检查Layer显示
   */
  public checkLayerShow(ignoreLayerList: any[] = []) {
    Object.values(this._layers).forEach((layer) => {
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
    Object.values(this._layers).forEach((layer) => {
      if (ignoreLayerList.includes(layer)) {
        return;
      }
      if (layer.checkLeaveLayerShow) {
        layer.checkLeaveLayerShow('');
      }
    });
  }

  /**
   * 隐藏层的显示
   */
  public hideLayer(layer: any) {
    const layerObjects = layer.getObjects();
    layerObjects.forEach((val: any) => {
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

  private createStructureLayer(homePlanScene: {
    getStage: () => PIXI.Container;
    getScene: () => any;
  }) {
    this._structureLayer = new StructureLayer(homePlanScene);
    Object.defineProperty(this._layers, 'structure', {
      value: this._structureLayer,
      enumerable: true,
    });
  }

  private createRoomLayer(homePlanScene: {
    getStage: () => PIXI.Container;
    getScene: () => any;
  }) {
    this._roomLayer = new RoomLayer(homePlanScene);
    Object.defineProperty(this._layers, 'room', {
      value: this._roomLayer,
      enumerable: true,
    });
  }
}
