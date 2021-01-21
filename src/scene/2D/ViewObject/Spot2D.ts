import { autorun, computed, observable, reaction } from 'mobx';
import GraphicsTool from '../Utils/GraphicsTool';
import DragContainer from './DragContainer';

export default class Spot2D extends DragContainer {
  public dragModel!: any;
  private renderColor = 0x000000;
  private renderAlpha = 1;

  get index(): number {
    return this.dragModel.indices[0];
  }
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
    return this.isHover || this.dragModel.model.getDragState(this.index)
      ? this.renderAlpha
      : 0.01;
  }

  public detectArea() {
    this.clear();
    GraphicsTool.drawCircle(this, this.dragModel.og.position, 2.5, {
      alpha: this.alphaValue,
      color: this.renderColor,
    });
  }
  public setColorAlpha(options?: any) {
    if (!options) return;
    this.renderAlpha = options.alpha;
    this.renderColor = options.color;
  }

  setDragState(b: boolean) {
    this.dragModel.model.setDragState(b, this.index);
  }
}
