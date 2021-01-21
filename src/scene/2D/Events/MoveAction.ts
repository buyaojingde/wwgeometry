import Point from '@/views/map/spaceInformation/mapEditor/utils/Math/geometry/Point';
import Polygon from '@/views/map/spaceInformation/mapEditor/utils/Math/geometry/Polygon';
import Segment from '@/views/map/spaceInformation/mapEditor/utils/Math/geometry/Segment';
import MathUtils from '@/views/map/spaceInformation/mapEditor/utils/Math/math/MathUtils';
import { AdsorptionTool } from '@/views/map/spaceInformation/mapEditor/utils/Math/tool/AdsorptionTool';
import GeometryTool from '@/views/map/spaceInformation/mapEditor/utils/Math/tool/GeometryTool';
import { reaction } from 'mobx';
import Model2DActive from '../../../store/Model2DActive';
import ConfigStructure from '../../../utils/ConfigStructure';
import Vector2 from '../../../utils/Math/geometry/Vector2';
import BaseEvent from '../../Base/BaseEvent';
import Scene2D from '../index';

export default class MoveAction extends BaseEvent {
  private _scene: Scene2D;
  private _moveObj: any;
  private _moveType: any;
  private _originPosition: any;
  private lastPosition: any;
  private needAdsorptions!: any;
  private offsetPosition!: { x: number; y: number };
  private offsetObs!: { x: number; y: number }[];
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
          this.needAdsorptions = this._moveObj.model.level.findAdsorption(
            this._moveObj.model
          );
          if (this._moveObj.og.observerGeo.length < 3) {
            const points = [];
            for (const point of this.needAdsorptions.points) {
              let found = false;
              for (const obPoint of this._moveObj.og.observerGeo) {
                if (
                  MathUtils.equal(point.x, obPoint.x) &&
                  MathUtils.equal(point.y, obPoint.y)
                ) {
                  found = true;
                }
              }
              if (!found) {
                points.push(point);
              }
            }
            this.needAdsorptions.points = points;
          }
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
    });
  }

  vertical: any = null;
  private moveAction(event: any) {
    if (!this._moveObj.model.isEdit) return;
    const { pageX, pageY } = event;
    const position = this._scene.pickupController.getPoint(pageX, pageY);

    if (!this.lastPosition) {
      this.lastPosition = position;

      const dragPosition = this._moveObj.og.position;
      this.offsetPosition = {
        x: this.lastPosition.x - dragPosition.x,
        y: this.lastPosition.y - dragPosition.y,
      };
      this.offsetObs = this._moveObj.og.observerGeo.map((item: any) => {
        return {
          x: this.lastPosition.x - item.x,
          y: this.lastPosition.y - item.y,
        };
      });
      return;
    }
    let v;
    let adPosition = position;
    if (!event.shiftKey) {
      adPosition = this.adsorption(position);

      const dragPosition = this._moveObj.og.position;
      const current = {
        x: this.offsetPosition.x + dragPosition.x,
        y: this.offsetPosition.y + dragPosition.y,
      };
      v = new Vector2(adPosition.x - current.x, adPosition.y - current.y);
    } else {
      if (this.vertical === null) {
        if (
          Math.abs(position.y - this.lastPosition.y) >
          Math.abs(position.x - this.lastPosition.x)
        ) {
          this.vertical = true;
        } else {
          this.vertical = false;
        }
        return;
      }
      const dragPosition = this._moveObj.og.position;
      const current = {
        x: this.offsetPosition.x + dragPosition.x,
        y: this.offsetPosition.y + dragPosition.y,
      };
      if (this.vertical) {
        v = new Vector2(0, position.y - current.y);
      } else {
        v = new Vector2(position.x - current.x, 0);
      }
    }
    // const v = new Vector2(position.x - this.lastPosition.x, position.y - this.lastPosition.y);
    if (MathUtils.equalZero(GeometryTool.distance(v))) return;
    this._moveObj.og.translate(v);
  }

  /**
   * @author lianbo
   * @date 2021-01-04 20:39:59
   * @Description: 移动完成后的，同步
   */
  private moveDone(event: any) {
    this.lastPosition = null;
    this.vertical = null;

    const currentOgPosition = this._moveObj.og.position;
    const translateV = {
      x: currentOgPosition.x - this._originPosition.x,
      y: currentOgPosition.y - this._originPosition.y,
    };
    const bimV = ConfigStructure.computeOffsetV(translateV);
    this._moveObj.model.updateBoundary();
    this._moveObj.model.translateGeoEle(
      bimV,
      this._moveType,
      this._moveObj.indices
    );

    if (this._moveObj.og.observerGeo.length === 1) {
      this._moveObj.indices &&
        this._moveObj.model.setDragState(false, this._moveObj.indices[0]);
    }
    if (this._moveObj.og.observerGeo.length === 2) {
      this._moveObj.indices &&
        this._moveObj.model.setDragEdgeState(false, this._moveObj.indices[0]);
    }
    this._moveObj.model.switchInteractive(true);
    Model2DActive.setMoveItem(null);
  }

  private adsorption(p: any): any {
    const position = new Point(p.x, p.y);
    const nextFPs = this.offsetObs.map((item) => {
      return new Point(position.x - item.x, position.y - item.y);
    });
    if (this._moveObj.og.observerGeo.length > 2) {
      const disSeg = (ap: Point, seg: Segment) => seg.distanceToPoint(ap);
      const result = AdsorptionTool.findAdsorptionPolygon(
        position,
        nextFPs,
        [
          this.needAdsorptions.horizontal,
          this.needAdsorptions.vertical,
          this.needAdsorptions.segs,
        ],
        disSeg,
        10
      );
      return result;
    }

    if (this._moveObj.og.observerGeo.length === 2) {
      const adsorptionPs = this.needAdsorptions.points;
      let minOffset = Number.MAX_VALUE;
      let offset: any;
      for (const obPoint of nextFPs) {
        const resultAds = AdsorptionTool.findHorizontalAndVertical(
          obPoint,
          adsorptionPs
        );
        if (resultAds) {
          const resultPoint = new Point(resultAds.x, resultAds.y);
          const offsetV = resultPoint.subtract(obPoint);
          const offsetDis = offsetV.distanceSquared;
          if (offsetDis < minOffset) {
            minOffset = offsetDis;
            offset = offsetV;
          }
        }
      }
      let result;
      if (offset) {
        result = { x: offset.x + position.x, y: offset.y + position.y };
      }
      if (result) {
        return result;
      } else {
        return position;
      }
    }
    if (this._moveObj.og.observerGeo.length === 1) {
      const adsorptionPs = this.needAdsorptions.points;
      const result = AdsorptionTool.findHorizontalAndVertical(
        position,
        adsorptionPs
      );
      if (result) {
        return result;
      }
      return position;
    }
  }
}
