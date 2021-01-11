import { reaction } from 'mobx';
import Model2DActive from '../../../store/Model2DActive';
import ConfigStructure from '../../../utils/ConfigStructure';
import Vector2 from '../../../utils/Math/geometry/Vector2';
import BaseEvent from '../../Base/BaseEvent';
import SolidGeometryUtils from '../../Model/Geometry/SolidGeometryUtils';
import Scene2D from '../index';

export default class MoveAction extends BaseEvent {
  private _scene: Scene2D;
  private _moveObj: any;
  private _moveType: any;
  private _originPosition: any;
  private lastPosition: any;
  public constructor(scene: Scene2D) {
    super(scene.DOMEventListener);
    this._scene = scene;

    reaction(
      () => Model2DActive.moveItem,
      (data) => {
        if (data) {
          this._moveObj = data.dragModel;
          this._moveType = data.moveType;
          this._originPosition = data.dragModel.og.position;
        } else {
          this._moveObj = null;
          this._moveType = null;
        }
        if (data !== null) {
          this.enable = data.dragModel.model.isEdit;
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
    if (!this._moveObj.model.isEdit) return;
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
    this._moveObj.og.translate(v);
    this.lastPosition = position;
  }

  /**
   * @author lianbo
   * @date 2021-01-04 20:39:59
   * @Description: 移动完成后的，同步
   */
  private moveDone(event: any) {
    console.log('done');

    const movePs = (index: number) => {
      const vs: any[] = [];
      const p0 = this._moveObj.model.topFaceGeo[index];
      vs.push(p0);
      for (const mirror of this._moveObj.model.mirrorFaces) {
        if (mirror.mirrorIndices.topIndex === index) {
          const mirrorIndex = mirror.mirrorIndices.mirrorIndex;
          vs.push(mirror.mirrorFace[mirrorIndex]);
        }
      }
      return vs;
    };
    const currentOgPosition = this._moveObj.og.position;
    const translateV = {
      x: currentOgPosition.x - this._originPosition.x,
      y: currentOgPosition.y - this._originPosition.y,
    };
    const bimV = ConfigStructure.computeOffsetV(translateV);
    this.lastPosition = null;
    if (this._moveType === 'polygon2D') {
      SolidGeometryUtils.translateGeo(this._moveObj.model.geo, bimV);
      this._moveObj.model.updateBoundary(this._moveObj.og.observerGeo);
    }
    if (this._moveType === 'edge2D') {
      const vs: any[] = [];
      for (const index of this._moveObj.indices) {
        vs.push(...movePs(index));
      }
      for (const v of vs) {
        SolidGeometryUtils.translateVertex(v, bimV);
      }
      this._moveObj.model.updateBoundary(this._moveObj.og.observerGeo);
    }
    if (this._moveType === 'spot2D') {
      const vs = movePs(this._moveObj.index);
      for (const v of vs) {
        SolidGeometryUtils.translateVertex(v, bimV);
      }
      this._moveObj.model.updateBoundary(this._moveObj.og.observerGeo);
    }
  }
}
