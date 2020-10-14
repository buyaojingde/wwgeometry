
import { Bind, Throttle } from 'lodash-decorators';
import { autorun, computed, observable, reaction } from 'mobx';
import * as PIXI from 'pixi.js';
import 'pixi-layers';
import { Application } from 'pixi.js';
import { Vector2 } from 'three';
import HomeTypeData from '../../model/HomeTypeData';
import Model2DActive from '../../store/Model2DActive';
import RouterData from '../../store/RouterData';
import View2DData from '../../store/View2DData';
import VueStoreData from '../../store/VueStoreData';
import { canvasDPI, IsPC } from '../../utils';
import LianBoTest from '../../utils/LianBoTest';
import DOMEventManager from '../3D/Manager/DOMEventManager';
import { Renderer2D } from '../Base/Renderer';
import SceneBase from '../Base/SceneBase';
import { IScene2D } from '../Interface/IScene';
import { drawGrid } from '../Math/GraphicsUtils';
import BoundingBox2D from '../Model/Geometry/BoundingBox2D';
import Vector2D from '../Model/Geometry/Vector2D';
import Stage = PIXI.display.Stage;
import Layer = PIXI.display.Layer;
import Graphics = PIXI.Graphics;
import WebGLRenderer = PIXI.WebGLRenderer;
import BaseEvent2D from './Events/Base';
import HomePlan from './Layer/HomePlan';
import { layerOrderGroups } from './Layer/LayerOrder';
import CameraController from './Manager/CameraController';
import PickupController from './Manager/PickupController';
import ViewController from './Manager/ViewController';
import { pointToVector, vectorToPoint } from './Utils';
import GraphicsTool from './Utils/GraphicsTool';
import PointObserve from './Utils/PointObserve';
import ViewObject from './ViewObject/ViewObject';
import ColumnMoveAction from './Events/ColumnMoveAction';
import SelectColumnAction from './Events/SelectColumnAction';

export interface IDOMRect {
  width: number;
  height: number;
  left: number;
  right: number;
  top: number;
  bottom: number;
  x?: number;
  y?: number;
}

export default class Scene2D extends SceneBase implements IScene2D {
  // public get shapeHardDesignController(): ShapeMoveControllerHD {
  //   return this._shapeHardDesignController;
  // }
  private allEvents: BaseEvent2D[] = [];

  @observable
  public scaleNumber = 1;

  @computed
  public get scale() {
    return View2DData.scale;
  }

  @computed
  public get position() {
    return View2DData.position;
  }

  public get homePlan(): HomePlan {
    return this._homePlan;
  }

  private static _instance: Scene2D; // 静态单例

  public viewController: ViewController; // 视图控制器
  public pickupController: PickupController; // 选择控制器
  public rendererDom: any; // 渲染节点
  public DOMEventListener: DOMEventManager; // Dom监听器
  public utilsDom: HTMLDivElement;
  protected _homePlan: HomePlan; //
  private scene: Application; // 场景
  private Vue: any; // Vue 模型
  private bindNode: HTMLElement; // 绑定的canvas对象
  private _grid: Graphics; // 原始形状
  // private _shapeHardDesignController: ShapeMoveControllerHD; // 硬装顶面控制器

  public static getInstance(): Scene2D {
    if (!this._instance) {
      this._instance = new Scene2D();
      this._instance.init();
    }
    return this._instance;
  }

  /**
   * 用于绑定Vue Dom元素
   * @param Vue
   */
  public async bindVue(Vue: any) {
    this.Vue = Vue;
    this.bindNode = Vue.$refs.container2d;

    if (!!this.bindNode && !this.bindNode.getElementsByTagName('canvas').length) {
      this.bindNode.appendChild(this.rendererDom);
      this.bindNode.appendChild(this.utilsDom);
    }

    this.initSwitchController();
    this.scene.start();
    this.DOMEventListener.on('resize', this.onWindowResize);
    this.DOMEventListener.on('keydown', this.onKeyDown.bind(this));

    // 重新切换到2D场景，则记录当前户型快照
    if (!this.homePlan.checkIsEmpty()) {
      this.recordDesign();
    }
    this.resize();

    this.focus();
  }

  @Throttle(200)
  @Bind
  public onWindowResize() {
    this.resize();
  }

  public onKeyDown(event) {
    if (event.code === 'Space') {
      this.resetView();
    }
  }

  /**
   * 初始化PIXI
   */
  public init() {
    const options = { backgroundColor: 0xe8e8e8, forceFXAA: true, antialias: true, resolution: this.resolution };
    this.scene = new Application(options);

    if (!(this.scene.renderer instanceof WebGLRenderer)) {
      this.scene.renderer.destroy();
      this.scene.renderer = Renderer2D;
    }
    this.stopRender();
    this.scene.stage = new Stage();
    Object.defineProperty(this.scene.stage, 'scaleNumber', {
      get: () => View2DData.scaleNumber,
    });
    this.scene.stage.name = 'scene2D';

    this.rendererDom = document.createElement('div');
    this.rendererDom.setAttribute('tabindex', '1'); // 让元素可以接受keydown事件
    this.rendererDom.appendChild(this.scene.view);

    // 工具类的Dom
    this.utilsDom = document.createElement('div');
    this.utilsDom.setAttribute('tabindex', '1');
    this.utilsDom.setAttribute('id', 'stage-2d-utils');

    this.DOMEventListener = new DOMEventManager(this.rendererDom);

    this.scene.renderer.plugins.interaction.setTargetElement(this.rendererDom);
    this.scene.renderer.plugins.interaction.resolution = this.resolution;

    this.refreshHomePlan();

    this.drawBaseInfo();

    this.initLayers();

    this.initController();

    this.loadHomeData('local').then(res => {
      this.resetView();
    });

    this.initSyncEvent();

  }

  public TEST() {
    console.log('test');
    LianBoTest.testMain();
    return;
  }

  public lineWidth: number = 0;

  public initSyncEvent() {
    this.scene.stage.position = new PointObserve();

    autorun(() => {
      // 同步Scene2D中的scale
      const { x, y } = this.scale;

      this.scene.stage.scale.set(x, y);
      this.lineWidth = 2.0 / x;
      this.lineWidth = this.lineWidth < 10 ? this.lineWidth : 10;
    });
    autorun(() => {
      // 同步Scene2D中的scale
      // console.log('this.position:' + this.position);
      this.scene.stage.position.copy(this.position);
      // Model2DActive.panView2D = true;
    });

    reaction(
      () => this.scale.x,
      () => this.setBorderLineStyle(),
      {
        fireImmediately: true,
      },
    );

    window['TEST'] = () => {
      this.TEST();
    };
  }

  public get resolution() {
    return canvasDPI;
  }

  // @Throttle(200)
  protected setBorderLineStyle() {
    View2DData.scaleNumber = parseFloat((1 / this.scale.x).toFixed(2));
    // this._grid.updateLineStyle({ lineWidth: this.scaleNumber });
  }

  public resize(width: number = 0, height: number = 0) {
    if (!width && !height) {
      if (!this.bindNode) {
        return;
      }
      const element = this.bindNode;
      width = element.clientWidth;
      height = element.clientHeight;
    }

    this.scene.renderer.resize(width, height);
    this.rendererDom.width = width * canvasDPI;
    this.rendererDom.height = height * canvasDPI;
    // 画布零点位置为摄像机位置，画布零点放置在左上角，是为了墙体处于屏幕中间
    setTimeout(() => this.resetView());

    this.emit('resize', width, height);
  }

  /**
   * 重置视图到户型中央
   */
  public resetView() {
    if (!this.homePlan || !this.rendererDom) {
      return;
    }
    let levelBoundingBox = null;

    if (!levelBoundingBox) {
      // 若levelBoundingBox为空，返回默认BoundingBox
      levelBoundingBox = new BoundingBox2D().setFromCenterAndSize(new Vector2(), new Vector2D(1000, 800));
    }
    // const levelBoundingBox = this.home.curLevel.getBondingBox();
    const rect: any = (this.rendererDom as HTMLElement).getBoundingClientRect();
    if (!levelBoundingBox || !rect || !(rect.width * rect.height)) {
      return;
    }
    this.setResetScale(levelBoundingBox, rect);
    this.setResetPosition(levelBoundingBox, rect);
  }

  public resetViewBox(levelBoundingBox: BoundingBox2D = null, rect: IDOMRect = null) {
    if (!rect) {
      rect = (this.rendererDom as HTMLElement).getBoundingClientRect() as any;
    }
    if (!levelBoundingBox || !rect) {
      return;
    }
    this.setResetScale(levelBoundingBox, rect);
    this.setResetPosition(levelBoundingBox, rect);
  }

  private setResetScale(levelBoundingBox: BoundingBox2D, rect: IDOMRect = null) {
    // calculate the house size
    const sizeVec = levelBoundingBox.getSize(new Vector2());

    // calculate the screen size
    const screenSize = new Vector2D(rect.width, rect.height);

    // calculate the padding
    screenSize.multiplyScalar(0.7);

    // select the minimum side
    const scale = Math.min(screenSize.x / sizeVec.x, screenSize.y / sizeVec.y);

    this.scale.set(scale);
  }

  private setResetPosition(levelBoundingBox: BoundingBox2D, rect: IDOMRect = null) {
    // calculate the house center position
    const point = vectorToPoint(levelBoundingBox.getCenter());
    const stage = this.getStage();
    const pointG = stage.toGlobal(point);

    if (!this.pickupController) {
      return null;
    }

    // calculate the screen center position
    const pointCenter = this.pickupController.getPoint(rect.left + rect.width / 2, rect.top + rect.height / 2, true);
    if (!Number.isFinite(pointCenter.x) || !Number.isFinite(pointCenter.y)) {
      return;
    }

    const offset = pointToVector(pointCenter).subtract(pointToVector(pointG));

    this.position.set(this.position.x + offset.x, this.position.y + offset.y);
  }

  public clear() {
    // this.home = null;
    this.homePlan.clear();
    this.recordDesign();
  }

  /**
   *记录当前的户型数据，并添加到户型快照到撤销恢复数组中
   */
  public recordDesign() {
    const flag = /^hardCeilStage|wallStage|floorStage|cubeBoxStage$/.test(RouterData.routerNow.name);
    if (flag) {
      return;
    }
  }

  public getApplication() {
    return this.scene;
  }

  @Throttle(100)
  public renderer() {
    this.scene.render();
  }

  public render() {
    this.scene.render();
  }

  public startRender() {
    this.scene.start();
  }

  public stopRender() {
    this.scene.stop();
  }

  public getStage() {
    return this.scene.stage as Stage;
  }

  public getRenderer() {
    return this.scene.renderer;
  }

  public getController() {
    return this.viewController;
  }

  public stop() {
    this.DOMEventListener.off('resize', this.onWindowResize);
    this.DOMEventListener.off('keydown', this.onKeyDown.bind(this));
    this.stopRender();
    while (this.allEvents.length) {
      this.allEvents.pop().destroy();
    }
  }

  protected drawBaseInfo() {
    this._grid = new Graphics();
    drawGrid(this._grid, { lineWidth: parseFloat('' + 1 / this.scale.x) });
    this.scene.stage.addChild(this._grid);
    this.scene.stage.addChild(GraphicsTool.drawZeroPoint());
// this.scene.stage.addChild();
  }

  public remove(object: ViewObject) {
    this.scene.stage.removeChild(object);
  }

  /**
   * 加载户型数据
   */
  private async loadHomeData(from?: string, path?: any) {
    try {
      this.home = await HomeTypeData.getHome(from, path);
      this.homePlan.render();
      this.resetView();
      VueStoreData.setHomeEmpty(this.homePlan.checkIsEmpty());
    } catch (e) {
      console.log(e);
    }
  }

  private initLayers() {
    const stage = this.getStage();
    for (const key in layerOrderGroups) {
      if (layerOrderGroups.hasOwnProperty(key)) {
        const group = layerOrderGroups[key];
        const layer: Layer = new Layer(group);
        layer.name = group.name;
        stage.addChild(layer);
      }
    }
  }

  private initSwitchController() {
    this.allEvents.push(
    );
  }

  private initController() {
    this.viewController = new ViewController(this);
    this.pickupController = new PickupController(this);
    this.pickupController.enable = true;
    this.pickupController.layer2D = null;

    new CameraController(this);

//region column
    new ColumnMoveAction(this);
    new SelectColumnAction(this);
//endregion
  }

  public setHomePlan(homePlan: HomePlan) {
    const stage = this.getStage();

    if (this._homePlan) {
      this._homePlan.destroy();
    }

    this._homePlan = homePlan;

    stage.addChildAt(homePlan.container, 0);
  }

  public refreshHomePlan() {
    this.setHomePlan(new HomePlan(this));

    this._homePlan.render();
    Model2DActive.init();
  }

  public getHomeContainer() {
    return this._homePlan.container;
  }

  public focus() {
    if (VueStoreData.enableStage2D) {
      this.rendererDom.focus();
    }
  }
}
