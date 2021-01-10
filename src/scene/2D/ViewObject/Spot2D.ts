import { autorun, computed, reaction } from 'mobx';
import GraphicsTool from '../Utils/GraphicsTool';
import DragContainer from './DragContainer';

export default class Spot2D extends DragContainer {
  public dragModel!: any;
  public constructor(data: any) {
    super();
    this.dragModel = data;
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
    GraphicsTool.drawCircle(this, this.dragModel.og.position, 2, {
      alpha: this.alphaValue,
    });
  }
}
