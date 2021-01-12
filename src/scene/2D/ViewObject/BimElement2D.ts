import { reaction } from 'mobx';
import Constant from '../../../utils/Math/contanst/constant';
import ObservableGeometry from '../../Model/Home/ObservableGeometry';
import Room from '../../Model/Home/Room';
import Structure, { StType } from '../../Model/Home/Structure';
import ObserveVector2D from '../../Model/ObserveMath/ObserveVector2D';
import Edge2D from './Edge2D';
import Polygon2D from './Polygon2D';
import Spot2D from './Spot2D';

export default class BimElement2D extends PIXI.Container {
  public polygon!: Polygon2D;
  public edges: Edge2D[] = [];
  public spots: Spot2D[] = [];
  public model: Structure | Room;
  private polyPs: ObserveVector2D[];

  public renderWith(parent: PIXI.Container) {
    parent.addChild(this);
  }

  public get dragModel() {
    return this.polygon.dragModel;
  }
  /**
   * @author lianbo
   * @date 2021-01-07 19:44:28
   * @Description: 一个bim的体在平面上是一个多边形，由一个Polygon2D和几条线，几个点组成
   */
  public constructor(model: Structure | Room) {
    super();
    this.interactive = true;
    this.model = model;
    const polygon = this.model.polygon;
    this.polyPs = polygon.vertices.map(
      (item) => new ObserveVector2D(item.x, item.y)
    );
    this.createPolygon2D();
    // this.createEdgesAndSpot();
    reaction(
      () => {
        return this.model.isEdit;
      },
      (able) => {
        if (able) {
          this.createPolygon2D();
          this.createEdgesAndSpot();
        } else {
          this.createPolygon2D();
        }
        this.edges.forEach((item) => (item.interactive = able));
        this.spots.forEach((item) => (item.interactive = able));
      }
    );
    this.model.on('visibleEvent', () => (this.visible = this.model.visible));
  }

  private createPolygon2D() {
    if (this.polygon) {
      this.polygon.setColorAlpha({
        color: this.colorAlpha[0],
        alpha: this.colorAlpha[1],
      });
      this.polygon.detectArea();
      return;
    }
    this.polygon = new Polygon2D(
      { model: this.model, og: new ObservableGeometry(this.polyPs) }, // 一个数据模型和一个可观察的几何数据模型的接口
      {
        color: this.colorAlpha[0],
        alpha: this.colorAlpha[1],
      }
    );
    this.polygon.interactive = false;
    this.addChild(this.polygon);
  }

  get cType(): string {
    if (this.model instanceof Structure) {
      return this.model.stType;
    }
    return '';
  }

  public get colorAlpha() {
    if (this.model.isEdit) {
      return [0xff0000, 1];
    }
    let ca = [Constant.colorHexNumber('#8a8a8a'), 0.2];
    switch (this.cType) {
      case StType.Wall:
        ca = [Constant.colorHexNumber('#FFD700'), 0.8]; // 金色 0xFFD700
        break;
      case StType.PCWall:
        ca = [Constant.colorHexNumber('#FF5F12'), 0.7]; //#FF5F12
        break;
      case StType.Framing:
        ca = [Constant.colorHexNumber('#2e564b'), 0.3]; // 灰色
        break;
      case StType.Column:
        ca = [Constant.colorHexNumber('#000000'), 1];
        break;
      case StType.Door:
        ca = [Constant.colorHexNumber('#329908'), 0.5];
        break;
      case StType.Window:
        ca = [Constant.colorHexNumber('#0f719d'), 0.5];
        break;
    }
    return ca;
  }

  private createEdgesAndSpot() {
    this.createSpots();
    this.createEdges();
  }

  private createSpots() {
    if (this.spots.length > 0) {
      this.spots.forEach((item) => item.detectArea());
      return;
    }
    let index = 0;
    for (const p of this.polyPs) {
      const spot = new Spot2D({
        model: this.model,
        indices: [index],
        og: new ObservableGeometry([p]),
      });
      index++;
      this.addChild(spot);
      this.spots.push(spot);
    }
  }

  private createEdges() {
    if (this.edges.length > 0) {
      this.edges.forEach((edge) => edge.refreshEdge());
      return;
    }
    const tmpEdges: any[] = [];
    const lastV = this.polyPs[this.polyPs.length - 1];
    this.polyPs.reduce((prev, current, index) => {
      const seg = [prev, current];
      tmpEdges.push(seg);
      return current;
    }, lastV);

    let index = 0;
    let prev = this.polyPs.length - 1;
    for (const edge of tmpEdges) {
      const edge2d = new Edge2D({
        model: this.model,
        indices: [prev, index],
        og: new ObservableGeometry(edge),
      });
      index++;
      prev = index - 1;
      this.addChild(edge2d);
      this.edges.push(edge2d);
    }
  }
}
