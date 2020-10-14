import debounce from 'lodash/debounce';
import { reaction } from 'mobx';
import Point = PIXI.Point;
import KeyMap, { eventAction } from '../../../global/KeyMap';
import Model2DActive from '../../../store/Model2DActive';
import ModelActiveData from '../../../store/ModelActiveData';
import View2DData from '../../../store/View2DData';
import { validataOS } from '../../../utils';
import Vector2D from '../../Model/Geometry/Vector2D';
import { pointToVector, vectorToPoint } from '../Utils';
import BaseController from './BaseController';
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

  private endScale = debounce(() => {
    Model2DActive.setCameraChanging(false);
  }, 200);

  public constructor(scene: any) {
    super(scene);
    this.renderDom = scene.rendererDom;
    this.interactionManager = this.scene.getRenderer().plugins.interaction;

    reaction(
      () => {
        if (Model2DActive.isWallDrawing) {
          return true;
        }
        if (Model2DActive.isRoomDrawing) {
          return true;
        }

        return !Model2DActive.isChanging && !ModelActiveData.cameraChanging;
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

    const moveEvent = event => {
      if (!startPosition) {
        return;
      }
      if (Model2DActive.drawingWallModeState) {
        return;
      }
      if (Model2DActive.drawingRoomModeState) {
        return;
      }
      const { pageX: x, pageY: y } = event;
      const nowPoint = new Point();
      this.interactionManager.mapPositionToPoint(nowPoint, x, y);

      const { x: nowX, y: nowY } = nowPoint;

      const { x: startPointX, y: startPointY } = startPoint;

      const { x: startX, y: startY } = startPosition;

      View2DData.setPosition(new Vector2D(startX + nowX - startPointX, startY + nowY - startPointY));
    };
    const endEvent = event => {
      if (!startPosition) {
        return;
      }
      startPosition = null;
      startPoint = null;
    };

    this.on('win.input.end.right', endEvent);
    this.on('win.input.end', endEvent);
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
      // 在进入之前取消上次动作，防止放大缩小后马上平移导致的问题
      this.endScale.cancel();
      moveEvent(event);
    });
    // this.on('win.input.move', moveEvent);
    this.on('win.input.move', event => {
      moveEvent(event);
    });
    this.on('contextmenu', event => event.preventDefault());

    this.on('keydown', event => this.hotKeyEvent(event));

    this.on('scale+', event => {
      const scaleResult = Math.min(this.scene.scale.x + this.makeScaleStep(), SCENE_2D_MAX_SCALE);
      this.calculateScaleOffset(event, scaleResult);
    });
    this.on('scale-', event => {
      const scaleResult = Math.max(this.scene.scale.x - this.makeScaleStep(), SCENE_2D_MIN_SCALE);
      this.calculateScaleOffset(event, scaleResult);
    });
  }

  /**
   * 快捷键事件
   * @param event
   */
  protected hotKeyEvent(event) {
    const action = eventAction(event, KeyMap.viewControl);
    if (action) {
      const offset = new Vector2D();
      const offsetLength = 10;

      switch (action) {
        case 'moveTop':
          offset.setY(-offsetLength);
          break;

        case 'moveBottom':
          offset.setY(offsetLength);
          break;

        case 'moveLeft':
          offset.setX(-offsetLength);
          break;

        case 'moveRight':
          offset.setX(offsetLength);
          break;

        default:
      }

      View2DData.setPosition(pointToVector(this.scene.position).subtract(offset));
    }
  }

  protected makeScaleStep() {
    const os = validataOS() as any;
    const rate = os === 'Mac' ? 0.05 : 0.2;

    return this.scene.scale.x * rate;
  }

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
