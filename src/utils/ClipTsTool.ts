import { EPolygonContainType } from '../global/Enum/EnumData';
import Line2D from '../scene/Model/Geometry/Line2D';
import Polygon2D from '../scene/Model/Geometry/Polygon2D';
import Vector2D from '../scene/Model/Geometry/Vector2D';
import MathHelper from '../scene/Model/Util/MathHelper';
import ClipJsTool from './ClipJsTool';
export interface IBound {
  outPs: Polygon2D;
  holes: Polygon2D[];
}

/**
 * 裁剪库 by lianbo
 */
class ClipTsTool {
  private scaleInit: number = 100;

  /**
   * 合并多边形
   * @param paths
   */
  public unionPath(paths: Vector2D[][]): Vector2D[][] {
    if (paths.length === 1) {
      return paths;
    }
    const clipper: ClipJsTool = new ClipJsTool();
    const clipPath = this.pathsToIntPoints([paths[0]]);
    const subPs: Vector2D[][] = paths.slice();
    subPs.shift();
    const subPath = this.pathsToIntPoints(subPs);
    const result = clipper.unionPath(clipPath, subPath);
    const ps: Vector2D[][] = this.intPointsToV2s(result);
    return ps;
  }

  public polygonUnionPath(paths: Polygon2D[]): Polygon2D[] {
    const points: Vector2D[][] = MathHelper.polygonsToPoints(paths);
    const newPs: Vector2D[][] = this.unionPath(points);
    return MathHelper.pointsToPolygons(newPs);
  }

  private fixedSimplifyPath(path: Polygon2D, paths) {
    const area = path.area;
    const polyList = this.intPointsToV2s(paths);
    const simplifyPs = polyList[0];
    const area1 = MathHelper.calcArea(simplifyPs);
    if (area1 / area < 0.001) {
      return path;
      // const vertices = path.vertices.slice();
      // const newPs: Vector2D[] = [];
      // for (const p of vertices) {
      //   let isOverlap: boolean = false;
      //   for (const sP of simplifyPs) {
      //     if (p.equals(sP, 0.01)) {
      //       isOverlap = true;
      //       break;
      //     }
      //   }
      //   if (!isOverlap) {
      //     newPs.push(p);
      //   }
      // }
      // return new Polygon2D(newPs);
    }
    return null;
  }

  /**
   * 优化多边形，专门去掉如“8”字型的多边形
   * @param path
   */
  public simplifyPath(path: Polygon2D): Polygon2D {
    try {
      const clipper: ClipJsTool = new ClipJsTool();
      const pPath = this.v2sToIntPoints(path.vertices);
      const paths = clipper.simplifyPolygon(pPath);
      if (!paths || paths.length < 1) {
        return path;
      }
      if (paths.length < 2) {
        try {
          const fixPolygon = this.fixedSimplifyPath(path, paths);
          if (fixPolygon) {
            return fixPolygon;
          }
        } catch (e) {}
        const newPoints: Vector2D[][] = this.intPointsToV2s(paths);
        return new Polygon2D(newPoints[0]);
      } else {
        const points: Vector2D[][] = this.intPointsToV2s(paths);
        const polyList: Polygon2D[] = [];
        for (const ps of points) {
          polyList.push(new Polygon2D(ps));
        }

        polyList.sort((a, b) => {
          return a.area > b.area ? -1 : 1;
        });
        return polyList[0];
      }
    } catch (e) {
      return path;
    }
  }
  /**
   * 求相交部分
   * @param clip
   * @param sub
   */
  public intersectionPath(clip: Vector2D[][], sub: Vector2D[][]): Vector2D[][] {
    const clipper: ClipJsTool = new ClipJsTool();
    const subPath = this.pathsToIntPoints(sub);
    const clipPath = this.pathsToIntPoints(clip);

    const result = clipper.intersectionPath(clipPath, true, subPath, true);
    const ps: Vector2D[][] = this.intPointsToV2s(result);
    return ps;
  }

  /**
   * 裁剪
   * @param clip
   * @param sub
   */
  public differencePath(clip: Vector2D[][], sub: Vector2D[][]): Vector2D[][] {
    const clipper: ClipJsTool = new ClipJsTool();
    const subPath = this.pathsToIntPoints(sub);
    const clipPath = this.pathsToIntPoints(clip);

    const result = clipper.differencePath(clipPath, true, subPath, true);
    const ps: Vector2D[][] = this.intPointsToV2s(result);
    return ps;
  }
  public polygonDifferencePath(pClip: Polygon2D[], pSub: Polygon2D[]): Polygon2D[] {
    const clip: Vector2D[][] = MathHelper.polygonsToPoints(pClip);
    const sub: Vector2D[][] = MathHelper.polygonsToPoints(pSub);
    const newPs: Vector2D[][] = this.differencePath(clip, sub);
    return MathHelper.pointsToPolygons(newPs);
  }

  public polygonOffset(polygon: Polygon2D, offset: number): Polygon2D {
    const clipper: ClipJsTool = new ClipJsTool();
    const result = clipper.polygonOffset(this.polygonToIntPoints(polygon), Math.round(this.scaleInit * offset));
    const paths: Vector2D[][] = this.intPointsToV2s(result);
    if (paths.length === 1) {
      return new Polygon2D(paths[0]);
    }
  }
  public pointsOffset(points: Vector2D[], offset: number): Vector2D[] {
    const polygon = this.polygonOffset(new Polygon2D(points), offset);
    if (!polygon) {
      return points;
    }
    return polygon.vertices;
  }

  /**
   * 一条线和一个多边形相交，取出线段相交部分
   *     ---
   *    |   |
   * -----------
   *    |   |
   *    ----
   *      V
   *    ----
   * @param clip
   * @param sub
   */
  public lineIntersetPolygon(clips: Polygon2D, line: Vector2D[]): Vector2D[][] {
    const clipper: ClipJsTool = new ClipJsTool();
    const subPath = this.v2sToIntPoints(line);
    const clipPath = this.v2sToIntPoints(clips.vertices);
    const result = clipper.intersetLine(clipPath, subPath);
    const ps: Vector2D[][] = this.intPointsToV2s(result);
    return ps;
  }
  /**
   * 一条线和一个多边形相交，取出线段相交部分
   * @param clips
   * @param line
   */
  public line2DIntersetPolygon(clips: Polygon2D, line: Line2D): Line2D {
    const lines: Vector2D[][] = this.lineIntersetPolygon(clips, line.points);
    if (lines.length === 1) {
      if (lines[0].length === 2) {
        return new Line2D(lines[0][0], lines[0][1]);
      }
    }
    return null;
  }

  /**
   * 一条线被几个多边形裁剪
   *     ---    ---     ----
   *    |  |   |   |   |   |
   * --------------------------
   *    |  |   |   |   |   |
   *    ----   ----    ----
   *      V
   * --   ---   ---    ----
   * @param clip
   * @param sub
   */
  public cutLineByPolygons(clips: Polygon2D[], line: Vector2D[]): Vector2D[][] {
    const clipper: ClipJsTool = new ClipJsTool();
    const subPaths = this.pathsToIntPoints([line]);
    const clipPaths = [];
    clips.forEach(value => clipPaths.push(this.polygonToIntPoints(value)));
    const result = clipper.differencePath(clipPaths, true, subPaths, false);
    const ps: Vector2D[][] = this.intPointsToV2s(result);
    return ps;
  }

  /**
   * 一条线被1个多边形裁剪
   * @param clip
   * @param sub
   */
  public cutLineByPolygon(clip: Polygon2D, line: Vector2D[]): Vector2D[] {
    const clipper: ClipJsTool = new ClipJsTool();
    const subPaths = this.pathsToIntPoints([line]);
    const clipPaths = [this.polygonToIntPoints(clip)];

    const result = clipper.differencePath(clipPaths, true, subPaths, false);
    const ps: Vector2D[][] = this.intPointsToV2s(result);
    if (ps.length === 1) {
      return ps[0];
    }
    if (ps.length === 2) {
      return ps[0].length > ps[1].length ? ps[0] : ps[1];
    }
    return null;
  }

  /**
   *  Vector2D[][] 转成 InPoints[][]
   * @param points
   */
  public polygonToIntPoints(polygon: Polygon2D): any {
    return this.v2sToIntPoints(polygon.vertices);
  }

  /**
   *  Vector2D[][] 转成 InPoints[][]
   * @param points
   */
  public pathsToIntPoints(paths: Vector2D[][]): any {
    const newPaths = [];
    for (const path of paths) {
      newPaths.push(this.v2sToIntPoints(path));
    }
    return newPaths;
  }

  /**
   *  Vector2D[][] 转成 InPoints[][]
   * @param points
   */
  public v2sToIntPoints(points: Vector2D[]): any {
    const newPoints = [];
    for (const point of points) {
      const xx = Math.round(point.x * this.scaleInit);
      const yy = Math.round(point.y * this.scaleInit);
      const newPt: any = { X: xx, Y: yy };
      newPoints.push(newPt);
    }
    return newPoints;
  }

  /**
   * InPoints[][] 转成  Vector2D[][]
   * @param clip
   */
  public intPointsToV2s(clip: any): Vector2D[][] {
    const ps: any[] = Array.from(clip);
    let i = 0;
    const iCount = ps.length;
    let j = 0;
    let jCount = 0;
    const paths: Vector2D[][] = [];

    for (i = 0; i < iCount; i++) {
      jCount = ps[i].length;
      const path: Vector2D[] = [];
      for (j = 0; j < jCount; j++) {
        const xx: number = ps[i][j].X / this.scaleInit;
        const yy: number = ps[i][j].Y / this.scaleInit;

        path.push(new Vector2D(xx, yy));
      }
      paths.push(path);
    }
    return paths;
  }
  /**
   * 合并多变成，该合并的就合并，该修剪的就就修剪，
   * @param outPs
   * @param holes
   * @return IBound[] ,返回一些外边框以及对应的内部若干个洞
   */
  public mergePolygon(outPs: Polygon2D, holes: Polygon2D[]): IBound[] {
    try {
      if (holes) {
        if (holes.length > 1) {
          holes = this.polygonUnionPath(holes);
        }
      }

      let areaObjAr: IBound[] = [];
      if (holes && holes.length > 0) {
        for (const poly of holes) {
          if (Polygon2D.calcContainRelation(outPs, poly) === EPolygonContainType.AEqualB) {
            return null;
          }
        }

        const boundPs: Polygon2D[] = this.polygonDifferencePath(holes, [outPs]);
        if (!boundPs) {
          areaObjAr.push({ outPs, holes: null });
        } else {
          areaObjAr = this.filterInOutBound(boundPs);
        }
      } else {
        areaObjAr.push({ outPs, holes: null });
      }
      return areaObjAr;
    } catch (e) {
      console.error('裁剪库异常，请及时检查');
      return [{ outPs, holes: null }];
    }
  }
  /**
   * 筛选出外边界和洞集合
   * @param pointsAr
   */
  private filterInOutBound(polys: Polygon2D[]): IBound[] {
    const count = polys.length;
    const outPs: Polygon2D[] = [];

    // 查找polys哪些可以做最大边框，
    for (let i = 0; i < count; i++) {
      const poly = polys[i];
      let isSplit: boolean = true;
      for (let j = 0; j < count; j++) {
        if (i === j) {
          continue;
        }
        // 如果poly被包含，那么poly就不能是外边框
        if (Polygon2D.calcContainRelation(poly, polys[j]) === EPolygonContainType.BContainA) {
          isSplit = false;
          break;
        }
      }
      if (isSplit) {
        outPs.push(poly);
      }
    }

    // 如果大家都不分离，那最外面哪个就只外边框,其他是内框，不可能出现这样的情况啊
    // 如果有是异常了
    if (!outPs || outPs.length === 0) {
      polys.sort((a, b) => {
        return a.area > b.area ? -1 : 1;
      });
      outPs.push(polys[0]);
      const otherPolys = polys.slice();
      otherPolys.shift();
      return [{ outPs: polys[0], holes: otherPolys }];
    }

    // 确定外边框后，剩余的那些多边形寻找在哪些些外边框里面，
    const result: IBound[] = [];
    const holes: Polygon2D[] = polys.filter(value => !outPs.includes(value));
    for (const poly of outPs) {
      const inPs: Polygon2D[] = [];
      for (const pTemp of holes) {
        if (Polygon2D.calcContainRelation(poly, pTemp) === EPolygonContainType.AContainB) {
          inPs.push(pTemp);
        }
      }
      result.push({ outPs: poly, holes: inPs });
    }
    return result;
  }
}
export default new ClipTsTool();
