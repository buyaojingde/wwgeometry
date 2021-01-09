import { reaction } from 'mobx';
import Model2DActive from '../../../store/Model2DActive';
import Vector2 from '../../../utils/Math/geometry/Vector2';
import BaseEvent from '../../Base/BaseEvent';
import Scene2D from '../index';

export default class MoveAction extends BaseEvent {
  private _scene: Scene2D;
  private _moveObj: any;
  private lastPosition: any;
  public constructor(scene: Scene2D) {
    super(scene.DOMEventListener);
    this._scene = scene;

    reaction(
      () => Model2DActive.moveItem,
      (data) => {
        this._moveObj = data;
        if (data !== null) {
          this.enable = true;
        } else {
          this.enable = false;
        }
      }
    );
  }

  public initEvents() {
    this.on('input.move', (event: any) => this.moveAction(event));
    this.on('input.end', (event: any) => {
      this.moveDone(event);
      Model2DActive.moveItem = null;
    });
  }

  private moveAction(event: any) {
    if (!this._moveObj.draggable) return;
    const { pageX, pageY } = event;
    const position = this._scene.pickupController.getPoint(pageX, pageY);

    if (!this.lastPosition) {
      this.lastPosition = position;
      return;
    }
    const v = new Vector2(
      position.x - this.lastPosition.x,
      position.y - this.lastPosition.y
    );
    this._moveObj.translate(v);
    this.lastPosition = position;
  }

  /**
   * @author lianbo
   * @date 2021-01-04 20:39:59
   * @Description: 移动完成后的，同步
   */
  private moveDone(event: any) {
    console.log('done');
    this.lastPosition = null;
  }
}
