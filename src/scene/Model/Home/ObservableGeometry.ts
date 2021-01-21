import Segment from '@/views/map/spaceInformation/mapEditor/utils/Math/geometry/Segment';
import Point from '../../../utils/Math/geometry/Point';
import Polygon from '../../../utils/Math/geometry/Polygon';
import ObserveVector2D from '../ObserveMath/ObserveVector2D';

export default class ObservableGeometry {
  public observerGeo!: ObserveVector2D[];

  public constructor(obs: ObserveVector2D[]) {
    this.observerGeo = obs;
  }
  public get position(): any {
    if (this.observerGeo.length == 1) {
      return { x: this.observerGeo[0].x, y: this.observerGeo[0].y };
    }
    if (this.observerGeo.length === 2) {
      return {
        x: (this.observerGeo[0].x + this.observerGeo[1].x) / 2,
        y: (this.observerGeo[0].y + this.observerGeo[1].y) / 2,
      };
    }
    if (this.observerGeo.length > 2) {
      const polygon = new Polygon(
        this.observerGeo.map((item) => new Point(item.x, item.y))
      );
      const center = polygon.centerPoint;
      return { x: center.x, y: center.y };
    }
  }

  public translate(vOrigin: any) {
    let v: any = vOrigin;
    // if (this.observerGeo.length === 2) {
    //   const start = new Point(this.observerGeo[0].x, this.observerGeo[0].y);
    //   const end = new Point(this.observerGeo[1].x, this.observerGeo[1].y);
    //   const seg = new Segment(start, end);
    //   const norDir = seg.dir.ccwNormal.normalize;
    //   const dis = vOrigin.dot(norDir);
    //   v = norDir.multiply(dis);
    // }
    for (const vElement of this.observerGeo) {
      vElement.set(vElement.x + v.x, vElement.y + v.y);
    }
  }
}
