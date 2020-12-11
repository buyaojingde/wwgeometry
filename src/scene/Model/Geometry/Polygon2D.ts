import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import difference from "@turf/difference";
import { MultiPolygon, multiPolygon, Polygon, polygon } from "@turf/helpers";
import intersect from "@turf/intersect";
import { isEmpty } from "lodash";
import { EPolygonContainType } from "../../../global/Enum/EnumData";
import MathHelper from "../Util/MathHelper";
import MathTool from "../Util/MathTool";
import Vector2DTool from "../Util/Vector2DTool";
import BoundingBox2D from "./BoundingBox2D";
import Box2D from "./Box2D";
import Line2D from "./Line2D";
import Line2DTool from "./Line2DTool";
import Lineseg2D from "./Lineseg2D";
import Vector2D from "./Vector2D";

// const preprocessPolygon = require('point-in-big-polygon');
// declare function require(moduleName: string): any;
export default class Polygon2D {
  private _invalidateFlag: boolean;

  constructor(vecs: Vector2D[]) {
    this._vertices = [];
    this._boundingBox = new BoundingBox2D();
    this._invalidateFlag = false;

    if (vecs) {
      this.vertices = vecs.concat();
      // console.error("this.vertices :" + this.vertices.toString())
    }
  }

  get debugCad(): string {
    return Vector2DTool.getCadDebugString(this.vertices);
  }

  set debugCad(s: string) {
    // only for debug
  }

  get barryCenter(): Vector2D {
    let num7 = 0;
    let num6 = 0;
    let num4 = NaN;
    let num3 = 0;
    let num2 = 0;
    const vec5: Vector2D[] = this._vertices.concat();
    const num1: number = Polygon2D.calculateSignedArea(vec5);
    const num8: number = vec5.length;
    num7 = 0;
    num6 = 1;

    while (num7 < num8 && num6 < num8) {
      num4 = vec5[num7].x * vec5[num6].y - vec5[num6].x * vec5[num7].y;
      num3 = num3 + (vec5[num7].x + vec5[num6].x) * num4;
      num2 = num2 + (vec5[num7].y + vec5[num6].y) * num4;
      num7 = num7 + 1;
      num6 = (num7 + 1) % num8;
    }
    return new Vector2D(num3, num2).multiplyBy(1 / (num1 * 6));
  }

  get center(): Vector2D {
    return Polygon2D.calculateCenter(this._vertices);
  }

  get boundingCenter(): Vector2D {
    return this.boundingBox.getCenter();
  }

  get area(): number {
    return Polygon2D.calculateArea(this._vertices);
  }

  get boundingArea(): number {
    return this.boundingBox.getArea();
  }

  private _boundingPoly!: Polygon2D;

  get boundingPoly(): Polygon2D {
    if (!this._boundingPoly) {
      const vertices: Vector2D[] = this._boundingBox.boundingPoints;
      this._boundingPoly = new Polygon2D(vertices);
    }

    return this._boundingPoly;
  }

  private _vertices: Vector2D[];

  get vertices(): Vector2D[] {
    return this._vertices;
  }

  set vertices(vecs: Vector2D[]) {
    this._vertices = vecs;
    this.invalidate();
    return;
  }

  private _boundingBox: BoundingBox2D;

  get boundingBox(): BoundingBox2D {
    if (!this._invalidateFlag) {
      this.build();
    }
    return this._boundingBox;
  }

  public static isIntersected(
    polygon1: Polygon2D,
    polygon2: Polygon2D
  ): boolean {
    const poly6: BoundingBox2D = polygon1.boundingBox;
    const poly5: BoundingBox2D = polygon2.boundingBox;
    if (!poly6 || !poly5 || !poly6.isIntersected(poly5)) {
      return false;
    }
    const len1: number = polygon1.vertices.length;
    const len2: number = polygon2.vertices.length;
    if (
      polygon1.contains(polygon2.vertices[0]) ||
      polygon1.contains(polygon2.vertices[len2 - 1]) ||
      polygon1.contains(polygon2.vertices[len2 / 2]) ||
      polygon2.contains(polygon1.vertices[0]) ||
      polygon2.contains(polygon1.vertices[len1 - 1]) ||
      polygon2.contains(polygon1.vertices[len1 / 2])
    ) {
      return true;
    }

    const edges8: Line2D[] = polygon1.getEdges();
    const edges7: Line2D[] = polygon2.getEdges();
    for (const edge4 of edges8) {
      for (const edge3 of edges7) {
        if (
          edge4.length &&
          edge3.length &&
          Line2DTool.isSegmentCollided(edge4, edge3, true)
        ) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * 判断是否两多段线相交，在忽略边重合的情况下
   *
   * @return 是否相交
   * */
  public static isIntersectedIgnoreSide(
    polygon1: Polygon2D,
    polygon2: Polygon2D,
    tolOnSide = 1e-3
  ): boolean {
    const lines1: Lineseg2D[] = polygon1.getSegEdges();
    const lines2: Lineseg2D[] = polygon2.getSegEdges();

    for (const line1 of lines1) {
      for (const line2 of lines2) {
        const ptIntersect: Vector2D = Lineseg2D.getIntersection(
          line1,
          line2,
          tolOnSide,
          5
        );
        if (ptIntersect) {
          if (
            // 交点是线段端点的情况
            ptIntersect.equals(line1.start, tolOnSide) ||
            ptIntersect.equals(line1.end, tolOnSide) ||
            ptIntersect.equals(line2.start, tolOnSide) ||
            ptIntersect.equals(line2.end, tolOnSide)
          ) {
          } else {
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * 判断是否两多段线相交，在忽略边重合的情况下
   *
   * @return 是否相交
   * */
  public static isIntersectedForPolygon(
    polygon1: Polygon2D,
    polygon2: Polygon2D,
    tolOnSide = 1e-3
  ): boolean {
    const lines1: Lineseg2D[] = polygon1.getSegEdges();
    const lines2: Lineseg2D[] = polygon2.getSegEdges();
    // MarsTest.clear();
    for (const line1 of lines1) {
      for (const line2 of lines2) {
        const ptIntersect: Vector2D = Lineseg2D.getIntersection(
          line1,
          line2,
          tolOnSide,
          5
        );
        if (ptIntersect) {
          if (
            // 交点是线段端点的情况
            ptIntersect.equals(line1.start, tolOnSide) ||
            ptIntersect.equals(line1.end, tolOnSide)
          ) {
            // MarsTest.drawPoint(ptIntersect);
          } else {
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * 判断重叠边的包含关系
   * @param polygon1
   * @param polygon2
   * @param tolOnSide
   * @returns true 表示相交或包含，false表示不包含不相交
   */
  public static isIntersectedIgnoreSideAdvance(
    polygon1: Polygon2D,
    polygon2: Polygon2D,
    tolOnSide = 1e-3
  ): boolean {
    let isValid = this.isIntersectedIgnoreSide(polygon1, polygon2, tolOnSide);
    // 当边不相交时判断中心点是否存在包含
    if (!isValid) {
      isValid = polygon2.containsInclusive(polygon1.getBoundingCenter());
    }
    return isValid;
  }

  /**
   * 一个多边形是否包含另一个多边形
   * @param polygon1 ：多边形1
   * @param polygon2 ：多边形2
   * @return 0:不符合规则      1:polygon1 contain polygon2    2:polygon2 contain polygon1
   * */
  public static isOneContainOne(
    polygon1: Polygon2D,
    polygon2: Polygon2D
  ): number {
    let nPreRet = 0;
    let polygonBig!: Polygon2D;
    let polygonSmall!: Polygon2D;
    if (polygon1.contains(polygon2.vertices[0])) {
      nPreRet = 1;
      polygonBig = polygon1;
      polygonSmall = polygon2;
    } else if (polygon2.contains(polygon1.vertices[0])) {
      nPreRet = 2;
      polygonBig = polygon2;
      polygonSmall = polygon1;
    }

    if (polygonBig && polygonSmall) {
      for (const v of polygonSmall.vertices) {
        if (!polygonBig.contains(v)) {
          return 0;
        }
      }
    }

    return nPreRet;
  }

  /**
   * 一个多边形是否包含另一个多边形,包括重叠边
   * @param polygon1 ：多边形1
   * @param polygon2 ：多边形2
   * @return 0:不符合规则      1:polygon1 contain polygon2    2:polygon2 contain polygon1
   * */
  public static isOneContainOneInclusiveSide(
    polygon1: Polygon2D,
    polygon2: Polygon2D
  ): number {
    let nPreRet = 0;
    let polygonBig!: Polygon2D;
    let polygonSmall!: Polygon2D;
    if (polygon1.containsInclusive(polygon2.vertices[0])) {
      nPreRet = 1;
      polygonBig = polygon1;
      polygonSmall = polygon2;
    } else if (polygon2.containsInclusive(polygon1.vertices[0])) {
      nPreRet = 2;
      polygonBig = polygon2;
      polygonSmall = polygon1;
    }

    if (polygonBig && polygonSmall) {
      for (const v of polygonSmall.vertices) {
        if (!polygonBig.containsInclusive(v)) {
          return 0;
        }
      }
    }

    return nPreRet;
  }

  /**
   * 计算包含关系,用裁剪库面积处理,精度不高,要慎用
   * 计算包含关系(交集)
   * @param polygonA
   * @param polygonB
   * @param toleranceArea 面积容差(存在精度问题,参考值为100)
   * @return EPolygonContainType
   */
  public static calcContainRelationForTurf(
    polygonA: Polygon2D,
    polygonB: Polygon2D,
    toleranceArea = 1e-3
  ): EPolygonContainType {
    const polygonIntersect: Polygon2D = polygonA.intersectPolygon(
      polygonB,
      toleranceArea
    );
    if (polygonIntersect === null) {
      // 贝塞尔会发生异常
      return EPolygonContainType.Error;
    }
    if (isEmpty(polygonIntersect)) {
      return EPolygonContainType.Split;
    } else {
      if (
        !MathTool.numberEquals(
          polygonIntersect.area,
          polygonB.area,
          toleranceArea
        ) &&
        !MathTool.numberEquals(
          polygonIntersect.area,
          polygonA.area,
          toleranceArea
        )
      ) {
        // MarsTest.clear();
        // MarsTest.drawPolygon(polygonIntersect);
        return EPolygonContainType.Intersection;
      } else {
        if (MathTool.numberLess(polygonB.area, polygonA.area, toleranceArea)) {
          // polygonA包含polygonB
          return EPolygonContainType.AContainB;
        } else if (
          MathTool.numberLess(polygonA.area, polygonB.area, toleranceArea)
        ) {
          // polygonB包含polygonA
          return EPolygonContainType.BContainA;
        } else if (
          MathTool.numberEquals(polygonA.area, polygonB.area, toleranceArea)
        ) {
          // 面积相等(重叠)
          return EPolygonContainType.AEqualB;
        } else {
          return EPolygonContainType.Split;
        }
      }
    }
  }

  public static calculateCenter(vecs: Vector2D[]): Vector2D {
    const vec: Vector2D = new Vector2D(0, 0);
    for (const vec2 of vecs) {
      vec.incrementBy(vec2);
    }
    return vec.multiplyBy(1 / vecs.length);
  }

  public static calculateSignedArea(vecs: Vector2D[]): number {
    let num3 = 0;
    const len4: number = vecs.length;
    if (!vecs || vecs.length < 3 || !vecs[0] || !vecs[len4 - 1]) {
      return 0;
    }

    let len2: number = vecs[0].y * (vecs[len4 - 1].x - vecs[1].x);
    num3 = 1;
    while (num3 < len4) {
      len2 =
        len2 + vecs[num3].y * (vecs[num3 - 1].x - vecs[(num3 + 1) % len4].x);
      num3 = num3 + 1;
    }
    return len2 / 2;
  }

  public static calculateArea(vecs: Vector2D[]): number {
    return Math.abs(Polygon2D.calculateSignedArea(vecs));
  }

  public static isClockwise(vecs: Vector2D[]): boolean {
    return Polygon2D.calculateSignedArea(vecs) > 0;
  }

  /**
   * 两面墙是否能放置
   * @param param1
   * @param param2
   * @return
   * by space
   */

  public static isIntersectedOnWall(
    polygon1: Polygon2D,
    polygon2: Polygon2D
  ): boolean {
    const poly1: BoundingBox2D = polygon1.boundingBox;
    const poly2: BoundingBox2D = polygon2.boundingBox;
    if (!poly1 || !poly2 || !poly1.isIntersected(poly2)) {
      return false;
    }
    const lineArr1: Line2D[] = polygon1.getEdges();
    const lineArr2: Line2D[] = polygon2.getEdges();
    let point = 0;

    for (const line1 of lineArr1) {
      for (const line2 of lineArr2) {
        if (
          line1.length &&
          line2.length &&
          Line2DTool.isSegmentCollided(line1, line2, false)
        ) {
          point = point + 1;
        }
      }
    }
    const is = point > 2;
    // console.trace("is>>" + is.toString());
    return is; // 4个点为相交
  }

  public static isInterSectedOnWallO(
    polygon1: Polygon2D,
    polygon2: Polygon2D
  ): boolean {
    const poly1: BoundingBox2D = polygon1.boundingBox;
    const poly2: BoundingBox2D = polygon2.boundingBox;
    return poly1.isIntersected(poly2);
  }

  /**
   * 两个多边形是否存在包含关系（不忽略边重合的情况）
   * @param polygon1:检测的多边形1
   * @param polygon2:检测的多边形2
   * @return boolean:返回的结果
   * @auther lianbo
   * */
  public static isContainedForCAD(
    polygon1: Polygon2D,
    polygon2: Polygon2D
  ): boolean {
    const poly6: BoundingBox2D = polygon1.boundingBox;
    const poly4: BoundingBox2D = polygon2.boundingBox;
    if (!poly6 || !poly4 || !poly6.isIntersected(poly4)) {
      return false;
    }

    let be8 = true;
    let be7 = true;
    for (const vec3 of polygon1.vertices) {
      if (!polygon2.containsInclusive(vec3)) {
        be8 = false;
        break;
      }
    }

    for (const vec5 of polygon2.vertices) {
      if (!polygon1.containsInclusive(vec5)) {
        be7 = false;
        break;
      }
    }
    return be7 || be8;
  }

  public static isContained(polygon1: Polygon2D, polygon2: Polygon2D): boolean {
    const poly6: BoundingBox2D = polygon1.boundingBox;
    const poly4: BoundingBox2D = polygon2.boundingBox;
    if (!poly6 || !poly4 || !poly6.isIntersected(poly4)) {
      return false;
    }

    let be8 = true;
    let be7 = true;
    for (const vec3 of polygon1.vertices) {
      if (!polygon2.containsExclusive(vec3)) {
        be8 = false;
        break;
      }
    }

    for (const vec5 of polygon2.vertices) {
      if (!polygon1.containsExclusive(vec5)) {
        be7 = false;
        break;
      }
    }
    return be7 || be8;
  }

  public static translatePoints(vecs: Vector2D[], vec: Vector2D): Vector2D[] {
    const vec4: Vector2D[] = [];
    for (const vec3 of vecs) {
      if (!vec3) {
        continue;
      }
      if (!vec) {
        continue;
      }
      vec4.push(vec3.subtract(vec));
    }
    return vec4;
  }

  public static removeDuplicates(vecs: Vector2D[], nummin = 1e-3) {
    let num4 = 0;
    let num3 = 0;
    num4 = 0;
    while (num4 < vecs.length - 1) {
      num3 = num4 + 1;
      while (num3 < vecs.length) {
        if (vecs[num4].equals(vecs[num3], nummin)) {
          vecs.splice(num3, 1);
        }
        num3 = num3 + 1;
      }
      num4 = num4 + 1;
    }
    return;
  }

  public static createNormalPolygon(): Polygon2D {
    const vecs: Vector2D[] = [];
    vecs.push(new Vector2D(0, 0));
    vecs.push(new Vector2D(1, 0));
    vecs.push(new Vector2D(1, 1));
    vecs.push(new Vector2D(0, 1));
    return new Polygon2D(vecs);
  }

  /**
   * 两个多边形重合的部分
   * @param   多边形1
   * @param  多边形2
   * @param   阈值
   * @return 重合的line2d
   *
   */
  public static getPolDoublicationEdges(
    pol1: Polygon2D,
    pol2: Polygon2D
  ): Line2D[] {
    const resVec: Line2D[] = [];

    // for (var i: number = 0; i < pol1Edges.length; i = i   + 1) {
    //   var lineA: Line2D = pol1Edges[i  ]
    //   for (var j: number = 0; j < pol2Edges.length; j = j   + 1) {
    //     var lineB: Line2D = pol2Edges[j  ]
    //     if (lineA.equalsWithoutDirection(lineB, tol)) {
    //       // 完全重合
    //       resVec.push(lineA)
    //       //						trace("line "+lineA.start.x+","+lineA.start.y+" "+lineA.end.x+","+lineA.end.y+"\n");
    //     } else if (
    //       lineA.contains_new(lineB, tol) ||
    //       lineA.contains(lineB, tol)
    //     ) {
    //       // 包含
    //       resVec.push(lineB)
    //       //						trace("line "+lineB.start.x+","+lineB.start.y+" "+lineB.end.x+","+lineB.end.y+"\n");
    //     } else if (
    //       lineB.contains_new(lineA, tol) ||
    //       lineB.contains(lineA, tol)
    //     ) {
    //       resVec.push(lineA)
    //       //						trace("line "+lineA.start.x+","+lineA.start.y+" "+lineA.end.x+","+lineA.end.y+"\n");
    //     } else if (
    //       lineA.isPointOnSegment(lineB.start, true, tol) &&
    //       lineB.isPointOnSegment(lineA.end, true, tol)
    //     ) {
    //       //部分重合
    //       /*
    // 			   start ▁▁▁▁▁▁▁▁       lineA
    // 				start     ┆▁▁▁▁┆▁▁▁        lineB
    // 			*/
    //       resVec.push(new Line2D(lineB.start, lineA.end))
    //       //						trace("line "+lineB.start.x+","+lineB.start.y+" "+lineA.end.x+","+lineA.end.y+"\n");
    //     } else if (
    //       lineA.isPointOnSegment(lineB.start, true, tol) &&
    //       lineB.isPointOnSegment(lineA.start, true, tol)
    //     ) {
    //       /*
    // 				  end ▁▁▁▁▁▁▁▁       lineA
    // 				start     ┆▁▁▁▁┆▁▁▁        lineB
    // 			*/
    //       resVec.push(new Line2D(lineB.start, lineA.start))
    //       //						trace("line "+lineB.start.x+","+lineB.start.y+" "+lineA.start.x+","+lineA.start.y+"\n");
    //     } else if (
    //       lineA.isPointOnSegment(lineB.end, true, tol) &&
    //       lineB.isPointOnSegment(lineA.end, true, tol)
    //     ) {
    //       /*
    // 				start ▁▁▁▁▁▁▁▁       lineA
    // 				  end     ┆▁▁▁▁┆▁▁▁        lineB
    // 			*/
    //       resVec.push(new Line2D(lineB.end, lineA.end))
    //       //						trace("line "+lineB.end.x+","+lineB.end.y+" "+lineA.end.x+","+lineA.end.y+"\n");
    //     } else if (
    //       lineA.isPointOnSegment(lineB.end, true, tol) &&
    //       lineB.isPointOnSegment(lineA.start, true, tol)
    //     ) {
    //       /*
    // 				end ▁▁▁▁▁▁▁▁       lineA
    // 					end ┆▁▁▁▁┆▁▁▁        lineB
    // 			*/
    //       resVec.push(new Line2D(lineB.end, lineA.start))
    //       //						trace("line "+lineB.end.x+","+lineB.end.y+" "+lineA.start.x+","+lineA.start.y+"\n");
    //     }
    //   }
    // }

    return resVec;
  }

  /**
   * 圆形是否包含多边形
   * @param center 圆心
   * @param radius 半径
   * @param pol 检测多边形
   */
  public static circleContinuePol(
    center: Vector2D,
    radius: number,
    pol: Polygon2D
  ) {
    for (const point of pol.vertices) {
      if (Vector2D.distance(point, center) < radius) {
        return true;
      } else {
        return false;
      }
    }
  }

  /**
   * 检测多边形是否和贝塞尔曲线相交
   * @param beizerLine 贝塞尔曲线
   * @param pol 检测多边形
   */
  public static bezierIntersectPol(beizerLine: any, pol: Polygon2D) {
    const ct1: Vector2D = beizerLine.ctrStart.position.clone();
    const ct2: Vector2D = beizerLine.ctrEnd.position.clone();
    const start: Vector2D = beizerLine.pStart.position.clone();
    const end: Vector2D = beizerLine.pEnd.position.clone();
    const maxNum = 100;
    const polTopLeft: Vector2D = pol.vertices[0];
    const polBottumRight: Vector2D = pol.vertices[3];
    const vecs: Vector2D[] = MathHelper.computeBezier(
      ct1,
      ct2,
      start,
      end,
      maxNum
    );
    let result: boolean;
    for (let i = 0; i < vecs.length - 1; ++i) {
      result = pol.isLineIntersectRectangle(
        vecs[i].x,
        vecs[i].y,
        vecs[i + 1].x,
        vecs[i + 1].y,
        polTopLeft.x,
        polTopLeft.y,
        polBottumRight.x,
        polBottumRight.y
      );
      if (result) {
        return true;
      }
    }
    return false;
  }

  public static buildFromTurfs(poly: Polygon | MultiPolygon): Polygon2D[] {
    try {
      const Polygon2Ds: Polygon2D[] = [];
      for (const positions of poly.coordinates) {
        const ps: Vector2D[] = [];
        for (const position of positions[0]) {
          // @ts-ignore
          ps.push(new Vector2D(position[0], position[1]));
        }
        const newPoly: Polygon2D = new Polygon2D(ps);
        newPoly.vertices.pop();
        Polygon2Ds.push(newPoly);
      }
      return Polygon2Ds;
    } catch (e) {
      // @ts-ignore
      return null;
    }
  }

  public static buildFromTurf(poly: Polygon | MultiPolygon): Polygon2D {
    try {
      let positions = poly.coordinates[0] as number[][];
      positions = positions.slice(0, positions.length - 1);
      return new Polygon2D([
        ...positions.map((coordinate) => new Vector2D(...coordinate)),
      ]);
    } catch (e) {
      // @ts-ignore
      return null;
    }
  }

  public static rectToPolygon(
    pos: Vector2D,
    length: number,
    width: number,
    angle: number
  ): Polygon2D {
    const horizontalV = new Vector2D(Math.cos(angle), Math.sin(angle));
    const verticalV = horizontalV.getRightNormal();
    const halfLength = length / 2;
    const halfWidth = width / 2;
    const p0 = pos
      .addV(horizontalV.multiplyByNo(halfLength))
      .addV(verticalV.multiplyByNo(halfWidth));
    const p1 = pos
      .addV(horizontalV.multiplyByNo(-halfLength))
      .addV(verticalV.multiplyByNo(halfWidth));
    const p2 = pos
      .addV(horizontalV.multiplyByNo(-halfLength))
      .addV(verticalV.multiplyByNo(-halfWidth));
    const p3 = pos
      .addV(horizontalV.multiplyByNo(halfLength))
      .addV(verticalV.multiplyByNo(-halfWidth));

    return new Polygon2D([p0, p1, p2, p3]);
  }

  public containsBox(box2d: Box2D): boolean {
    const edges = box2d.getEdges();
    for (const edge of edges) {
      if (!this.containsSegment(edge)) {
        return false;
      }
    }
    return true;
  }

  public build() {
    this._invalidateFlag = true;
    this._boundingBox.invalidate();
    if (!this._vertices || !this._vertices.length) {
      return;
    }
    this._boundingBox.includeValues(this._vertices);
    return;
  }

  //     getLeftBottom() : Vector2D
  // {
  // 	var compare:Function =   (param1:Vector2D, param2:Vector2D) : number
  // 	{
  // 		if (-param1.x + param1.y < -param2.x + param2.y)
  // 		{
  // 			return 1;
  // 		}
  // 		if (-param1.x + param1.y > -param2.x + param2.y)
  // 		{
  // 			return -1;
  // 		}
  // 		return 0;
  // 	}
  // 		;
  // 	var sorts:* = this._vertices.concat();
  // 	sorts.sort(compare);
  // 	return sorts[0];
  // }

  //     getLeftTop() : Vector2D
  // {
  // 	var compare:Function =   (param1:Vector2D, param2:Vector2D) : number
  // 	{
  // 		if (-param1.x - param1.y < -param2.x - param2.y)
  // 		{
  // 			return 1;
  // 		}
  // 		if (-param1.x - param1.y > -param2.x - param2.y)
  // 		{
  // 			return -1;
  // 		}
  // 		return 0;
  // 	}
  // 		;
  // 	var sorts:* = this._vertices.concat();
  // 	sorts.sort(compare);
  // 	return sorts[0];
  // }

  //     getRightBottom() : Vector2D
  // {
  // 	var compare:Function =   (param1:Vector2D, param2:Vector2D) : number
  // 	{
  // 		if (param1.x + param1.y < param2.x + param2.y)
  // 		{
  // 			return 1;
  // 		}
  // 		if (param1.x + param1.y > param2.x + param2.y)
  // 		{
  // 			return -1;
  // 		}
  // 		return 0;
  // 	}
  // 		;
  // 	var sorts:* = this._vertices.concat();
  // 	sorts.sort(compare);
  // 	return sorts[0];
  // }

  //     getRightTop() : Vector2D
  // {
  // 	var compare:Function =   (param1:Vector2D, param2:Vector2D) : number
  // 	{
  // 		if (param1.x - param1.y < param2.x - param2.y)
  // 		{
  // 			return 1;
  // 		}
  // 		if (param1.x - param1.y > param2.x - param2.y)
  // 		{
  // 			return -1;
  // 		}
  // 		return 0;
  // 	}
  // 		;
  // 	var sorts:* = this._vertices.concat();
  // 	sorts.sort(compare);
  // 	return sorts[0];
  // }

  public clockwise() {
    if (!this.isClockwise()) {
      this._vertices.reverse();
    }
    return;
  }

  public counterClockwise() {
    if (this.isClockwise()) {
      this._vertices.reverse();
    }
    return;
  }

  public isClockwise(): boolean {
    return Polygon2D.calculateSignedArea(this._vertices) > 0;
  }

  public getEdges(): Line2D[] {
    let num1 = 0;
    const lines1 = [];
    const len: number = this._vertices.length;

    while (num1 < len) {
      lines1.push(
        new Line2D(this._vertices[num1], this._vertices[(num1 + 1) % len])
      );
      num1 = num1 + 1;
    }
    return lines1;
  }

  public getSegEdges(): Lineseg2D[] {
    let num1 = 0;
    const lines1 = [];
    const len: number = this._vertices.length;
    num1 = 0;
    while (num1 < len) {
      lines1.push(
        new Lineseg2D(this._vertices[num1], this._vertices[(num1 + 1) % len])
      );
      num1 = num1 + 1;
    }
    return lines1;
  }

  public getPolygonEdges() {
    let num = 0;
    const len: number = this._vertices.length;

    num = 0;

    while (num < len) {
      // this._edgesVec.push(
      //   new PolygonEdge(
      //     this._vertices[num  ],
      //     this._vertices[(num   + 1) % len  ]
      //   )
      // )
      num = num + 1;
    }
  }

  public getVertexAt(num1: number): Vector2D {
    if (num1 < 0) {
      return this._vertices[num1 + this._vertices.length];
    }
    if (num1 >= this._vertices.length) {
      return this._vertices[num1 - this._vertices.length];
    }
    return this._vertices[num1];
  }

  /**
   * 判断点是否在多边形内
   * @param p
   * @param ignoreBoundary 是否忽略点在边上
   * @returns {boolean}
   */
  public contains(p: Vector2D, ignoreBoundary = false): boolean {
    if (ignoreBoundary) {
      // 使用自己的方法判断，Turf的忽略边框计算存在误差
      if (this.isPointOnEdges(p)) {
        return false;
      }
    }

    return this.containsPointTurf(p, ignoreBoundary);
    // return this.containsVector(p) === -1;
    // return this._contains(p, new Vector2D(10, -1.2345)) && this._contains(p, new Vector2D(-10, 5.4321));
  }

  /** <p>判断线段是否在矩形内 </p>
   * 先看线段所在直线是否与矩形相交，
   * 如果不相交则返回false，
   * 如果相交，
   * 再看线段的两个点是否在矩形的同一边（即两点的x(y)坐标都比矩形的小x(y)坐标小，或者大）,
   * 若在同一边则返回false，
   * 否则就是相交的情况。
   * @param linePointX1 线段起始点x坐标
   * @param linePointY1 线段起始点y坐标
   * @param linePointX2 线段结束点x坐标
   * @param linePointY2 线段结束点y坐标
   * @param rectangleLeftTopX 矩形左上点x坐标
   * @param rectangleLeftTopY 矩形左上点y坐标
   * @param rectangleRightBottomX 矩形右下点x坐标
   * @param rectangleRightBottomY 矩形右下点y坐标
   * @return 是否相交
   */
  public isLineIntersectRectangle(
    linePointX1: number,
    linePointY1: number,
    linePointX2: number,
    linePointY2: number,
    rectangleLeftTopX: number,
    rectangleLeftTopY: number,
    rectangleRightBottomX: number,
    rectangleRightBottomY: number
  ): boolean {
    const lineHeight: number = linePointY1 - linePointY2;
    const lineWidth: number = linePointX2 - linePointX1; // 计算叉乘
    const c: number = linePointX1 * linePointY2 - linePointX2 * linePointY1;

    if (
      (lineHeight * rectangleLeftTopX + lineWidth * rectangleLeftTopY + c >=
        0 &&
        lineHeight * rectangleRightBottomX +
          lineWidth * rectangleRightBottomY +
          c <=
          0) ||
      (lineHeight * rectangleLeftTopX + lineWidth * rectangleLeftTopY + c <=
        0 &&
        lineHeight * rectangleRightBottomX +
          lineWidth * rectangleRightBottomY +
          c >=
          0) ||
      (lineHeight * rectangleLeftTopX + lineWidth * rectangleRightBottomY + c >=
        0 &&
        lineHeight * rectangleRightBottomX +
          lineWidth * rectangleLeftTopY +
          c <=
          0) ||
      (lineHeight * rectangleLeftTopX + lineWidth * rectangleRightBottomY + c <=
        0 &&
        lineHeight * rectangleRightBottomX +
          lineWidth * rectangleLeftTopY +
          c >=
          0)
    ) {
      if (rectangleLeftTopX > rectangleRightBottomX) {
        const temp: number = rectangleLeftTopX;
        rectangleLeftTopX = rectangleRightBottomX;
        rectangleRightBottomX = temp;
      }
      if (rectangleLeftTopY < rectangleRightBottomY) {
        const temp1: number = rectangleLeftTopY;
        rectangleLeftTopY = rectangleRightBottomY;
        rectangleRightBottomY = temp1;
      }
      if (
        (linePointX1 < rectangleLeftTopX && linePointX2 < rectangleLeftTopX) ||
        (linePointX1 > rectangleRightBottomX &&
          linePointX2 > rectangleRightBottomX) ||
        (linePointY1 > rectangleLeftTopY && linePointY2 > rectangleLeftTopY) ||
        (linePointY1 < rectangleRightBottomY &&
          linePointY2 < rectangleRightBottomY)
      ) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  // containsBox(box2d: Box2D): boolean {
  //   //var edges:Line2D[] = box2d.getEdges();
  //   var edges: Line2D[]

  //   for (var edge of edges) {
  //     if (!this.containsSegment(edge)) {
  //       return false
  //     }
  //   }
  //   return true
  // }

  /**
   * 点在多边形内或包含边上
   * @param vec
   */
  public containsInclusiveEx(vec: Vector2D, numMin = 1e-3): number {
    const edges: Line2D[] = this.getEdges();
    for (const _loc2 of edges) {
      if (_loc2.isPointOnSegment(vec, true, numMin)) {
        return 2;
      }
    }
    return this.contains(vec) ? 1 : 0;
  }

  /**
   * 点在多边形内或包含边上
   * @param vec
   */
  public containsInclusive(vec: Vector2D, numMin = 1e-3): boolean {
    const edges: Line2D[] = this.getEdges();
    for (const _loc2 of edges) {
      if (_loc2.isPointOnSegment(vec, true, numMin)) {
        return true;
      }
    }
    return this.contains(vec);
  }

  /**
   * 点在多边形内&不包含边上
   * @param vec
   */
  public containsExclusive(vec: Vector2D): boolean {
    const edges: Line2D[] = this.getEdges();
    for (const edge of edges) {
      if (edge.isPointOnSegment(vec, true)) {
        return false;
      }
    }
    return this.contains(vec);
  }

  public containsSegment(line: Line2D, beTRUE = false): boolean {
    const edges: Line2D[] = this.getEdges();
    if (
      !this.containsInclusive(line.start) ||
      !this.containsInclusive(line.end)
    ) {
      return false;
    }

    for (const edge of edges) {
      if (beTRUE) {
        if (Line2DTool.isSegmentIntersected(edge, line, false)) {
          return false;
        }
        continue;
      }
      if (Line2DTool.isSegmentCollided(edge, line, false)) {
        return false;
      }
    }
    return true;
  }

  /**
   * 判断多边形与线是否相交
   * @param line
   * @returns {boolean}
   */
  public isIntersectLine(line: Line2D) {
    if ([line.start, line.end].some((point) => this.contains(point))) {
      return true;
    }
    return this.getEdges().some((oneLine) =>
      Line2DTool.isSegmentIntersected(line, oneLine)
    );
  }

  /**
   * 获取相交点
   * @param line
   * @returns {any[]}
   */
  public intersectLine(line: Line2D): Vector2D[] {
    return this.getEdges()
      .reduce((prev, next) => {
        const result = Line2D.getIntersectionSegment(next, line);
        if (result) {
          // @ts-ignore
          return prev.concat(result);
        }
        return prev;
      }, [])
      .sort(
        // @ts-ignore
        (prev, next) => {
          // @ts-ignore
          next.distance(line.start) - prev.distance(line.start);
        }
      );
  }

  /**
   * MathHelper 有类似求多边形是否是矩形的算法，可以对比下两个算法的性能和
   * 优劣，如果确定是4个顶点，建议使用 MathHelper 里的 isRectangle 方法
   */
  public isRectangle(): boolean {
    let num8 = 0;
    let vec7: Vector2D;
    let vec5: Vector2D;
    let vec4: Vector2D;
    let vec1: Vector2D;
    let vec3: Vector2D;
    let num = NaN;
    this.counterClockwise();
    const len: number = this._vertices.length;
    num8 = 0;

    while (num8 < len) {
      vec7 = this._vertices[(num8 - 1 + len) % len];
      vec5 = this._vertices[num8];
      vec4 = this._vertices[(num8 + 1) % len];
      vec1 = vec7.subtract(vec5);
      vec3 = vec4.subtract(vec5);
      num = MathTool.subAngle(vec3.angle(), vec1.angle());
      if (
        !MathTool.numberEquals(num, 3.14159 / 2) &&
        !MathTool.numberEquals(num, 3.14159)
      ) {
        return false;
      }
      num8 = num8 + 1;
    }
    return true;
  }

  public getMiddleLine(): Line2D {
    return new Line2D(this._vertices[0], this._vertices[3]);
  }

  /**
   * 某个点是否在多边形边上
   * @param vec
   * @param numMin
   * @returns {boolean}
   */
  public isPointOnEdges(vec: Vector2D, numMin = 1e-3): boolean {
    const edges: Line2D[] = this.getEdges();
    for (const edge of edges) {
      if (edge.isPointOnSegment(vec, true, numMin)) {
        return true;
      }
    }
    return false;
  }

  public isPathSplitCross(vecs: Vector2D[]): boolean {
    let num4 = 0;
    let line2: Line2D;
    const vecs3: Vector2D[] = vecs.concat();
    if (
      vecs.length < 2 ||
      !this.isPointOnEdges(vecs3[0]) ||
      !this.isPointOnEdges(vecs3[vecs3.length - 1])
    ) {
      return false;
    }

    const len5: number = vecs3.length;
    num4 = 0;
    while (num4 < len5 - 1) {
      if (num4 > 0 && this.isPointOnEdges(vecs3[num4])) {
        return false;
      }
      line2 = new Line2D(vecs3[num4], vecs3[num4 + 1]);
      if (!this.containsSegment(line2)) {
        return false;
      }
      num4 = num4 + 1;
    }
    return true;
  }

  public invalidate() {
    this._invalidateFlag = false;
    return;
  }

  public from2Points(pt1: Vector2D, pt2: Vector2D) {
    const posTopLeft: Vector2D = new Vector2D(
      Math.min(pt1.x, pt2.x),
      Math.min(pt1.y, pt2.y)
    );
    const posBottomRight: Vector2D = new Vector2D(
      Math.max(pt1.x, pt2.x),
      Math.max(pt1.y, pt2.y)
    );
    const posBottomLeft: Vector2D = new Vector2D(
      posTopLeft.x,
      posBottomRight.y
    );
    const posTopRight: Vector2D = new Vector2D(posBottomRight.x, posTopLeft.y);
    const vecs: Vector2D[] = [];

    vecs.push(posTopLeft);
    vecs.push(posTopRight);
    vecs.push(posBottomRight);
    vecs.push(posBottomLeft);
    vecs.push(posTopLeft);

    this.vertices = vecs;
  }

  public getPointRelatedLines(vertex: Vector2D): Line2D[] {
    const length: number = this.vertices.length;
    const resLines: Line2D[] = [];

    for (let i = 0; i < length; i++) {
      const pt: Vector2D = this.vertices[i];
      if (!pt.equals(vertex)) {
        continue;
      }

      const prePt: Vector2D = this.vertices[(i - 1 + length) % length];
      const nexPt: Vector2D = this.vertices[(i + 1 + length) % length];

      const lineA: Line2D = new Line2D(prePt, vertex);
      const lineB: Line2D = new Line2D(vertex, nexPt);

      resLines.push(lineA);
      resLines.push(lineB);

      break;
    }

    return resLines;
  }

  public getBoundingArea(): number {
    return this.boundingBox.getArea();
  }

  public getBoundingCenter(): Vector2D {
    return this.boundingBox.getCenter();
  }

  public getBarryCenter(): Vector2D {
    let num7 = 0;
    let num6 = 0;
    let num4 = NaN;
    let num3 = 0;
    let num2 = 0;
    const vec5: Vector2D[] = this._vertices.concat();
    const num1: number = Polygon2D.calculateSignedArea(vec5);
    const num8: number = vec5.length;
    num7 = 0;
    num6 = 1;

    while (num7 < num8 && num6 < num8) {
      num4 = vec5[num7].x * vec5[num6].y - vec5[num6].x * vec5[num7].y;
      num3 = num3 + (vec5[num7].x + vec5[num6].x) * num4;
      num2 = num2 + (vec5[num7].y + vec5[num6].y) * num4;
      num7++;
      num6 = (num7 + 1) % num8;
    }
    return new Vector2D(num3, num2).multiplyBy(1 / (num1 * 6));
  }

  /**
   * 检测多边形是否与圆相交(用于鼠标探测)
   * @param center 圆心
   * @param radius 半径
   */
  public intersectCircle(center: Vector2D, radius: number): boolean {
    const edges = this.getEdges();

    let includeNum = 0;
    let outNum = 0;
    for (const point of this.vertices) {
      if (Vector2D.distance(point, center) < radius) {
        includeNum++;
      } else if (Vector2D.distance(point, center) === radius) {
        // 多边形端点在圆上
        return true;
      } else {
        outNum++;
      }
    }

    // 圆包含多边形 或者多边形在圆外
    if (
      includeNum === this.vertices.length ||
      outNum === this.vertices.length
    ) {
      return false;
    }

    // 复杂情况进行多边判断
    for (const line2d of edges) {
      const tmpLineseg: Lineseg2D = new Lineseg2D(line2d.start, line2d.end);
      if (tmpLineseg.intersectCircle(center, radius)) {
        return true;
      }
    }
    return false;
  }

  public intersectCircle2(center: Vector2D, radius: number): boolean {
    const edges = this.getEdges();
    for (const line2d of edges) {
      const tmpLineseg: Lineseg2D = new Lineseg2D(line2d.start, line2d.end);
      if (tmpLineseg.intersectCircle(center, radius)) {
        return true;
      }
    }
    return false;
  }

  public getLeftBottom(): Vector2D {
    const compare = (param1: Vector2D, param2: Vector2D): number => {
      if (-param1.x + param1.y < -param2.x + param2.y) {
        return 1;
      }

      if (-param1.x + param1.y > -param2.x + param2.y) {
        return -1;
      }
      return 0;
    };

    const sorts = this.vertices.concat();
    sorts.sort(compare);
    return sorts[0];
  }

  public getLeftTop(): Vector2D {
    const compare = (param1: Vector2D, param2: Vector2D): number => {
      if (-param1.x - param1.y < -param2.x - param2.y) {
        return 1;
      }

      if (-param1.x - param1.y > -param2.x - param2.y) {
        return -1;
      }
      return 0;
    };

    const sorts = this.vertices.concat();
    sorts.sort(compare);
    return sorts[0];
  }

  public getRightBottom(): Vector2D {
    const compare = (param1: Vector2D, param2: Vector2D): number => {
      if (param1.x + param1.y < param2.x + param2.y) {
        return 1;
      }

      if (param1.x + param1.y > param2.x + param2.y) {
        return -1;
      }
      return 0;
    };

    const sorts = this.vertices.concat();
    sorts.sort(compare);
    return sorts[0];
  }

  public getRightTop(): Vector2D {
    const compare = (param1: Vector2D, param2: Vector2D): number => {
      if (param1.x - param1.y < param2.x - param2.y) {
        return 1;
      }

      if (param1.x - param1.y > param2.x - param2.y) {
        return -1;
      }
      return 0;
    };

    const sorts = this.vertices.concat();
    sorts.sort(compare);
    return sorts[0];
  }

  public toTurf() {
    return polygon([
      [
        ...this.vertices.map((vector) => vector && vector.toArray()),
        this.vertices && this.vertices[0] && this.vertices[0].toArray(),
      ],
    ]);
  }

  /**
   * 判断多边形是否相交
   * @performance 0.75ms
   * @param targetPolygon
   * @param ignoreBoundary
   * @returns {boolean}
   */
  public isIntersectPolygon(
    targetPolygon: Polygon2D,
    ignoreBoundary = false
  ): boolean {
    const checkTwoPolygonByDirection = (
      polygon1: Polygon2D,
      polygon2: Polygon2D
    ) => {
      // 得到一个多边形的极值数组［左，上，右，下］
      function getDirection(shape: Polygon2D) {
        const shapeEastAndWest: any[] = [],
          shapeSourceAndNorth: any[] = [];
        shape.vertices.forEach((point) => {
          shapeEastAndWest.push(point.x);
          shapeSourceAndNorth.push(point.y);
        });
        return [
          Math.min.apply(null, shapeEastAndWest),
          Math.max.apply(null, shapeSourceAndNorth),
          Math.max.apply(null, shapeEastAndWest),
          Math.min.apply(null, shapeSourceAndNorth),
        ];
      }

      const direction1 = getDirection(polygon1),
        direction2 = getDirection(polygon2);
      if (
        direction1[0] > direction2[2] ||
        direction1[2] < direction2[0] ||
        direction1[1] < direction2[3] ||
        direction1[3] > direction2[1]
      ) {
        return true;
      }
      return [direction1, direction2];
    };
    const directions = checkTwoPolygonByDirection(this, targetPolygon);
    if (directions === true) {
      return false;
    }
    if (
      targetPolygon.vertices.some((point) =>
        this.contains(point, ignoreBoundary)
      )
    ) {
      return true;
    }

    const checkTwoPolygonByPolygonLines = (
      polygon1: Polygon2D,
      polygon2: Polygon2D
    ) => {
      // 计算向量叉乘
      function crossMul(v1: any, v2: any) {
        return v1.x * v2.y - v1.y * v2.x;
      }

      // 计算两条线是否相交
      function checkCross(p1: any, p2: any, p3: any, p4: any) {
        const isPlus = ignoreBoundary ? -1 : 1;
        return (
          checkTwoCross(p1, p2, p3, p4) <= isPlus * 1e-3 &&
          checkTwoCross(p3, p4, p2, p1) <= isPlus * 1e-3
        );
      }

      // 计算两个向量叉乘相乘是否为负
      function checkTwoCross(p1: any, p2: any, p3: any, p4: any) {
        const v1 = { x: p1.x - p3.x, y: p1.y - p3.y },
          v2 = { x: p2.x - p3.x, y: p2.y - p3.y },
          v3 = { x: p4.x - p3.x, y: p4.y - p3.y },
          v = crossMul(v1, v3) * crossMul(v2, v3);
        return v;
      }

      const vectors1 = polygon1.vertices,
        vectors2 = polygon2.vertices;
      for (let i = 0, l = vectors1.length, j = l - 1; i < l; j = i, i++) {
        for (
          let i2 = 0, l2 = vectors2.length, j2 = l2 - 1;
          i2 < l;
          j2 = i2, i2++
        ) {
          if (
            checkCross(vectors1[i], vectors1[j], vectors2[i2], vectors2[j2])
          ) {
            return true;
          }
        }
      }
      return false;
    };

    if (checkTwoPolygonByPolygonLines(this, targetPolygon)) {
      return true;
    }

    // 多边形顶点判断多边形相交
    const checkTwoPolygonByRay = (polygon1: Polygon2D, polygon2: Polygon2D) => {
      // 判断多边形顶点在另一个多边形里
      function rayCasting(p: Vector2D, poly: Vector2D[]) {
        const px = p.x,
          py = p.y;
        let flag = false;
        for (let i = 0, l = poly.length, j = l - 1; i < l; j = i, i++) {
          const sx = poly[i].x,
            sy = poly[i].y,
            tx = poly[j].x,
            ty = poly[j].y;
          // 点与多边形顶点重合
          if ((sx === px && sy === py) || (tx === px && ty === py)) {
            return true;
          }
          // 判断线段两端点是否在射线两侧
          if ((sy < py && ty >= py) || (sy >= py && ty < py)) {
            // 线段上与射线 Y 坐标相同的点的 X 坐标
            const x = sx + ((py - sy) * (tx - sx)) / (ty - sy);
            // 点在多边形的边上
            if (x === px) {
              return true;
            }
            // 射线穿过多边形的边界
            if (x > px) {
              flag = !flag;
            }
          }
        }
        // 射线穿过多边形边界的次数为奇数时点在多边形内
        return flag;
      }

      for (const vec of polygon1.vertices) {
        if (rayCasting(vec, polygon2.vertices)) {
          return true;
        }
      }
      for (const vec of polygon2.vertices) {
        if (rayCasting(vec, polygon1.vertices)) {
          return true;
        }
      }
      return false;
    };

    // 通过多边形1的极点都比多边形2的极点小或者都比多边形2的极点大来进入 通过多边形的顶点在另一个多边形内的算法
    if (
      (directions[0][0] < directions[1][0] &&
        directions[0][1] > directions[1][1] &&
        directions[0][2] > directions[1][2] &&
        directions[0][3] < directions[1][3]) ||
      (directions[1][0] < directions[0][0] &&
        directions[1][1] > directions[0][1] &&
        directions[1][2] > directions[0][2] &&
        directions[1][3] < directions[0][3])
    ) {
      return checkTwoPolygonByRay(this, targetPolygon);
    }
    return false;
  }

  /**
   * 返回多边形相交区域
   * @param targetPolygon
   * @param toleranceArea 容差面积
   * @returns {any} 返回相交部分的多边形 or null
   */
  // @ts-ignore
  public intersectPolygon(
    targetPolygon: Polygon2D,
    toleranceArea = 1e-3
  ): Polygon2D {
    try {
      const intersectResult = intersect(this.toTurf(), targetPolygon.toTurf());
      if (intersectResult) {
        const polygonResult = Polygon2D.buildFromTurf(intersectResult.geometry);

        if (polygonResult && polygonResult.area > toleranceArea) {
          return polygonResult;
        }
      }
    } catch (error) {
      // MarsTest.clear();
      // MarsTest.drawPolygon(targetPolygon);
      console.log(error);

      // @ts-ignore
      return null;
    }
  }

  /**
   * 返回多边形的裁剪区域
   * @param targetPolygon
   * @param toleranceArea 容差面积
   * @returns {any}
   */
  public differencePolygon(
    targetPolygon: Polygon2D,
    toleranceArea = 1e-3
  ): Polygon2D {
    const intersectResult = difference(this.toTurf(), targetPolygon.toTurf());
    if (intersectResult) {
      // @ts-ignore
      const polygonResult = Polygon2D.buildFromTurf(intersectResult.geometry);

      if (polygonResult.area > toleranceArea) {
        return polygonResult;
      }
    }
    // @ts-ignore
    return null;
  }

  public differenceMultiPolygons(targetPolygons: Polygon2D[]): Polygon2D[] {
    const myPolygon = this.toTurf();
    const polygons = [];
    for (const target of targetPolygons) {
      polygons.push([
        [
          ...target.vertices.map((vector) => vector && vector.toArray()),
          target.vertices && target.vertices[0] && target.vertices[0].toArray(),
        ],
      ]);
    }
    const tarPolygon = multiPolygon([...polygons]);

    const intersectResult = difference(myPolygon, tarPolygon);
    if (!intersectResult) {
      // @ts-ignore
      return null;
    }

    // @ts-ignore
    if (intersectResult.geometry.type === "MultiPolygon") {
      const polyTemp = intersectResult.geometry as MultiPolygon;
      return Polygon2D.buildFromTurfs(polyTemp);
    } else {
      // @ts-ignore
      if (intersectResult.geometry.type === "Polygon") {
        const polyTemp = intersectResult.geometry as Polygon;
        return [Polygon2D.buildFromTurf(polyTemp)];
      }
    }
    // @ts-ignore
    return null;
  }

  // /**
  //  * @Description: 高性能多边形和点的关系，遇到性能瓶颈可使用此方法。
  //  * @param
  //  * @date
  //  */
  // public containsVector(p: Vector2D): number {
  //   const pArr = [];
  //   for (const v of this.vertices) {
  //     pArr.push([v.x, v.y]);
  //   }
  //   if (this.isClockwise()) {
  //     pArr.reverse();
  //   }
  //   const polygontmp = [pArr];
  //   const classifyPoint = preprocessPolygon(polygontmp);
  //   const result = classifyPoint([p.x, p.y]);
  //   return result;
  // }

  public differencePolygons(targetPolygon: Polygon2D): Polygon2D[] {
    const myPolygon = this.toTurf();
    const tarPolygon = targetPolygon.toTurf();
    // console.log(myPolygon.geometry.coordinates);
    // console.log(tarPolygon.geometry.coordinates);
    // MarsTest.drawPolygon(this, false, 0x66bb6a);
    // MarsTest.drawPolygon(targetPolygon);
    const intersectResult = difference(myPolygon, tarPolygon);
    if (!intersectResult) {
      // @ts-ignore
      return null;
    }

    // @ts-ignore
    if (intersectResult.geometry.type === "MultiPolygon") {
      const polyTemp = intersectResult.geometry as MultiPolygon;
      return Polygon2D.buildFromTurfs(polyTemp);
    } else {
      // @ts-ignore
      if (intersectResult.geometry.type === "Polygon") {
        const polyTemp = intersectResult.geometry as Polygon;
        return [Polygon2D.buildFromTurf(polyTemp)];
      }
    }
    // @ts-ignore
    return null;
  }

  /**
   * @Description: 是否包含一个polygon&内相切
   * @param
   * @data 2019/12/25
   */
  public containPolygonEx(polygonPara: Polygon2D): boolean {
    let tangent = false;
    for (const p of polygonPara.vertices) {
      const type = this.containsInclusiveEx(p);
      if (2 === type) {
        // 2为内相切
        tangent = true;
      }
      if (0 === this.containsInclusiveEx(p)) {
        return false;
      }
    }
    return tangent;
  }

  /**
   * @Description: 是否包含一个polygon
   * @param
   * @data 2019/12/25
   */
  public containPolygon(polygonPara: Polygon2D, numMin = 1e-3): boolean {
    for (const p of polygonPara.vertices) {
      if (!this.containsInclusive(p, numMin)) {
        return false;
      }
    }
    return true;
  }

  /**
   * @Description: 是否完全包含一个polygon，不相切
   * @param
   * @data 2019/12/25
   */
  public fullContainPolygon(polygonPara: Polygon2D): boolean {
    for (const p of polygonPara.vertices) {
      if (!this.containsExclusive(p)) {
        return false;
      }
    }
    return true;
  }

  // @ts-ignore
  public containsPointTurf(p: Vector2D, ignoreBoundary): boolean {
    if (this.vertices.length === 0) {
      return false;
    }

    const turfPolygon = this.toTurf();
    return booleanPointInPolygon([p.x, p.y], turfPolygon, { ignoreBoundary });
  }

  public clone(): Polygon2D {
    return new Polygon2D(this.vertices.map((point) => point.clone()));
  }

  public transform(vec: Vector2D): Polygon2D {
    this.vertices.forEach((vector) => {
      vector.transformBy(vec);
    });

    return this;
  }
}
