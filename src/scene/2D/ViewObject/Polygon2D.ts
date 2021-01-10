import { autorun } from 'mobx';
import GraphicsTool from '../Utils/GraphicsTool';
import DragContainer from './DragContainer';

export default class Polygon2D extends DragContainer {
  public dragModel!: any;
  private renderColor: number;
  private renderAlpha: number;
  public constructor(data: any, options: any = {}) {
    super();
    this.dragModel = data;
    this.renderColor = options.color;
    this.renderAlpha = options.alpha;
    autorun(() => {
      this.detectArea();
    });
  }

  public detectArea() {
    this.clear();
    GraphicsTool.drawPolygon(this, this.dragModel.og.observerGeo, {
      alpha: this.renderAlpha,
      color: this.renderColor,
    });
  }

  public setColorAlpha(options?: any) {
    if (!options) return;
    this.renderAlpha = options.alpha;
    this.renderColor = options.color;
  }
}
