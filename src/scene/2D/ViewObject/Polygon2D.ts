import { autorun, reaction } from 'mobx';
import Constant from '../../../utils/Math/contanst/constant';
import BasicItem from '../../Model/Home/BasicItem';
import { StType } from '../../Model/Home/Structure';
import ObserveVector2D from '../../Model/ObserveMath/ObserveVector2D';
import GraphicsTool from '../Utils/GraphicsTool';
import DragContainer from './DragContainer';

export default class Polygon2D extends DragContainer {
  public dragModel!: BasicItem;
  private renderColor: number;
  private renderAlpha: number;
  public constructor(data: any, options: any = {}) {
    super();
    this.dragModel = new BasicItem(data);
    this.renderColor = options.color;
    this.renderAlpha = options.alpha;
    autorun(() => {
      this.detectArea();
    });
  }

  public detectArea() {
    this.clear();
    GraphicsTool.drawPolygon(this, this.dragModel.observerGeo, {
      alpha: this.renderAlpha,
      color: this.renderColor,
    });
  }

  public setColorAlpha(options?: any) {
    if (!options) return;
    this.renderAlpha = options.alpha;
    this.renderColor = options.color;
  }

  public get draggable() {
    return this.dragModel.draggable;
  }

  public set draggable(val: boolean) {
    this.dragModel.draggable = val;
  }
}
