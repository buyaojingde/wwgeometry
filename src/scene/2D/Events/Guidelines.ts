import { reaction } from 'mobx';
import Model2DActive from '../../../store/Model2DActive';
import GeometryTool from '../../../utils/Math/tool/GeometryTool';
import BaseEvent from '../../Base/BaseEvent';
import Scene2D from '../index';
import PickupController from '../Manager/PickupController';

export default class Guidelines extends BaseEvent {
  private _activeLayer: PIXI.Container;
  private _stage: PIXI.Container;
  private _textView: PIXI.Text;
  private _grp: PIXI.Graphics;
  private _pickUp: PickupController;

  constructor(scene2D: Scene2D) {
    super(scene2D.DOMEventListener);
    this._activeLayer = new PIXI.Container();
    this._stage = scene2D.getStage();
    this._pickUp = scene2D.pickupController;
    this._stage.addChild(this._activeLayer);
    this._grp = new PIXI.Graphics();
    this._activeLayer.addChild(this._grp);
    this._textView = new PIXI.Text('');
    this._activeLayer.addChild(this._textView);
    reaction(
      () => Model2DActive.editGuidelines,
      (state) => {
        this.enable = state;
        if (this.enable) {
          this.onStart();
        } else {
          this.onEnd();
        }
      }
    );
  }

  public initEvents() {
    super.initEvents();
    this.on('input.move', (event: MouseEvent) => this.handleMouseMove(event));
  }

  private onStart() {}

  private onEnd() {}

  private handleMouseMove(event: MouseEvent) {
    const { pageX, pageY } = event;
    const point = this._pickUp.getPoint(pageX, pageY);
  }
}
