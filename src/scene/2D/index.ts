import EditEdgeAction from "../../scene/2D/Events/EditEdgeAction";
import EditVerticesAction from "../../scene/2D/Events/EditVerticesAction";
import SelectRoomAction from "../../scene/2D/Events/SelectRoomAction";
import SubjectAction from "../../scene/2D/Events/SubjectAction";
import Structure, { StType } from "../../scene/Model/Home/Structure";
import ConfigStructure from "../../utils/ConfigStructure";
import { EventEnum, EventMgr } from "../../utils/EventManager";
import Constant from "../../utils/Math/contanst/constant";
import Point from "../../utils/Math/geometry/Point";
import MathUtils from "../../utils/Math/math/MathUtils";
import Quadtree from "../../utils/Math/math/Quadtree";
import { Bind, Throttle } from "lodash-decorators";
import { autorun, computed, observable, reaction } from "mobx";
import "pixi-layers";
import * as PIXI from "pixi.js";
import { Application } from "pixi.js";
import { Vector2 } from "three";
import HomeTypeData from "../../model/HomeTypeData";
import Model2DActive from "../../store/Model2DActive";
import View2DData from "../../store/View2DData";
import VueStoreData from "../../store/VueStoreData";
import LianBoTest from "../../utils/LianBoTest";
import { Renderer2D } from "../Base/Renderer";
import SceneBase from "../Base/SceneBase";
import { IScene2D } from "../Interface/IScene";
import { drawGrid } from "../Math/GraphicsUtils";
import BoundingBox2D from "../Model/Geometry/BoundingBox2D";
import BaseEvent2D from "./Events/Base";
import SelectStructureAction from "./Events/SelectStructureAction";
import HomePlan from "./Layer/HomePlan";
import { LayerOrder, layerOrderGroups } from "./Layer/LayerOrder";
import CameraController from "./Manager/CameraController";
import PickupController from "./Manager/PickupController";
import ViewController from "./Manager/ViewController";
import { pointToVector, vectorToPoint } from "./Utils";
import DOMEventManager from "./Utils/DOMEventManager";
import GraphicsTool from "./Utils/GraphicsTool";
import PointObserve from "./Utils/PointObserve";
import ViewObject from "./ViewObject/ViewObject";
import Layer = PIXI.display.Layer;
import Stage = PIXI.display.Stage;
import Graphics = PIXI.Graphics;
import WebGLRenderer = PIXI.Renderer;
import ObservablePoint = PIXI.ObservablePoint;

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
  private static _instance: Scene2D; // 静态单例
  // @ts-ignore
  public viewController: ViewController; // 视图控制器
  public rendererDom: any; // 渲染节点
  // @ts-ignore
  public DOMEventListener: DOMEventManager; // Dom监听器

  public getApplication() {
    return this.scene;
  }

  public getStage() {
    return this.scene.stage as Stage;
  }

  public lineWidth: number = 0;
  private allEvents: BaseEvent2D[] = [];
  // @ts-ignore
  private scene: Application; // 场景
  private Vue: any; // Vue 模型
  // @ts-ignore
  private bindNode: HTMLElement; // 绑定的canvas对象
  // @ts-ignore
  private _grid: Graphics; // 原始形状
  private _assistContanier: PIXI.Container = new PIXI.Container();
  private _coordinate!: PIXI.Container;
  private _axisGroup!: PIXI.Container;

  @computed
  public get scale() {
    return View2DData.scale;
  }

  @computed
  public get position() {
    return View2DData.position;
  }

  // @ts-ignore
  protected _homePlan: HomePlan; //

  public clear() {
    // this.home = null;
    this.homePlan.clear();
  }

  public get homePlan(): HomePlan {
    return this._homePlan;
  }

  // @ts-ignore
  public pickupController: PickupController; // 选择控制器

  public render() {
    this.scene.render();
  }

  @Throttle(100)
  public renderer() {
    this.scene.render();
  }

  @observable
  public scaleNumber = 1;

  public startRender() {
    this.scene.start();
  }

  public stopRender() {
    this.scene.stop();
  }

  /**
   * 初始化PIXI
   */
  public init() {
    const options = {
      backgroundColor: 0xe8e8e8,
      forceFXAA: true,
      antialias: true,
      resolution: this.resolution,
    };
    this.scene = new Application(options);

    if (!(this.scene.renderer instanceof WebGLRenderer)) {
      // this.scene.renderer.destroy();
      this.scene.renderer = Renderer2D;
    }
    this.stopRender();
    this.scene.stage = new Stage();
    Object.defineProperty(this.scene.stage, "scaleNumber", {
      get: () => View2DData.scaleNumber,
    });
    this.scene.stage.name = "scene2D";

    this.rendererDom = document.createElement("div");
    this.rendererDom.setAttribute("tabindex", "1"); // 让元素可以接受keydown事件
    this.rendererDom.appendChild(this.scene.view);

    this.DOMEventListener = new DOMEventManager(this.rendererDom);

    this.scene.renderer.plugins.interaction.setTargetElement(this.rendererDom);
    this.scene.renderer.plugins.interaction.resolution = this.resolution;
    this.getStage().addChild(this._assistContanier);

    this.refreshHomePlan();

    this.drawBaseInfo();

    this.initLayers();

    this.initController();

    // 当前从本地加载数据
    this.loadHomeData("local").then((res) => {
      this.afterLoadHome(res);
    });

    this.initSyncEvent();

    LianBoTest.init();
  }

  private _editStructure: any = {};

  get editStructure(): any {
    return this._editStructure;
  }

  set editStructure(value: any) {
    this._editStructure = value;
  }

  public get resolution() {
    return 1;
  }

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

    if (
      !!this.bindNode &&
      !this.bindNode.getElementsByTagName("canvas").length
    ) {
      this.bindNode.appendChild(this.rendererDom);
    }

    this.initSwitchController();
    this.scene.start();
    this.DOMEventListener.on("resize", this.onWindowResize);
    this.DOMEventListener.on("keydown", this.onKeyDown.bind(this));

    setTimeout(() => {
      this.resize();
    }, 1000);

    this.focus();
  }

  @Throttle(200)
  @Bind
  public onWindowResize() {
    this.resize();
  }

  // @ts-ignore
  public onKeyDown(event) {
    if (event.code === "Space") {
      this.resetView();
    }
  }

  public initSyncEvent() {
    // @ts-ignore
    this.scene.stage.position = new ObservablePoint(null, this, 0, 0);

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
      this.scene.stage.position.set(this.position.x, this.position.y);
      // Model2DActive.panView2D = true;
    });

    reaction(
      () => this.scale.x,
      () => this.setBorderLineStyle(),
      {
        fireImmediately: true,
      }
    );

    autorun(() => this.drawAxisNet());
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
    this.rendererDom.width = width * 1;
    this.rendererDom.height = height * 1;
    // 画布零点位置为摄像机位置，画布零点放置在左上角，是为了墙体处于屏幕中间
    setTimeout(() => this.resetView());

    this.emit("resize", width, height);
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
      levelBoundingBox = new BoundingBox2D().setFromCenterAndSize(
        new Vector2(),
        new Vector2(1000, 800)
      );
    }
    // const levelBoundingBox = this.home.curLevel.getBondingBox();
    const rect: any = (this.rendererDom as HTMLElement).getBoundingClientRect();
    if (!levelBoundingBox || !rect || !(rect.width * rect.height)) {
      return;
    }
    this.setResetScale(levelBoundingBox, rect);
    this.setResetPosition(levelBoundingBox, rect);
  }

  // @ts-ignore
  public resetViewBox(
    levelBoundingBox: BoundingBox2D = null,
    rect: IDOMRect = null
  ) {
    if (!rect) {
      rect = (this.rendererDom as HTMLElement).getBoundingClientRect() as any;
    }
    if (!levelBoundingBox || !rect) {
      return;
    }
    this.setResetScale(levelBoundingBox, rect);
    this.setResetPosition(levelBoundingBox, rect);
  }

  /**
   * @author lianbo
   * @date 2020-11-05 11:19:28
   * @Description: 把构建置于画布中央
   */
  public resetViewForStructure(st: Structure) {
    const point = st.polygon.centerPoint;
    const stage = this.getStage();
    const pointG = stage.toGlobal(new PIXI.Point(point.x, point.y));

    if (!this.pickupController) {
      return null;
    }
    const rect: any = (this.rendererDom as HTMLElement).getBoundingClientRect();
    if (!rect || !(rect.width * rect.height)) {
      return;
    }
    // calculate the screen center position
    const pointCenter = this.pickupController.getPoint(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
      true
    );
    if (!Number.isFinite(pointCenter.x) || !Number.isFinite(pointCenter.y)) {
      return;
    }

    const offset = pointToVector(pointCenter).subtract(pointToVector(pointG));

    this.position.set(this.position.x + offset.x, this.position.y + offset.y);
  }

  public getRenderer() {
    return this.scene.renderer;
  }

  public getController() {
    return this.viewController;
  }

  public stop() {
    this.DOMEventListener.off("resize", this.onWindowResize);
    this.DOMEventListener.off("keydown", this.onKeyDown.bind(this));
    this.stopRender();
    while (this.allEvents.length) {
      const event = this.allEvents.pop();
      if (event) event.destroy();
    }
  }

  public updateCoordinate(): void {
    const p = new PIXI.Point();
    const canvasP = ConfigStructure.computePoint(Model2DActive.subjectVec3);
    p.x = canvasP.x;
    p.y = canvasP.y;
    this._coordinate.position = p;
    this._coordinate.rotation =
      -MathUtils.Deg2Rad * Model2DActive.subjectVec3.z;
  }

  public remove(object: ViewObject) {
    this.scene.stage.removeChild(object);
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
    Model2DActive.reset();
  }

  public getHomeContainer() {
    return this._homePlan.container;
  }

  public focus() {
    if (VueStoreData.enableStage2D) {
      this.rendererDom.focus();
    }
  }

  syncVertex() {
    if (!this._editStructure.structure) return;
    const v = this._editStructure.structure.topFaceGeo[
      this._editStructure.index
    ];
    v.x = Model2DActive.structureVec3.x;
    v.y = Model2DActive.structureVec3.y;
    v.z = Model2DActive.structureVec3.z;
  }

  syncRender() {
    if (!this._editStructure.structure) return;
    this._editStructure.structure.topFaceToBoundingPoints(
      this._editStructure.structure.topFaceGeo,
      this._editStructure.structure.boundingPoints
    );
    this._editStructure.structure.doRender();
    Model2DActive.editVertexState = false; // 取消编辑模式
  }

  /**
   * @author lianbo
   * @date 2020-11-13 16:32:59
   * @Description: 梳理场景下构建的树状结构
   */
  homeToTreeData(): any {
    const data: any[] = [];
    const strs = this.home.curLevel.structures;
    const dataLvl4 = (ele: any, st: Structure) => {
      const data4: any = {};
      data4.id = ele.revitId;
      data4.label = ele.revitId;
      data4.buildData = st;
      return data4;
    };

    const dataLvl3 = (ele: any) => {
      const data3: any = {};
      data3.label = ele.typeName;
      data3.children = [];
      return data3;
    };

    const dataLvl2 = (ele: any) => {
      const data2: any = {};
      data2.label = ele.categoryName;
      data2.children = [];
      return data2;
    };

    for (const st of strs) {
      const ele: any = st.ele;
      const existData: any = data.find(
        (item) => ele.professional === item.label
      );
      if (!existData) {
        const data1: any = {};
        data1.label = ele.professional;
        data1.id = ele.professional;
        data.push(data1);
        data1.children = [];

        const data2: any = dataLvl2(ele);
        data1.children.push(data2);

        const data3: any = dataLvl3(ele);
        data2.children.push(data3);

        const data4: any = dataLvl4(ele, st);
        data3.children.push(data4);
      } else {
        const existData2 = existData.children.find(
          (item: any) => ele.categoryName === item.label
        );
        if (!existData2) {
          const data2: any = dataLvl2(ele);
          existData.children.push(data2);

          const data3: any = dataLvl3(ele);
          data2.children.push(data3);

          const data4: any = dataLvl4(ele, st);
          data3.children.push(data4);
        } else {
          const existData3 = existData2.children.find(
            (item: any) => ele.typeName === item.label
          );
          if (!existData3) {
            const data3: any = dataLvl3(ele);
            existData2.children.push(data3);

            const data4: any = dataLvl4(ele, st);
            data3.children.push(data4);
          } else {
            const data4: any = dataLvl4(ele, st);
            existData3.children.push(data4);
          }
        }
      }
    }

    const rooms = this.home.curLevel.rooms;
    const dataRoom: any = {};
    dataRoom.label = "room";
    dataRoom.id = "room";
    data.push(dataRoom);
    dataRoom.children = [];
    for (const room of rooms) {
      const roomTree: any = {};
      roomTree.label = room.rvtName;
      roomTree.id = room.rvtId;
      roomTree.buildData = room;
      dataRoom.children.push(roomTree);
    }
    const allData: any = {};
    allData.label = "build";
    allData.id = "0";
    allData.children = data;
    const dd = [];
    dd.push(allData);
    return dd;
  }

  // @Throttle(200)
  protected setBorderLineStyle() {
    View2DData.scaleNumber = parseFloat((1 / this.scale.x).toFixed(2));
    // this._grid.updateLineStyle({ lineWidth: this.scaleNumber });
  }

  protected drawBaseInfo() {
    this._grid = new Graphics();
    drawGrid(this._grid, { lineWidth: parseFloat("" + 1 / this.scale.x) });
    this.scene.stage.addChild(this._grid);
    this._coordinate = new PIXI.Container();
    this._coordinate.parentGroup = layerOrderGroups[LayerOrder.Camera];
    const grp = new Graphics();
    this._coordinate.addChild(grp);
    GraphicsTool.drawZeroPoint(grp);
    this.scene.stage.addChild(this._coordinate);
    reaction(
      () => {
        return [
          Model2DActive.subjectVec3.x,
          Model2DActive.subjectVec3.y,
          Model2DActive.subjectVec3.z,
        ];
      },
      (state) => this.updateCoordinate()
    );
    // autorun(() => this.updateCoordinate());
  }

  /**
   * @author lianbo
   * @date 2020-11-13 17:39:09
   * @Description: 加载建筑数据后续操作
   */
  private afterLoadHome(res: any) {
    this.resetView();
    const homeTree = this.homeToTreeData();
    EventMgr.emit(EventEnum.initHome, homeTree);
    this.drawAxisNet();
    // 绘制辅助调试
    this.debuggerAssist();
  }

  /**
   * @author lianbo
   * @date 2020-11-13 10:35:59
   * @Description: 绘制四叉树
   */
  private debuggerAssist() {
    if (ConfigStructure.debugger) {
      this.getStage().addChild(this._assistContanier);
      this.drawNode(this.home.curLevel.quadTree);
    }
  }

  private drawNode(quad: Quadtree) {
    const grp = new PIXI.Graphics();
    this._assistContanier.addChild(grp);
    grp.lineStyle(1, Constant.colorMap.RED, 1);
    const bounds = quad.bounds;

    //no subnodes? draw the current node
    if (quad.nodes.length === 0) {
      grp.drawRect(bounds.x, bounds.y, bounds.width, bounds.height);

      //has subnodes? drawQuadtree them!
    } else {
      for (let i = 0; i < quad.nodes.length; i = i + 1) {
        this.drawNode(quad.nodes[i]);
      }
    }
  }

  // @ts-ignore
  private setResetScale(
    levelBoundingBox: BoundingBox2D,
    rect: IDOMRect = null
  ) {
    // calculate the house size
    const sizeVec = levelBoundingBox.getSize(new Vector2());

    // calculate the screen size
    const screenSize = new Vector2(rect.width, rect.height);

    // calculate the padding
    screenSize.multiplyScalar(0.7);

    // select the minimum side
    const scale = Math.min(screenSize.x / sizeVec.x, screenSize.y / sizeVec.y);

    this.scale.set(scale);
  }

  // @ts-ignore
  private setResetPosition(
    levelBoundingBox: BoundingBox2D,
    rect: IDOMRect = null
  ) {
    // calculate the house center position
    const point = vectorToPoint(levelBoundingBox.getCenter());
    const stage = this.getStage();
    const pointG = stage.toGlobal(point);

    if (!this.pickupController) {
      return null;
    }

    // calculate the screen center position
    const pointCenter = this.pickupController.getPoint(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
      true
    );
    if (!Number.isFinite(pointCenter.x) || !Number.isFinite(pointCenter.y)) {
      return;
    }

    const offset = pointToVector(pointCenter).subtract(pointToVector(pointG));

    this.position.set(this.position.x + offset.x, this.position.y + offset.y);
  }

  /**
   * 加载户型数据
   */
  private async loadHomeData(from?: string, path?: any) {
    try {
      // @ts-ignore
      this.home = await HomeTypeData.getHome(from, path);
      // 计算墙的中线
      this.home.curLevel.preprocess();
      this.home.curLevel.preprocessRoom();
      this.homePlan.render();
      this.resetView();
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
    this.allEvents.push();
  }

  private initController() {
    this.viewController = new ViewController(this);
    this.pickupController = new PickupController(this);
    this.pickupController.enable = true;
    this.pickupController.layer2D = null;

    new CameraController(this);

    //region column
    //     new StructureMoveAction(this); // 大部分场景在pad上操作，拖拽的方式，不太适用
    new SelectRoomAction(this);
    new SelectStructureAction(this);
    new EditVerticesAction(this);
    new SubjectAction(this);
    new EditEdgeAction(this);
    //endregion
  }

  private drawAxisNet() {
    if (!Model2DActive.showAxis) {
      if (this._axisGroup) this._axisGroup.visible = false;
      return;
    }

    function drawWallAxisNet(st: Structure, axisNetContainer: PIXI.Container) {
      if (st.stType !== StType.Wall) return;
      if (!st.midSeg || MathUtils.lessEqual(st.midSeg.length, 0.1)) return;
      const stSeg = st.midSeg;
      if (stSeg.isVertical()) {
        const vDrawed = vxs.find((item) =>
          MathUtils.equal(item, stSeg.start.x)
        );
        if (vDrawed) return;
        const minY = ConfigStructure.minCanvasV3.y - 200;
        const maxY = ConfigStructure.maxCanvasV3.y + 200;
        const height = maxY - minY;
        const x = stSeg.start.x;
        const grp = new Graphics();
        axisNetContainer.addChild(grp);
        grp.lineStyle(1, Constant.colorMap.DeepPink, 0.3);
        GraphicsTool.drawDashedLine(grp, Point.ZERO, new Point(0, height), 50);
        axisNetContainer.position.set(x, minY);
        vxs.push(x);
        return axisNetContainer;
      }
      if (stSeg.isHorizontal()) {
        const hDrawed = hys.find((item) =>
          MathUtils.equal(item, stSeg.start.y, 0.1)
        );
        if (hDrawed) return;
        const minX = ConfigStructure.minCanvasV3.x - 200;
        const maxX = ConfigStructure.maxCanvasV3.x + 200;
        const width = maxX - minX;
        const y = stSeg.start.y;
        const grp = new Graphics();
        axisNetContainer.addChild(grp);
        grp.lineStyle(1, Constant.colorMap.DeepPink, 0.3);
        GraphicsTool.drawDashedLine(grp, Point.ZERO, new Point(width, 0), 50);
        axisNetContainer.position.set(minX, y);
        hys.push(y);
        return axisNetContainer;
      }
    }

    const vxs: number[] = [];
    const hys: number[] = [];
    if (!this._axisGroup) {
      this._axisGroup = new PIXI.Container();
      this.getStage().addChild(this._axisGroup);
    } else {
      this._axisGroup.visible = true;
      return;
    }
    for (const st of this.home.curLevel.structures) {
      const axisNetContainer = new PIXI.Container();
      const container = drawWallAxisNet(st, axisNetContainer);
      if (container) {
        this._axisGroup.addChild(container);
      }
    }
  }
}
