import Line2DIntersectionStatus from '../Constants/Line2DIntersectionStatus';
import MathTool from '../Util/MathTool';
import Line from './Line';
import Line2D from './Line2D';
import Line2DIntersection from './Line2DIntersection';
import Lineseg2D from './Lineseg2D';
import Vector2D from './Vector2D';

export default class Line2DTool {
  public static isSegmentOverlap(
    line2: Line2D,
    param2: Line2D,
    beTRUE: boolean = false,
    nummin: number = 1e-3,
  ): boolean {
    const intersection: Line2DIntersection = Line2DTool.getIntersectionOfLines(line2, param2, nummin);
    if (intersection.status === Line2DIntersectionStatus.OVERLAP) {
      return (
        beTRUE ||
        !MathTool.numberEquals(intersection.u[0], intersection.u[1]) ||
        !(Line2DTool.isZeroNumber(intersection.u[0]) || Line2DTool.isZeroNumber(1 - intersection.u[0]))
      );
    }
    return false;
  }

  /**
   * 获取线段相交的最小相交线
   * @param targetLine
   * @param intersectionLines
   * @returns {null}
   */
  public static getIntersectionLineTwoPoint(targetLine: Line2D, intersectionLines: Line2D[]): Vector2D[] {
    const line = targetLine;
    const getNearestIntersectPos = lineDirection => {
      let compareNum = Number.MAX_VALUE;
      let nearestPos = null;
      intersectionLines.forEach(intersectionLine => {
        const intersection = this.getIntersectionOfLines(lineDirection, intersectionLine);
        if (!intersection) {
          return;
        }
        if (intersection.status !== Line2DIntersectionStatus.PART_CROSS) {
          return;
        }

        const distence = intersection.point.distanceSquared(lineDirection.start);
        if (distence < compareNum) {
          compareNum = distence;
          nearestPos = intersection.point;
        }
      });
      return nearestPos;
    };
    const lineCenter = line.center;
    const startDir = new Line2D(lineCenter, line.start).setLength(2000, lineCenter);
    const endDir = new Line2D(lineCenter, line.end).setLength(2000, lineCenter);

    return [getNearestIntersectPos(startDir), getNearestIntersectPos(endDir)].filter(val => !!val);
  }

  public static getIntersectionOfLines(line1: Line2D, line2: Line2D, num3: number = 1e-3): Line2DIntersection {
    let num16 = NaN;
    let num17 = NaN;
    let num7 = NaN;
    let num5 = NaN;
    let num14 = NaN;
    const intersec = new Line2DIntersection();
    const vec24 = line1.start;
    const vec23 = line2.start;
    const vec8 = line1.end;
    const vec9 = line2.end;
    const vec22 = Vector2D.subtract(vec8, vec24);
    const vec21 = Vector2D.subtract(vec9, vec23);
    let num20 = 1;
    let num19 = 1;
    const num26 = Vector2D.crossProduct(vec22, vec21);
    const num11 = Vector2D.crossProduct(Vector2D.subtract(vec23, vec24), vec22);
    const num12: number = Vector2D.crossProduct(Vector2D.subtract(vec23, vec24), vec21);
    const num10: number = Vector2D.dotProduct(Vector2D.subtract(vec23, vec24), vec22);
    const num13: number = Vector2D.dotProduct(Vector2D.subtract(vec9, vec24), vec22);
    const num18: number = Vector2D.dotProduct(Vector2D.subtract(vec24, vec23), vec21);
    const num4: number = Vector2D.dotProduct(Vector2D.subtract(vec8, vec23), vec21);
    const num25: number = Vector2D.dotProduct(vec22, vec22);
    const num15: number = Vector2D.dotProduct(vec21, vec21);

    if (Line2DTool.isZeroNumber(num26, num3)) {
      if (Line2DTool.isZeroNumber(num12, num3) && Line2DTool.isZeroNumber(num11, num3)) {
        num16 = num10 / num25;
        num17 = num13 / num25;
        num7 = num18 / num15;
        num5 = num4 / num15;

        if (
          (num10 >= 0 && num10 <= num25) ||
          (num13 >= 0 && num13 <= num25) ||
          (num18 >= 0 && num18 <= num15) ||
          (num4 >= 0 && num4 <= num15)
        ) {
          num16 = Math.min(1, Math.max(0, num16));
          num17 = Math.min(1, Math.max(0, num17));
          num14 = Math.min(num16, num17);
          num17 = Math.max(num16, num17);
          num16 = num14;
          num7 = Math.min(1, Math.max(0, num7));
          num5 = Math.min(1, Math.max(0, num5));
          num14 = Math.min(num7, num5);
          num5 = Math.max(num7, num5);
          num7 = num14;
          intersec.status = Line2DIntersectionStatus.OVERLAP;
          intersec.u.push(num16, num17);
          intersec.v.push(num7, num5);
        } else {
          intersec.status = Line2DIntersectionStatus.CO_LINEAR;
          intersec.u.push(num16, num17);
          intersec.v.push(num7, num5);
        }
      } else {
        intersec.status = Line2DIntersectionStatus.PARALELL;
      }
    } else {
      num20 = num12 / num26;
      num19 = num11 / num26;
      intersec.u.push(num20);
      intersec.v.push(num19);

      intersec.point = line1.start.add(line1.direction.multiplyBy(num20));

      const maxsection: number = 1.0;
      const epsilon: number = 1e-3;
      if (
        (Math.abs(num20) < epsilon || Math.abs(num20 - maxsection) < epsilon) &&
        (Math.abs(num19) < epsilon || Math.abs(num19 - maxsection) < epsilon)
      ) {
        intersec.status = Line2DIntersectionStatus.A_B_HALVE;
      } else if (num20 >= 0 && num20 <= 1 && num19 >= 0 && num19 <= 1) {
        intersec.status = Line2DIntersectionStatus.PART_CROSS;
      } else if (Math.abs(num20) < 1e-3 || Math.abs(num20 - 1.0) < 1e-3) {
        intersec.status = Line2DIntersectionStatus.B_HALVE_A;
      } else if (Math.abs(num19) < 1e-3 || Math.abs(num19 - 1.0) < 1e-3) {
        intersec.status = Line2DIntersectionStatus.A_HALVE_B;
      } else if (num19 >= 0 && num19 <= 1) {
        intersec.status = Line2DIntersectionStatus.A_HALVE_B;
      } else if (num20 >= 0 && num20 <= 1) {
        intersec.status = Line2DIntersectionStatus.B_HALVE_A;
      } else {
        intersec.status = Line2DIntersectionStatus.LINE_CROSS;
      }
    }
    return intersec;
  }
  public static getIntersectionOfLinesNEW(line1: Line2D, line2: Line2D, num3: number = 1e-3): Line2DIntersection {
    let num16 = NaN;
    let num17 = NaN;
    let num7 = NaN;
    let num5 = NaN;
    let num14 = NaN;
    const intersec = new Line2DIntersection();
    const vec24 = line1.start;
    const vec23 = line2.start;
    const vec8 = line1.end;
    const vec9 = line2.end;
    const vec22 = Vector2D.subtract(vec8, vec24);
    const vec21 = Vector2D.subtract(vec9, vec23);
    let num20 = 1;
    let num19 = 1;
    const num26 = Vector2D.crossProduct(vec22, vec21);
    const num11 = Vector2D.crossProduct(Vector2D.subtract(vec23, vec24), vec22);
    const num12: number = Vector2D.crossProduct(Vector2D.subtract(vec23, vec24), vec21);
    const num10: number = Vector2D.dotProduct(Vector2D.subtract(vec23, vec24), vec22);
    const num13: number = Vector2D.dotProduct(Vector2D.subtract(vec9, vec24), vec22);
    const num18: number = Vector2D.dotProduct(Vector2D.subtract(vec24, vec23), vec21);
    const num4: number = Vector2D.dotProduct(Vector2D.subtract(vec8, vec23), vec21);
    const num25: number = Vector2D.dotProduct(vec22, vec22);
    const num15: number = Vector2D.dotProduct(vec21, vec21);

    if (Line2DTool.isZeroNumber(num26, num3)) {
      if (Line2DTool.isZeroNumber(num12, num3) && Line2DTool.isZeroNumber(num11, num3)) {
        num16 = num10 / num25;
        num17 = num13 / num25;
        num7 = num18 / num15;
        num5 = num4 / num15;

        if (
          (MathTool.numberGreaterEqual(num10, 0) && MathTool.numberLessEqual(num10, num25)) ||
          (MathTool.numberGreaterEqual(num13, 0) && MathTool.numberLessEqual(num13, num25)) ||
          (MathTool.numberGreaterEqual(num18, 0) && MathTool.numberLessEqual(num18, num15)) ||
          (MathTool.numberGreaterEqual(num4, 0) && MathTool.numberLessEqual(num4, num15))
        ) {
          num16 = Math.min(1, Math.max(0, num16));
          num17 = Math.min(1, Math.max(0, num17));
          num14 = Math.min(num16, num17);
          num17 = Math.max(num16, num17);
          num16 = num14;
          num7 = Math.min(1, Math.max(0, num7));
          num5 = Math.min(1, Math.max(0, num5));
          num14 = Math.min(num7, num5);
          num5 = Math.max(num7, num5);
          num7 = num14;
          intersec.status = Line2DIntersectionStatus.OVERLAP;
          intersec.u.push(num16, num17);
          intersec.v.push(num7, num5);
        } else {
          intersec.status = Line2DIntersectionStatus.CO_LINEAR;
          intersec.u.push(num16, num17);
          intersec.v.push(num7, num5);
        }
      } else {
        intersec.status = Line2DIntersectionStatus.PARALELL;
      }
    } else {
      num20 = num12 / num26;
      num19 = num11 / num26;
      intersec.u.push(num20);
      intersec.v.push(num19);

      intersec.point = line1.start.add(line1.direction.multiplyBy(num20));

      const maxsection: number = 1.0;
      const epsilon: number = 1e-3;
      if (
        (Math.abs(num20) < epsilon || Math.abs(num20 - maxsection) < epsilon) &&
        (Math.abs(num19) < epsilon || Math.abs(num19 - maxsection) < epsilon)
      ) {
        intersec.status = Line2DIntersectionStatus.A_B_HALVE;
      } else if (
        MathTool.numberGreaterEqual(num20, 0) &&
        MathTool.numberLessEqual(num20, 1) &&
        MathTool.numberGreaterEqual(num19, 0) &&
        MathTool.numberLessEqual(num19, 1)
      ) {
        intersec.status = Line2DIntersectionStatus.PART_CROSS;
      } else if (Math.abs(num20) < 1e-3 || Math.abs(num20 - 1.0) < 1e-3) {
        intersec.status = Line2DIntersectionStatus.B_HALVE_A;
      } else if (Math.abs(num19) < 1e-3 || Math.abs(num19 - 1.0) < 1e-3) {
        intersec.status = Line2DIntersectionStatus.A_HALVE_B;
      } else if (MathTool.numberGreaterEqual(num19, 0) && MathTool.numberLessEqual(num19, 1)) {
        intersec.status = Line2DIntersectionStatus.A_HALVE_B;
      } else if (MathTool.numberGreaterEqual(num20, 0) && MathTool.numberLessEqual(num20, 1)) {
        intersec.status = Line2DIntersectionStatus.B_HALVE_A;
      } else {
        intersec.status = Line2DIntersectionStatus.LINE_CROSS;
      }
    }
    return intersec;
  }

  public static isSegmentIntersected(
    line1: Line2D,
    line2: Line2D,
    beTRUE: boolean = false,
    nummin: number = 1e-3,
  ): boolean {
    const intersection: Line2DIntersection = Line2DTool.getIntersectionOfLines(line1, line2, nummin);
    if (intersection.status === Line2DIntersectionStatus.PART_CROSS) {
      return (
        beTRUE ||
        !(
          Line2DTool.isZeroNumber(intersection.u[0]) ||
          Line2DTool.isZeroNumber(intersection.v[0]) ||
          Line2DTool.isZeroNumber(1 - intersection.u[0]) ||
          Line2DTool.isZeroNumber(1 - intersection.v[0])
        )
      );
    }
    return false;
  }

  public static isSegmentCollided(
    line1: Line2D,
    line2: Line2D,
    beTRUE: boolean = false,
    nummin: number = 1e-3,
  ): boolean {
    const intersection: Line2DIntersection = Line2DTool.getIntersectionOfLines(line1, line2, nummin);
    switch (intersection.status) {
      case Line2DIntersectionStatus.PART_CROSS: {
        return Line2DTool.isSegmentIntersected(line1, line2, beTRUE, nummin);
      }
      case Line2DIntersectionStatus.OVERLAP: {
        return Line2DTool.isSegmentOverlap(line1, line2, beTRUE, nummin);
      }
      default: {
        return false;
      }
    }
  }

  // 		是否有投影
  public static hasProjection(param1: Line, param2: Line, tol: number = 0): boolean {
    const line1: Line2D = new Line2D(param1.start, param1.end);
    const line2: Line2D = new Line2D(param2.start, param2.end);
    const ptFoot1: Vector2D = line1.footPoint(line1,param2.start); // 垂足
    const ptFoot2: Vector2D = line1.footPoint(line1,param2.end);
    const ptFoot3: Vector2D = line2.footPoint(line2,param1.start);
    const ptFoot4: Vector2D = line2.footPoint(line2,param1.end);
    if (
      line1.isPointOnSegment(ptFoot1, Boolean(tol)) ||
      line1.isPointOnSegment(ptFoot2, Boolean(tol)) ||
      line2.isPointOnSegment(ptFoot3, Boolean(tol)) ||
      line2.isPointOnSegment(ptFoot4, Boolean(tol))
    ) {
      return true;
    }
    return false;
  }

  /**
   * 获取俩平行线的距离
   * @param line1
   * @param line2
* * by lianbo.guo
   */
  public static getDistanceBetweenParalellLines(line1: Line2D, line2: Line2D): number {
    const { status } = Line2DTool.getIntersectionOfLines(line1, line2);
    if (status !== Line2DIntersectionStatus.PARALELL) {
      return null;
    }
    const footPoint = line2.footPoint(line2,line1.start);
    return footPoint.distance(line1.start);
  }

  // 查找平行线投影重合区域
  public static findProjection(param1: Line, param2: Line): any[] {
    const wallInfo: any[] = [];
    const line1: Line2D = new Line2D(param1.start, param1.end);
    const line2: Line2D = new Line2D(param2.start, param2.end);
    const ptFoot1: Vector2D = line1.footPoint(line1,param2.start); // 垂足
    const ptFoot2: Vector2D = line1.footPoint(line1,param2.end);
    const ptFoot3: Vector2D = line2.footPoint(line2,param1.start);
    const ptFoot4: Vector2D = line2.footPoint(line2,param1.end);
    const dis: number = ptFoot1.distance(param1.start); // 两平行线间的距离
    if (line1.isPointOnSegment(ptFoot1) && line1.isPointOnSegment(ptFoot2)) {
      // 若投影全被包含
      // 				    s ▁▁▁▁▁▁▁▁▁▁e       l1
      // 			s	▁▁┆▁▁▁▁▁▁▁▁▁┆▁▁▁▁e     l2

      let line: Line2D = new Line2D(ptFoot1, param2.start);
      const wallThickness: number = line.length;
      const ptStart: Vector2D = line.center;
      line = new Line2D(ptFoot2, param2.end);
      const ptEnd: Vector2D = line.center;

      wallInfo.push(ptStart);
      wallInfo.push(ptEnd);
      wallInfo.push(wallThickness);
      return wallInfo;
    } else if (line2.isPointOnSegment(ptFoot3) && line2.isPointOnSegment(ptFoot4)) {
      // 				    s ▁▁▁▁▁▁▁▁▁▁e       l2
      // 			s	▁▁┆▁▁▁▁▁▁▁▁▁┆▁▁▁▁e     l1
      let line: Line2D = new Line2D(ptFoot3, param1.start);
      const wallThickness: number = line.length;
      const ptStart: Vector2D = line.center;
      line = new Line2D(ptFoot4, param1.end);
      const ptEnd: Vector2D = line.center;

      wallInfo.push(ptStart);
      wallInfo.push(ptEnd);
      wallInfo.push(wallThickness);
      return wallInfo;
    } else {
      // 若仅有一段重合区域
      if (line1.isPointOnSegment(ptFoot1)) {
        if (line2.isPointOnSegment(ptFoot3)) {
          // 						      s▁▁▁▁▁▁▁▁▁▁e     l1
          // 						e▁▁┆▁▁▁▁▁┆s             l2
          let line: Line2D = new Line2D(ptFoot3, param1.start);
          const wallThickness: number = line.length;
          const ptStart: Vector2D = line.center;
          line = new Line2D(ptFoot1, param2.start);
          const ptEnd: Vector2D = line.center;

          wallInfo.push(ptStart);
          wallInfo.push(ptEnd);
          wallInfo.push(wallThickness);
          return wallInfo;
        } else {
          // 						 s▁▁▁▁▁▁▁▁▁e					l1
          // 						      s┆▁▁▁▁▁┆▁▁▁e			l2
          let line: Line2D = new Line2D(ptFoot1, param2.start);
          const wallThickness: number = line.length;
          const ptStart: Vector2D = line.center;
          line = new Line2D(ptFoot4, param1.end);
          const ptEnd: Vector2D = line.center;

          wallInfo.push(ptStart);
          wallInfo.push(ptEnd);
          wallInfo.push(wallThickness);
          return wallInfo;
        }
      } else {
        if (line2.isPointOnSegment(ptFoot3)) {
          // 						      s▁▁▁▁▁▁▁▁▁▁e     l1
          // 						s▁▁┆▁▁▁▁▁┆e             l2
          let line: Line2D = new Line2D(ptFoot3, param1.start);
          const wallThickness: number = line.length;
          const ptStart: Vector2D = line.center;
          line = new Line2D(ptFoot2, param2.end);
          const ptEnd: Vector2D = line.center;

          wallInfo.push(ptStart);
          wallInfo.push(ptEnd);
          wallInfo.push(wallThickness);
          return wallInfo;
        } else {
          // 						 s▁▁▁▁▁▁▁▁▁e					l1
          // 						      e┆▁▁▁▁▁┆▁▁▁s			l2
          let line: Line2D = new Line2D(ptFoot4, param1.end);
          const wallThickness: number = line.length;
          const ptStart: Vector2D = line.center;
          line = new Line2D(ptFoot2, param2.end);
          const ptEnd: Vector2D = line.center;

          wallInfo.push(ptStart);
          wallInfo.push(ptEnd);
          wallInfo.push(wallThickness);
          return wallInfo;
        }
      }
    }
  }

  // 		两条线的最小端点距离
  public static endpointDis(param1: Line2D, param2: Line2D): any[] {
    const ptStart1: Vector2D = param1.start;
    const ptEnd1: Vector2D = param1.end;
    const ptStart2: Vector2D = param2.start;
    const ptEnd2: Vector2D = param2.end;
    let ptInter1: Vector2D = null;
    let ptInter2: Vector2D = null;
    const vec: any[] = [];
    const dis13: number = ptStart1.distance(ptStart2);
    const dis14: number = ptStart1.distance(ptEnd2);
    const dis23: number = ptEnd1.distance(ptStart2);
    const dis24: number = ptEnd1.distance(ptEnd2);
    const disMin: number = Math.min(dis13, dis14, dis23, dis24);
    if (disMin === dis13) {
      ptInter1 = ptStart1;
      ptInter2 = ptStart2;
    } else if (disMin === dis14) {
      ptInter1 = ptStart1;
      ptInter2 = ptEnd2;
    } else if (disMin === dis23) {
      ptInter1 = ptEnd1;
      ptInter2 = ptStart2;
    } else if (disMin === dis24) {
      ptInter1 = ptEnd1;
      ptInter2 = ptEnd2;
    }
    vec.push(ptInter1);
    vec.push(ptInter2);
    vec.push(disMin);
    return vec;
  }

  // 联合两条共线的线段
  public static uniteLinesegs(seg1: Lineseg2D, seg2: Lineseg2D, tol: number = 1): Vector2D[] {
    const ret: Vector2D[] = [];

    // 共线
    if (
      !Line2D.collinear(seg1.start, seg1.end, seg2.start, tol) ||
      !Line2D.collinear(seg1.start, seg1.end, seg2.end, tol)
    ) {
      return ret;
    }

    if (
      seg1.isPointOn(seg2.start) ||
      seg1.isPointOn(seg2.end) ||
      seg2.isPointOn(seg1.start) ||
      seg2.isPointOn(seg1.end)
    ) {
      // 两线段不分离
      const start1: Vector2D = seg1.start;
      const end1: Vector2D = seg1.end;
      const start2: Vector2D = seg2.start;
      const end2: Vector2D = seg2.end;

      const diss1e1: number = start1.distance(end1);
      const diss1s2: number = start1.distance(start2);
      const diss1e2: number = start1.distance(end2);
      const dise1s2: number = end1.distance(start2);
      const dise1e2: number = end1.distance(end2);
      const diss2e2: number = start2.distance(end2);
      const disMax: number = Math.max(diss1e1, diss1s2, diss1e2, dise1s2, dise1e2, diss2e2);
      let ptMax1: Vector2D = null;
      let ptMax2: Vector2D = null;
      if (disMax === diss1e1) {
        ptMax1 = start1;
        ptMax2 = end1;
      } else if (disMax === diss1s2) {
        ptMax1 = start1;
        ptMax2 = start2;
      } else if (disMax === diss1e2) {
        ptMax1 = start1;
        ptMax2 = end2;
      } else if (disMax === dise1s2) {
        ptMax1 = end1;
        ptMax2 = start2;
      } else if (disMax === dise1e2) {
        ptMax1 = end1;
        ptMax2 = end2;
      } else if (disMax === diss2e2) {
        ptMax1 = start2;
        ptMax2 = end2;
      }

      ret.push(ptMax1);
      ret.push(ptMax2);
    }

    return ret;

    /*
			if ((start1.equals(start2) && end1.equals(end2)))
			{
			//完全重合情况：
			//start2           end2
			//start1●━━━━━●end1
			result.push(-1, -1, -1, -1);
			return true;
			}
			else if ((start1.equals(end2) && end1.equals(start2)))
			{
			//完全重合情况：
			//  end2           start2
			//start1●━━━━━●end1
			result.push(-2, -2, -2, -2);
			return true;
			}
			else if (seg1.isPointOn(start2) && seg1.isPointOn(end2))
			{
			if (start1.equals(start2))
			{
			//       start2         end2
			//情况一：start1●━━━━━●───────●end1
			result.push(-1, -1, 3, 1);
			}
			else if (start1.equals(end2))
			{
			//         end2        start2
			//情况一：start1●━━━━━●───────●end1
			result.push(-2, -2, 2, 1);
			}
			else
			{
			//                   start2      end2
			//情况一：start1●───────●━━━━━●───────●end1
			result.push(0, 2, 3, 1);
			}
			return true;
			}
			else if (seg2.isPointOn(start1) && seg2.isPointOn(end1))
			{
			if (start2.equals(start1))
			{
			//       start1        end1
			//情况二：start2●━━━━━●───────●end2
			result.push(-1, -1, 1, 3);
			}
			else
			{
			//                   start1      end1
			//情况二：start2●───────●━━━━━●───────●end2
			result.push(2, 0, 1, 3);
			}
			return true;
			}
			else if (seg1.isPointOn(start2) && seg2.isPointOn(end1))
			{
			if (start2.equals(end1))
			{
			//                  start2 end1
			//情况三：start1●─────────●━━━━━●end2
			result.push(0, -1, -1, 3);
			}
			else
			{
			//                   start2    end1
			//情况三：start1●───────●━━━━●━━━━●end2
			result.push(0, 2, 1, 3);
			}
			return true;
			}
			else if (seg1.isPointOn(end2) && seg2.isPointOn(end1))
			{
			if (end2.equals(end1))
			{
			//                   end2 end1
			//情况四：start1●─────────●━━━━━●start2
			result.push(0, -1, -1, 2);
			}
			else
			{
			//                    end2     end1
			//情况四：start1●───────●━━━━●━━━━●start2
			result.push(0, 3, 1, 2);
			}
			return true;
			}
			else if (seg1.isPointOn(start2) && seg2.isPointOn(start1))
			{
			if (start2.equals(start1))
			{
			//               start2 start1
			//情况五：end1●─────────●━━━━━●end2
			result.push(1, -1, -1, 3);
			}
			else
			{
			//                start2    start1
			//情况五：end1●───────●━━━━●━━━━●end2
			result.push(1, 2, 0, 3);
			}
			return true;
			}
			else if (seg1.isPointOn(end2) && seg2.isPointOn(start1))
			{
			if (end2.equals(start1))
			{
			//                 end2 start1
			//情况六：end1●─────────●━━━━━●start2
			result.push(1, -1, -1, 2);
			}
			else
			{
			//                 end2    start1
			//情况六：end1●───────●━━━━●━━━━●start2
			result.push(1, 3, 0, 2);
			}
			return true;
			}

			return false;*/
  }

  // 是否重合或者说共线
  public static isSuperposition(line1: Line2D, line2: Line2D, dis: number = 0.0001): boolean {
    return (
      (line1.isPointOnLine(line2.start, dis) && line1.isPointOnLine(line2.end, dis)) ||
      (line2.isPointOnLine(line1.start, dis) && line2.isPointOnLine(line1.end, dis))
    );
  }

  public static getDirection(line: Line2D): Vector2D {
    return line.end.subtract(line.start);
  }

  private static isZeroNumber(num1: number, nummin: number = 1e-3): boolean {
    return Math.abs(num1) < nummin;
  }
  // extends Object
  constructor() {}
}
