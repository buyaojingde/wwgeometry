import { reaction } from 'mobx';
import ObserveVector2D from '../../Model/ObserveMath/ObserveVector2D';
import DragContainer from './DragContainer';

export default class Edge2D extends DragContainer {
  public seg!: ObserveVector2D[];
  public constructor() {
    super();
    reaction(
      () => this.seg,
      (edge) => {
        this.renderEdge();
      }
    );
  }

  public renderEdge() {
    this.moveTo(this.seg[0].x, this.seg[0].y);
    this.lineTo(this.seg[1].x, this.seg[1].y);
  }
}
