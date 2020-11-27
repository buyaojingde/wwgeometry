/**
 * 选择控制器，用于选择2D场景中的物体
 * * by lianbo.guo
 **/
import Room2D from "../../../scene/2D/ViewObject/Room2D";
import ConfigStructure from "@/utils/ConfigStructure";
import { action } from "mobx";
import Model2DActive from "../../../store/Model2DActive";
import Vector2D from "../../Model/Geometry/Vector2D";
import { getRootObject } from "../Utils";
import BaseScene from "../Utils/BaseScene";
import Structure2D from "../ViewObject/Structure2D";
import BaseController from "./BaseController";
import DisplayObject = PIXI.DisplayObject;
import InteractionManager = PIXI.InteractionManager;
import Point = PIXI.Point;

declare var navigator: any;

export default class PickupController extends BaseController {
  public isEdit: boolean = false;
  protected scene: any;
  private interactionManager: InteractionManager;
  private renderDom: any;

  public constructor(scene: any) {
    super(scene);
    this.renderDom = scene.rendererDom;
    this.interactionManager = this.scene.getRenderer().plugins.interaction;
  }

  private _layer2D: any;

  public get layer2D() {
    return this._layer2D;
  }

  public set layer2D(val: any) {
    this._layer2D = val;
  }

  public initEvents() {
    // @ts-ignore
    this.on("input.start", (event) => {
      action(() => {
        // 鼠标右键取消选中
        if (event.button === 2) {
          return;
        }

        if (event.button && event.button !== -1) {
          return;
        }

        const mousePoint = this.getPoint(event.x, event.y, true);
        const { pageX: x, pageY: y } = event;
        let object: any;
        object = this.getObject(x, y);
      })();
    });

    // @ts-ignore
    this.on("input.end", (event) => {
      const mousePoint = this.getPoint(event.x, event.y, true);
    });

    // @ts-ignore
    this.on("panstart", ({ srcEvent: event }) => {
      action(() => {
        // 仅允许左键
        if (event.button && event.button !== -1) {
          return;
        }

        let object: any;
        const { pageX: x, pageY: y } = event;

        object = this.getObject(x, y);

        Model2DActive.reset();
        if (object instanceof Structure2D) {
          Model2DActive.setDragStructure(object.strct);
        }
      })();
    });

    // @ts-ignore
    this.on("tap", (event) => {
      if (this.isEdit) {
        return;
      }
      const { center } = event;
      const { x, y } = center;

      let object: any;
      object = this.getObject(x, y);
      this.pickUpIn2D(object);
    });

    this.on("tap", this.showTapPos.bind(this));

    // @ts-ignore
    this.on("dblclick", (event) => {
      if (this.isEdit) {
        return;
      }
      const { pageX: x, pageY: y } = event;

      let object: any;
      object = this.getObject(x, y);
    });
  }

  /**
   * 根据Screen的PageX、Y获取场景中的物体
   * @param pageX
   * @param pageY
   * @returns {PIXI.DisplayObject}
   */
  // @ts-ignore
  public getObject(pageX, pageY) {
    const point = new Point();
    this.interactionManager.mapPositionToPoint(point, pageX, pageY);

    return this.getObjectByCanvasPoint(point, true);
  }

  /**
   * 根据场景坐标获取实体
   * @param point
   * @returns {any}
   * @param isGlobal
   */
  public getObjectByCanvasPoint(point: Point, isGlobal = false) {
    // 获取所有2D场景
    const stages = [
      this.stage,
      ...Array.from(BaseScene.apps.values()).map((app) => app.stage),
    ];

    !isGlobal && (point = this.stage.toGlobal(point));

    let object;
    for (const stage of stages) {
      object = this.interactionManager.hitTest(point, stage);
      !!object && (object = getRootObject(object));

      if (!!object) {
        break;
      }
    }
    return object;
  }

  /**
   * 根据Screen的PageX、Y获取对应的场景位置
   * @param pageX
   * @param pageY
   * @returns {PIXI.Point}
   */
  // @ts-ignore
  public getPoint(pageX, pageY, isGlobal = false): Point {
    let point = new Point();
    this.interactionManager.mapPositionToPoint(point, pageX, pageY);

    !isGlobal && (point = this.stage.toLocal(point));

    return point;
  }

  /**
   * 根据2D场景中的DisplayObject获取对应的Screen位置
   * @param object
   * @returns {any}
   * @param isScreenPos
   */
  public getDisplayObjectPosition(object: DisplayObject, isScreenPos = true) {
    if (!object) {
      return null;
    }
    let pos = object.position;
    const { x, y } = this.stage.toGlobal(pos);
    return this.mapPointToPosition(x, y, isScreenPos);
  }

  public getDisplayObjectShapePosition(pos: Vector2D) {
    if (!pos) {
      return null;
    }
    const { x, y } = this.stage.toGlobal(pos);
    return this.mapPointToPosition(x, y);
  }

  /**
   * 获取2D场景中点映射在屏幕的位置
   * @param p
   * @param isScreenOffset
   * @returns {PIXI.Point}
   */
  public getPointPosition(p: Point, isScreenOffset = true) {
    const { x, y } = this.stage.toGlobal(p);
    return this.mapPointToPosition(x, y, isScreenOffset);
  }

  /**
   * 根据2D场景中的x、y获取对应的Screen位置
   * @param x
   * @param y
   * @param isScreenOffset
   * @returns {PIXI.Point}
   */
  // @ts-ignore
  public mapPointToPosition(x, y, isScreenOffset = true) {
    let rect = void 0;
    const point = new Point();

    // IE 11 fix
    if (!this.renderDom.parentElement) {
      // @ts-ignore
      rect = { x: 0, y: 0, width: 0, height: 0 };
    } else {
      rect = this.renderDom.getBoundingClientRect();
    }

    const resolutionMultiplier = navigator.isCocoonJS
      ? this.interactionManager.resolution
      : 1.0 / this.interactionManager.resolution;

    // @ts-ignore
    point.x = x / ((this.renderDom.width / rect.width) * resolutionMultiplier);
    // @ts-ignore
    point.y =
      y / ((this.renderDom.height / rect.height) * resolutionMultiplier);

    if (isScreenOffset) {
      // @ts-ignore
      point.x += rect.left;
      // @ts-ignore
      point.y += rect.top;
    }

    return point;
  }

  /**
   * 在2D场景中选择
   * @param object
   */
  // @ts-ignore
  protected pickUpIn2D(object) {
    if (object instanceof Structure2D || object instanceof Room2D) {
      Model2DActive.setSelection(object.model);
    } else {
      Model2DActive.clearSelection();
    }
  }

  private showTapPos(event: any) {
    const { x, y } = event.center;
    const pPoint = this.getPoint(x, y);
    const geoV = ConfigStructure.computeGeo(pPoint);
    Model2DActive.setStructureVec(geoV);
  }
}
