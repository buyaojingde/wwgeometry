import Point from '../../../utils/Math/geometry/Point';
import Polygon from '../../../utils/Math/geometry/Polygon';
import * as jsts from 'jsts';
import Segment from '../../../utils/Math/geometry/Segment';
import GeometryFactory = jsts.geom.GeometryFactory;
import BufferParameters = jsts.operation.buffer.BufferParameters;
import BufferOp = jsts.operation.buffer.BufferOp;
import Coordinate = jsts.geom.Coordinate;

export default class JSTSUtils {
  public static factory: GeometryFactory = new GeometryFactory();

  private static bufferParams: BufferParameters = new BufferParameters(8, 2, 2, 5.0);

  private static bufferRoundParams: BufferParameters = new BufferParameters(8, 1, 1, 5.0);

  /**
   * @author lianbo
   * @date 2020-11-26 14:14:28
   * @Description: 偏移
   */
  public static offset(g: any, distance: number): any {
    const op: BufferOp = new BufferOp(g, this.bufferParams);
    return op.getResultGeometry(distance);
  }

  /**
   * @author lianbo
   * @date 2020-11-26 14:31:05
   * @Description: polygon 转jsts的数据结构
   */
  public static i2Polygon(polygon: Polygon): any {
    return this.factory.createPolygon(this.i2LineRing(polygon.vertices), []);
  }

  public static i2Coordinate(p: any): any {
    return new Coordinate(p.x, p.y);
  }

  public static i2LineRing(p: any[]): any {
    const closePs: any[] = p.concat(p[0]);
    const coordinates = closePs.map(item => this.i2Coordinate(item));
    return this.factory.createLinearRing(coordinates);
  }

  /**
   * @author lianbo
   * @date 2020-11-26 14:57:04
   * @Description: 偏移polygon
   */
  public static iOffset(polygon: Polygon, distance: number): Polygon {
    const result = this.offset(this.i2Polygon(polygon), distance);
    return this.polygon2i(result);
  }

  /**
   * @author lianbo
   * @date 2020-11-26 14:56:30
   * @Description: ts的polygon转自己的polygon
   */
  public static polygon2i(tsPolygon: any): Polygon {
    const ps = tsPolygon.getCoordinates();
    ps.pop();
    return new Polygon(ps);
  }

  public static iUnion(plyg: Polygon, plyg1: Polygon): Polygon {
    const geo = this.i2Polygon(plyg);
    const geo1 = this.i2Polygon(plyg1);
    return this.polygon2i(geo.union(geo1));
  }
  /**
   * @author lianbo
   * @date 2020-11-26 16:19:00
   * @Description: 减法
   */
  public static iDifference(plyg: Polygon, plyg1: Polygon, offset = 0): Polygon {
    const geo = this.offset(this.i2Polygon(plyg), offset);
    const geo1 = this.offset(this.i2Polygon(plyg1), offset);
    const result = geo.difference(geo1);
    const reduction = this.offset(result, -offset);
    return this.polygon2i(reduction);
  }

  public static iUnionArr(plygs: Polygon[]): Polygon {
    const geos = plygs.map(item => this.i2Polygon(item));
    const firstGeo = geos[0];
    const result = geos.reduce((prev, current) => {
      return prev.union(current);
    }, firstGeo);
    return this.polygon2i(result);
  }

  public static i2Line(i: any) {
    return this.factory.createLineString([this.i2Coordinate(i.start), this.i2Coordinate(i.end)]);
  }

  public static point2I(coordinate: any): Point {
    return new Point(coordinate.x, coordinate.y);
  }

  public static line2I(line: any): Segment | null {
    try {
      const cs = line.getCoordinates();
      if (cs.length < 2) {
        return null;
      }
      const result = new Segment(this.point2I(cs[0]), this.point2I(cs[1]));
      return result;
    } catch (e) {
      console.error(e);
    }
    return null;
  }

  public static iItersectionPlg(plyg: Polygon, plyg1: Polygon): any {
    const geo = this.i2Polygon(plyg);
    const geo1 = this.i2Polygon(plyg1);
    return this.polygon2i(geo.intersection(geo1));
  }

  public static iIntersectionSeg(s0: any, s1: any, offset = 0) {
    const ls0 = this.i2Line(s0);
    const ls1 = this.i2Line(s1);
    const result = ls0.intersection(ls1);
    return this.line2I(result);
  }

  public static iIntersection(seg: Segment, seg1: Segment): Segment | null {
    if (seg.collinear(seg1)) {
      const result = JSTSUtils.iIntersectionSeg(seg, seg1);
      return result;
    }
    return null;
  }

  /**
   * @author lianbo
   * @date 2020-11-26 20:36:13
   * @Description: 一组线段和一组线段相交
   */
  public static iIntersecionSegs(segs: Segment[], segs1: Segment[]): Segment[] {
    const remain: Segment[] = [];
    for (const seg of segs) {
      for (const seg1 of segs1) {
        const inter = this.iIntersection(seg, seg1);
        if (inter) {
          remain.push(inter);
        }
      }
    }
    return remain;
  }

  /**
   * @author lianbo
   * @date 2020-11-26 20:36:13
   * @Description: 一组线段和一组线段相交
   */
  public static iIntersecionSegss(segss: Segment[][]): Segment[] {
    let i = 0;
    let remainSegs = segss[i];
    i++;
    while (i < segss.length) {
      remainSegs = this.iIntersecionSegs(remainSegs, segss[i]);
      i++;
    }
    return remainSegs;
  }

  public static iUnionSeg(s0: any, s1: any, offset = 0): any {
    const ls0 = this.i2Line(s0);
    const ls1 = this.i2Line(s1);
    const result = ls0.union(ls1);
    // return this.line2I(result);
    console.log(result);
  }

  public static i2Lines(ls: any): any {
    return this.factory.createLineString(ls.map((item: any) => this.i2Coordinate(item)));
  }

  public static line2Segs(ps: any) {}
}
