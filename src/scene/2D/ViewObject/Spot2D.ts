import { autorun, reaction } from 'mobx';
import BasicItem from '../../Model/Home/BasicItem';
import GraphicsTool from '../Utils/GraphicsTool';
import DragContainer from './DragContainer';

export default class Spot2D extends DragContainer {
  public dragModel!: BasicItem;
  public constructor(data: any) {
    super();
    this.dragModel = new BasicItem(data);
    autorun(() => {
      this.detectArea();
    });
  }

  public detectArea() {
    this.clear();
    GraphicsTool.drawCircle(this, this.dragModel.position, 2, { alpha: 0 });
  }
}
