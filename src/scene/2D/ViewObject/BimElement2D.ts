import Constant from '../../../utils/Math/contanst/constant';
import Room from '../../Model/Home/Room';
import Structure, { StType } from '../../Model/Home/Structure';
import ObserveVector2D from '../../Model/ObserveMath/ObserveVector2D';
import Edge2D from './Edge2D';
import Polygon2D from './Polygon2D';
import Spot2D from './Spot2D';

export default class BimElement2D {
  public polygon!: Polygon2D;
  public edges: Edge2D[] = [];
  public spots: Spot2D[] = [];
  public model: Structure | Room;
  private _solidContainer: PIXI.Container;

  public renderWith(parent: PIXI.Container) {
    parent.addChild(this._solidContainer);
  }

  /**
   * @author lianbo
   * @date 2021-01-07 19:44:28
   * @Description: 一个bim的体在平面上是一个多边形，由一个Polygon2D和几条线，几个点组成
   */
  public constructor(model: Structure | Room) {
    this._solidContainer = new PIXI.Container();
    this.model = model;
    const polygon = this.model.polygon;
    const polyPs = polygon.vertices.map(
      (item) => new ObserveVector2D(item.x, item.y)
    );
    this.createPolygon2D(polyPs);
    for (const p of polyPs) {
      const spot = new Spot2D([p]);
      this._solidContainer.addChild(spot);
      this.spots.push(spot);
    }
    const tmpEdges: any[] = [];
    const lastV = polyPs[polyPs.length - 1];
    polyPs.reduce((prev, current, index) => {
      const seg = [prev, current];
      tmpEdges.push(seg);
      return current;
    }, lastV);
    for (const edge of tmpEdges) {
      const edge2d = new Edge2D(edge);
      this._solidContainer.addChild(edge2d);
      this.edges.push(edge2d);
    }
  }

  private createPolygon2D(polyPs: ObserveVector2D[]) {
    this.polygon = new Polygon2D(polyPs, {
      color: this.colorAlpha[0],
      alpha: this.colorAlpha[1],
    });
    this._solidContainer.addChild(this.polygon);
  }

  get cType(): string {
    if (this.model instanceof Structure) {
      return this.model.stType;
    }
    return '';
  }

  public get colorAlpha() {
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
}
