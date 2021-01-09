import { autorun, computed, reaction } from 'mobx';
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
    reaction(
      () => {
        return this.isHover;
      },
      (status) => {
        this.detectArea();
      }
    );
  }

  @computed
  public get alphaValue(): number {
    return this.isHover ? 1 : 0.01;
  }

  public detectArea() {
    this.clear();
    GraphicsTool.drawCircle(this, this.dragModel.position, 2, {
      alpha: this.alphaValue,
    });
  }

  public get draggable() {
    return this.dragModel.draggable;
  }

  public set draggable(val: boolean) {
    this.dragModel.draggable = val;
  }
}
