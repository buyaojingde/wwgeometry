import { reaction } from 'mobx';
import Model2DActive from '../../../store/Model2DActive';
import View2DData from '../../../store/View2DData';
import Vector2D from '../../Model/Geometry/Vector2D';
import { pointToVector } from '../Utils';
import BaseController from './BaseController';
import Point = PIXI.Point;

const SCENE_2D_MAX_SCALE = 5;
const SCENE_2D_MIN_SCALE = 0.12;
/**
 * 视图控制器，用于控制2D视图 放大平移缩放等
 * * by lianbo.guo
 **/
export default class ViewController extends BaseController {
  protected scene: any;
  protected interactionManager: any;
  private renderDom: any;

  public constructor(scene: any) {
    super(scene);
    this.renderDom = scene.rendererDom;
    this.interactionManager = this.scene.getRenderer().plugins.interaction;

    reaction(
      () => {
        return !Model2DActive.cameraMove;
      },
      enable => {
        this.enable = enable;
      },
      { fireImmediately: true },
    );
  }

  public initEvents() {
    let startPosition: any;
    let startPoint: any;

    // @ts-ignore
    const moveEvent = event => {
      if (!startPosition) {
        return;
      }
      const { pageX: x, pageY: y } = event;
      const nowPoint = new Point();
      this.interactionManager.mapPositionToPoint(nowPoint, x, y);

      const { x: nowX, y: nowY } = nowPoint;

      const { x: startPointX, y: startPointY } = startPoint;

      const { x: startX, y: startY } = startPosition;

      View2DData.setPosition(
        new Vector2D(startX + nowX - startPointX, startY + nowY - startPointY),
      );
    };
    // @ts-ignore
    const endEvent = event => {
      if (!startPosition) {
        return;
      }
      startPosition = null;
      startPoint = null;
    };

    this.on('win.input.end.right', endEvent);
    this.on('win.input.end', endEvent);
    // @ts-ignore
    this.on('input.start', event => {
      if (/mouse/.test(event.type)) {
        if (event.button !== 2 && event.button !== 1) {
          return;
        }
      }
      startPosition = this.scene.position.clone();
      const { pageX: x, pageY: y } = event;
      startPoint = new Point();
      this.interactionManager.mapPositionToPoint(startPoint, x, y);
      moveEvent(event);
    });
    // this.on('win.input.move', moveEvent);
    // @ts-ignore
    this.on('win.input.move', event => {
      moveEvent(event);
    });
    // @ts-ignore
    this.on('contextmenu', event => event.preventDefault());

    // @ts-ignore
    this.on('scale+', event => {
      const scaleResult = Math.min(this.scene.scale.x + this.makeScaleStep(), SCENE_2D_MAX_SCALE);
      this.calculateScaleOffset(event, scaleResult);
    });
    // @ts-ignore
    this.on('scale-', event => {
      const scaleResult = Math.max(this.scene.scale.x - this.makeScaleStep(), SCENE_2D_MIN_SCALE);
      this.calculateScaleOffset(event, scaleResult);
    });
  }

  protected makeScaleStep() {
    const rate = 0.2;
    return this.scene.scale.x * rate;
  }

  // @ts-ignore
  private calculateScaleOffset(event, scale) {
    const { pageX: x, pageY: y } = event;
    const pointBefore = new Point();
    this.interactionManager.mapPositionToPoint(pointBefore, x, y);
    const pointBeforeStage = this.scene.getStage().toLocal(pointBefore);

    View2DData.setScale(new Vector2D(scale, scale));

    const point = this.stage.toGlobal(pointBeforeStage);
    const offset = pointToVector(point).subtract(pointToVector(pointBefore));

    const position = View2DData.position;
    position.x -= offset.x;
    position.y -= offset.y;

    View2DData.setPosition(position);
  }
}
