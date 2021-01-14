import { reaction } from 'mobx';
import Model2DActive from '../../../store/Model2DActive';
import Vector2 from '../../../utils/Math/geometry/Vector2';
import BaseEvent from '../../Base/BaseEvent';
import IDragObject from '../../Model/BaseInterface/IDragObject';
import Scene2D from '../index';

export default abstract class DragAction extends BaseEvent {
  private _scene: Scene2D;
  private _lastPosition: any;
  private dragModel!: IDragObject;

  public constructor(scene: Scene2D) {
    super(scene.DOMEventListener);
    this._scene = scene;

    this.switchArr.push(
      reaction(
        () => Model2DActive.dragModel,
        (model: any) => {
          if (model) {
            this.onStart();
            this.enable = true;
          } else {
            this.onEnd();
            this.enable = false;
          }
        }
      )
    );
  }

  public initEvents() {
    this.on('input.move', (event: any) => this.drag(event));
    this.on('input.end', (event: any) => {
      this.dragDone(event);
    });
  }

  private onStart(): void {
    this.dragModel = Model2DActive.dragModel;
    this.dragModel.beforeDrag();
  }

  private onEnd(): void {
    this.dragModel.beforeDispose();
  }

  private drag(event: any) {
    const { pageX, pageY } = event;
    const position = this._scene.pickupController.getPoint(pageX, pageY);

    if (!this._lastPosition) {
      this._lastPosition = position;
      return;
    }
    const v = new Vector2(
      position.x - this._lastPosition.x,
      position.y - this._lastPosition.y
    );
    this.translate(v);
    this._lastPosition = position;
  }

  private dragDone(event: any) {
    this.dragModel.dragDone();
  }

  private translate(v: Vector2) {
    this.dragModel.translate(v);
  }
}
