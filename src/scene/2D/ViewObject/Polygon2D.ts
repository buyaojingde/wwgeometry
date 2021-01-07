import { autorun, reaction } from 'mobx';
import BasicItem from '../../Model/Home/BasicItem';
import ObserveVector2D from '../../Model/ObserveMath/ObserveVector2D';
import GraphicsTool from '../Utils/GraphicsTool';
import DragContainer from './DragContainer';

export default class Polygon2D extends DragContainer {
  public dragModel!: BasicItem;
  public constructor(data: any) {
    super();
    this.dragModel = new BasicItem(data);
    autorun((edge) => {
      this.detectArea();
    });
  }

  public detectArea() {
    this.clear();
    GraphicsTool.drawPolygon(this, this.dragModel.observerGeo, { alpha: 0.5 });
  }
}
