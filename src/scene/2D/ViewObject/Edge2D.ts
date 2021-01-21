import { autorun, computed, reaction } from 'mobx';
import Point from '../../../utils/Math/geometry/Point';
import Segment from '../../../utils/Math/geometry/Segment';
import GraphicsTool from '../Utils/GraphicsTool';
import DragContainer from './DragContainer';

export default class Edge2D extends DragContainer {
  public dragModel!: any;
  private renderColor = 0x000000;
  private renderAlpha = 1;
  public constructor(data: any) {
    super();
    this.dragModel = data;
    autorun(() => {
      this.refreshEdge();
    });
    reaction(
      () => {
        return this.isHover;
      },
      (status) => {
        this.refreshEdge();
      }
    );
  }

  @computed
  public get alphaValue(): number {
    return this.isHover || this.dragModel.model.getDragEdgeState(this.index)
      ? this.renderAlpha
      : 0.01;
  }

  /**
   * @author lianbo
   * @date 2021-01-05 19:11:32
   * @Description: 计算检测的封闭区域
   */
  public calcDetect(): Point[] {
    const start = new Point(
      this.dragModel.og.observerGeo[0].x,
      this.dragModel.og.observerGeo[0].y
    );
    const end = new Point(
      this.dragModel.og.observerGeo[1].x,
      this.dragModel.og.observerGeo[1].y
    );
    let edge = new Segment(start, end);
    if (edge.length > 2) edge = edge.shorten(1);
    return edge.offset(2).vertices;
  }

  public refreshEdge() {
    this.clear();
    // this.renderEdge();
    this.detectArea();
  }

  public detectArea() {
    const ps = this.calcDetect();
    GraphicsTool.drawPolygon(this, ps, {
      alpha: this.alphaValue,
      color: this.renderColor,
    });
  }

  public setColorAlpha(options?: any) {
    if (!options) return;
    this.renderAlpha = options.alpha;
    this.renderColor = options.color;
  }
  public renderEdge() {
    GraphicsTool.drawLine(
      this,
      this.dragModel.og.observerGeo[0],
      this.dragModel.og.observerGeo[1],
      {
        color: 0xff0000,
      }
    );
    // this.moveTo(
    //   this.dragModel.observerGeo[0].x,
    //   this.dragModel.observerGeo[0].y
    // );
    // this.lineTo(
    //   this.dragModel.observerGeo[1].x,
    //   this.dragModel.observerGeo[1].y
    // );
  }

  setDragState(b: boolean) {
    this.dragModel.model.setDragEdgeState(b, this.index);
  }

  get index(): number {
    return this.dragModel.indices[0];
  }
}
