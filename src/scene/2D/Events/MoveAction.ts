import { reaction } from 'mobx';
import Model2DActive from '../../../store/Model2DActive';
import Point from '../../../utils/Math/geometry/Point';
import BaseEvent from '../../Base/BaseEvent';
import Scene2D from '../index';

export default class MoveAction extends BaseEvent {
  private _scene: Scene2D;
  private _moveObj: any;
  public constructor(scene: Scene2D) {
    super(scene.DOMEventListener);
    this._scene = scene;

    reaction(
      () => Model2DActive.moveItem,
      (edge) => {
        this._moveObj = edge;
      }
    );
  }

  public initEvents() {
    this._moveObj.lastPosition = this._moveObj.position;

    this.on('input.move', (event: any) => this.moveAction(event));
    this.on('win.input.end', (event: any) => {
      this.moveDone(event);
      Model2DActive.moveItem = null;
    });
  }

  private moveAction(event: any) {
    const { pageX, pageY } = event;
    const position = Scene2D.getInstance().pickupController.getPoint(
      pageX,
      pageY
    );
    this._moveObj.setPosition(pageX, pageY);
  }

  /**
   * @author lianbo
   * @date 2021-01-04 20:39:59
   * @Description: 移动完成后的，同步
   */
  private moveDone(event: any) {}
}
