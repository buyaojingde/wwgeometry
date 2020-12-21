// @ts-ignore
import ClipperLib = require('@doodle3d/clipper-js');
import Shape from '@doodle3d/clipper-js';
// import { Clipper, IntPoint } from 'js-clipper'
// import PickUp from '../../../scene/3D/PickUp';

export default class PolygonClipper {
  /**
   *合集
   * @param childPoints
   */
  public static unionPoint(childPoints: any[][]): any[][] {
    const shape: Shape = PolygonClipper.unionPath(childPoints);
    return PolygonClipper.ShapeToV2s(shape);
  }

  /**
   * 差集
   * @param outPs
   * @param holePs
   */
  public static intersectionPoint(outPs: any[], holePs: any[][]): any[][] {
    const shape: Shape = PolygonClipper.intersectionPath(outPs, holePs);
    return PolygonClipper.ShapeToV2s(shape);
  }

  /**
   *
   * @param outPs
   * @param holePs
   */
  public static differencePoint(outPs: any[], holePs: any[][]): any[][] {
    const shape: Shape = PolygonClipper.differencePath(outPs, holePs);
    return PolygonClipper.ShapeToV2s(shape);
  }

  /* 2019-Sep-14, this whole file move to Polygon2D is more reasonable,

  I not do it right now, because maybe we need to use truf,
  but truf is not in this version, I can not compare it now.
  Just add it here.  */
  public static offset(outPs: any[], offsetValue: number): any[][] {
    const subject = PolygonClipper.pointsToShape([outPs]);
    const resizeShape: Shape = subject.offset(
      offsetValue * PolygonClipper.scaleInit
    );
    return this.ShapeToV2s(resizeShape);
  }

  /**
   * 偏移
   * @param offsetValue 内偏移负值，外偏移正值
   * (外偏移保留尖角,内偏移自动减少边)
   */
  public static jtMiterOffset(outPs: any[], offsetValue: number) {
    const subject = PolygonClipper.pointsToShape([outPs]);
    const option: any = {
      jointType: 'jtMiter',
      miterLimit: 2000.0,
    };
    const resizeShape: Shape = subject.offset(
      offsetValue * PolygonClipper.scaleInit,
      option
    );
    return this.ShapeToV2s(resizeShape);
  }

  private static scaleInit = 10000;
  private static unionPath(childPoints: any[][]): Shape {
    const firstPath: any[] = childPoints[0];
    const paths: any[][] = childPoints.slice();
    paths.shift();
    const subject = PolygonClipper.pointsToShape([firstPath]);
    const clip = PolygonClipper.pointsToShape(paths);
    subject.offset(1); // 这个没啥用
    clip.offset(1); // 这个没啥用
    const result = subject.union(clip);
    return result;
  }
  public static pointsToShape(points: any[][]): Shape {
    let i = 0;
    const iCount = points.length;
    let j = 0;
    let jCount = 0;
    const paths = [];
    for (i = 0; i < iCount; i++) {
      jCount = points[i].length;
      const newPoints = [];
      for (j = 0; j < jCount; j++) {
        const xx = Math.round(points[i][j].x * PolygonClipper.scaleInit);
        const yy = Math.round(points[i][j].y * PolygonClipper.scaleInit);
        const newPt: any = { X: xx, Y: yy };
        newPoints.push(newPt);
      }
      paths.push(newPoints);
    }
    return new Shape(paths, true);
  }
  private static ShapeToV2s(clip: Shape): any[][] {
    const ps: ClipperLib.Point[][] = clip.paths;
    let i = 0;
    const iCount = ps.length;
    let j = 0;
    let jCount = 0;
    const paths: any[][] = [];

    for (i = 0; i < iCount; i++) {
      jCount = ps[i].length;
      const path: any[] = [];
      for (j = 0; j < jCount; j++) {
        const xx: number = ps[i][j].X / PolygonClipper.scaleInit;
        const yy: number = ps[i][j].Y / PolygonClipper.scaleInit;

        path.push({ x: xx, y: yy });
      }
      paths.push(path);
    }
    return paths;
  }

  private static intersectionPath(outPs: any[], holePs: any[][]): Shape {
    const subject = PolygonClipper.pointsToShape([outPs]);
    const clip = PolygonClipper.pointsToShape(holePs);
    subject.offset(1);
    clip.offset(1);
    const result = subject.intersect(clip);
    return result;
  }

  private static differencePath(outPs: any[], holePs: any[][]): Shape {
    const subject = PolygonClipper.pointsToShape([outPs]);
    const clip = PolygonClipper.pointsToShape(holePs);
    subject.offset(1);
    clip.offset(1);
    const result = subject.difference(clip);
    return result;
  }
}
