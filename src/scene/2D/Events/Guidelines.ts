import { reaction } from 'mobx';
import Model2DActive from '../../../store/Model2DActive';
import ConfigStructure from '../../../utils/ConfigStructure';
import Constant from '../../../utils/Math/contanst/constant';
import Point from '../../../utils/Math/geometry/Point';
import Segment from '../../../utils/Math/geometry/Segment';
import { AdsorptionTool } from '../../../utils/Math/tool/AdsorptionTool';
import GeometryTool from '../../../utils/Math/tool/GeometryTool';
import BaseEvent from '../../Base/BaseEvent';
import Scene2D from '../index';
import PickupController from '../Manager/PickupController';
import GraphicsTool from '../Utils/GraphicsTool';

export default class Guidelines extends BaseEvent {
  private _activeLayer: PIXI.Container;
  private _stage: PIXI.Container;
  private _textView: PIXI.Text;
  private _grp: PIXI.Graphics;
  private _pickUp: PickupController;
  private _scene: Scene2D;
  private _startP!: any;
  private _endP!: any;
  private _moveP!: any;

  constructor(scene2D: Scene2D) {
    super(scene2D.DOMEventListener);
    this._scene = scene2D;
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
          Model2DActive.isEdit = true;
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
    this.on('tap', (event: any) => this.handleMouseClick(event));
    this.on('input.end.right', (event: any) => this.cancel(event));
  }

  private onStart() {}

  private onEnd() {
    this._grp.clear();
    Model2DActive.isEdit = false;
  }

  private handleMouseMove(event: MouseEvent) {
    const { pageX, pageY } = event;
    const pixiPoint = this._pickUp.getPoint(pageX, pageY);
    const point = new Point(pixiPoint.x, pixiPoint.y);
    const segs = this._scene.retrieveSegs(point);
    const distance = (p: Point, other: Segment) => {
      return other.distanceToPoint(p);
    };
    const closest = AdsorptionTool.findAdsorptionSeg(point, segs, distance)
      .point;
    this._moveP = closest || point;
    if (this._startP) {
      this.drawCircle(this._startP);
      this.drawLine();
    } else {
      this.drawCircle(this._moveP);
    }
  }

  private drawCircle(p: any) {
    this._grp.clear();
    this._grp.beginFill(Constant.colorMap.BLACK, 0.2);
    this._grp.drawCircle(p.x, p.y, 10);
    this._grp.endFill();
  }

  private drawLine() {
    GraphicsTool.drawLine(this._grp, this._startP, this._moveP);
  }

  private handleMouseClick(event: any) {
    if (!this._startP) {
      this._startP = this._moveP;
    } else {
      this._endP = this._moveP;
      ConfigStructure.guidelines[0] = new Segment(this._startP, this._endP);
      this._grp.clear();
      this._scene.drawGuidelines(this._startP, this._endP);
      this._startP = null;
      // Model2DActive.editGuidelines = false;
    }
  }

  /**
   * @author lianbo
   * @date 2020-12-29 10:21:40
   * @Description: 取消本次绘制
   */
  private cancel(event: any) {
    if (this._startP) {
      this._startP = null;
      this._grp.clear();
    }
  }
}
