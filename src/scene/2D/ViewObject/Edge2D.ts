import { autorun, reaction } from 'mobx';
import Point from '../../../utils/Math/geometry/Point';
import Segment from '../../../utils/Math/geometry/Segment';
import BasicItem from '../../Model/Home/BasicItem';
import ObserveVector2D from '../../Model/ObserveMath/ObserveVector2D';
import GraphicsTool from '../Utils/GraphicsTool';
import DragContainer from './DragContainer';

export default class Edge2D extends DragContainer {
  public dragModel!: BasicItem;
  public constructor(data: any) {
    super();
    this.dragModel = new BasicItem(data);
    autorun(() => {
      this.refreshEdge();
    });
  }

  /**
   * @author lianbo
   * @date 2021-01-05 19:11:32
   * @Description: 计算检测的封闭区域
   */
  public calcDetect(): Point[] {
    const start = new Point(
      this.dragModel.observerGeo[0].x,
      this.dragModel.observerGeo[0].y
    );
    const end = new Point(
      this.dragModel.observerGeo[1].x,
      this.dragModel.observerGeo[1].y
    );
    const edge = new Segment(start, end);
    return edge.offset(2).vertices;
  }

  public refreshEdge() {
    this.clear();
    this.renderEdge();
    this.detectArea();
  }

  public detectArea() {
    const ps = this.calcDetect();
    GraphicsTool.drawPolygon(this, ps, { alpha: 0 });
  }

  public renderEdge() {
    GraphicsTool.drawLine(
      this,
      this.dragModel.observerGeo[0],
      this.dragModel.observerGeo[1],
      {
        color: 0xff0000,
      }
    );
    this.moveTo(
      this.dragModel.observerGeo[0].x,
      this.dragModel.observerGeo[0].y
    );
    this.lineTo(
      this.dragModel.observerGeo[1].x,
      this.dragModel.observerGeo[1].y
    );
  }
}
