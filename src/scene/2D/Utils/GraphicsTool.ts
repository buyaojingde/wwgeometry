/**
 * 绘制方法
 */
import { Graphics } from 'pixi.js';
import Line2D from '../../Model/Geometry/Line2D';
import Lineseg2D from '../../Model/Geometry/Lineseg2D';
import Vector2D from '../../Model/Geometry/Vector2D';

export default class GraphicsTool {
// 画原点
  public static drawZeroPoint() {
    const zero = new Graphics();
    const colorX = 0xff0000;
    const colorY = 0x0dae80;
    zero.beginFill(0x0dae80, 1);

    GraphicsTool.drawArrow(zero, Vector2D.ORIGIN_V2D, new Vector2D(30, 0), 4.0, colorX);
    GraphicsTool.drawArrow(zero, Vector2D.ORIGIN_V2D, new Vector2D(0, 30), 4.0, colorY);
    zero.lineStyle(1, 0xffffff, 1);
    GraphicsTool.drawCircle(zero, Vector2D.zero, 1);
    zero.endFill();
    return zero;
  }

  public static drawLine(graphicsInst: Graphics, point1: Vector2D, point2: Vector2D) {
    graphicsInst.moveTo(point1.x, point1.y);
    graphicsInst.lineTo(point2.x, point2.y);
  }

  /**
   * 绘制曲线
   * @param graphicsInst 指定层
   * @param point1 起点
   * @param point2 终点
   * @param gap 步长
   */
  public static drawDashedLine(graphicsInst: Graphics, point1: Vector2D, point2: Vector2D, gap: number) {
    let v2d1: Vector2D = null;
    let v2d2: Vector2D = null;
    const distance: number = Vector2D.distance(point1, point2);
    let temp: number = 0;
    while (temp < distance) {
      v2d1 = Vector2D.interpolate(point2, point1, temp / distance);
      temp += gap;
      if (temp > distance) {
        temp = distance;
      }
      v2d2 = Vector2D.interpolate(point2, point1, temp / distance);
      graphicsInst.moveTo(v2d1.x, v2d1.y);
      graphicsInst.lineTo(v2d2.x, v2d2.y);
      temp += gap;
    }
    return;
  }

  /**
   * @Description: 按段画虚线
   * @param
   * @data 2019/12/25
   */
  public static drawDashedLineSegment(graphicsInst: Graphics, point1: Vector2D, point2: Vector2D, segment: number) {
    const distance: number = Vector2D.distance(point1, point2);
    const gap = distance / segment / 2;
    GraphicsTool.drawDashedLine(graphicsInst, point1, point2, gap);
  }

  public static graphicsLineTo(graphics: Graphics, line: Line2D | Lineseg2D) {
    if (!line) {
      return;
    }
    const tran: Vector2D = line.getDirectionUnit().multiply(100000);
    const ptStart: Vector2D = line.start.transform(tran);
    const ptEnd: Vector2D = line.end.transform(tran.negate());
    graphics.moveTo(ptStart.x, ptStart.y);
    graphics.lineTo(ptEnd.x, ptEnd.y);
  }

  public static drawSector(
    graphicsInst: Graphics,
    param2: Vector2D,
    radius: number,
    startAngle: number,
    angleValue: number,
  ) {
    let num1: number = NaN;
    let controlX: number = NaN;
    let controlY: number = NaN;
    let anchorX: number = NaN;
    let anchorY: number = NaN;
    const px: number = param2.x;
    const py: number = param2.y;
    const num2: number = Math.ceil(Math.abs(angleValue) / (Math.PI / 4));
    const num3: number = angleValue / num2;

    graphicsInst.moveTo(px, py);
    angleValue = Math.abs(angleValue) % (2 * Math.PI);
    graphicsInst.lineTo(px + radius * Math.cos(startAngle), py + radius * Math.sin(startAngle));
    let temp = 1;
    while (temp <= num2) {
      startAngle = startAngle + num3;
      num1 = startAngle - num3 / 2;
      controlX = px + (radius / Math.cos(num3 / 2)) * Math.cos(num1);
      controlY = py + (radius / Math.cos(num3 / 2)) * Math.sin(num1);
      anchorX = px + radius * Math.cos(startAngle);
      anchorY = py + radius * Math.sin(startAngle);
      graphicsInst.quadraticCurveTo(controlX, controlY, anchorX, anchorY);
      temp++;
    }
    if (angleValue !== 2 * Math.PI) {
      graphicsInst.lineTo(px, py);
    }
    return;
  }

  public static drawBox(graphics: Graphics, param1: Vector2D, param2: Vector2D, param3: number) {
    const points = calculateBoundingPoints(param2, param1);
    graphics.beginFill(param3);
    GraphicsTool.drawPolygon(graphics, points);
    graphics.endFill();

    function calculateBoundingPoints(vec1: Vector2D, vec2: Vector2D, num: number = 0): Vector2D[] {
      const vecs = [];
      vecs.push(new Vector2D(-vec1.x / 2, -vec1.y / 2).rotateBy(num).incrementBy(vec2));
      vecs.push(new Vector2D(vec1.x / 2, -vec1.y / 2).rotateBy(num).incrementBy(vec2));
      vecs.push(new Vector2D(vec1.x / 2, vec1.y / 2).rotateBy(num).incrementBy(vec2));
      vecs.push(new Vector2D(-vec1.x / 2, vec1.y / 2).rotateBy(num).incrementBy(vec2));
      return vecs;
    }
  }

  public static drawPolygon(graphicsInst: Graphics, points: Vector2D[], len: number = 1) {
    const vec = points;

    if (!vec.length) {
      return;
    }

    vec.forEach((point, key) => {
      if (key === 0) {
        graphicsInst.moveTo(point.x * len, point.y * len);
      } else {
        graphicsInst.lineTo(point.x * len, point.y * len);
      }
    });

    graphicsInst.lineTo(vec[0].x * len, vec[0].y * len);
  }

  public static drawPolygonDash(graphicsInst: Graphics, points: Vector2D[], len: number = 1) {
    const vec = points;

    if (!vec.length) {
      return;
    }

    vec.forEach((point, key) => {
      if (key % 2 === 0) {
        graphicsInst.moveTo(point.x * len, point.y * len);
      } else {
        graphicsInst.lineTo(point.x * len, point.y * len);
      }
    });

    // graphicsInst.lineTo(vec[0].x * len, vec[0].y * len);
  }

  public static drawCircle(graphics: Graphics, point: Vector2D, radius: number) {
    graphics.drawCircle(point.x, point.y, radius);
  }

  // 销毁子对象
  public static destroy(view, destroySelf?: boolean) {
    if (view.children) {
      const oldChildren = view.removeChildren(0, view.children.length);
      for (const child of oldChildren) {
        this.destroy(child, true);
      }
      destroySelf && view.destroy(true);
    }
  }

  public static drawTriangle(p: Vector2D, h: number, base: number, dir: Vector2D): Vector2D[] {
    const points: Vector2D[] = [p];
    dir.normalize();
    const dropPoint = p.addV(dir.multiplyByNo(h));
    const baseDir = dir.getLeftNormal();
    const p1 = dropPoint.addV(baseDir.multiplyByNo(base / 2));
    const p2 = dropPoint.addV(baseDir.multiplyByNo(-base / 2));
    points.push(p1);
    points.push(p2);
    return points;
  }

  public static drawArrow(grap: Graphics, start: Vector2D, end: Vector2D, arrowWidth: number, color: number): Graphics {
    const direction = end.subtract(start).normalizeNo();
    const trianglePoints2 = GraphicsTool.drawTriangle(
      end,
      arrowWidth,
      arrowWidth,
      direction.multiplyByNo(-1),
    );
    grap.lineStyle(1.5, color);
    const newEnd = end.addV(direction.multiplyByNo(-arrowWidth));
    GraphicsTool.drawLine(grap, start, newEnd);
    grap.lineStyle(0, color);
    grap.beginFill(color, 1);
    grap.endFill();
    grap.beginFill(color, 1);
    GraphicsTool.drawPolygon(grap, trianglePoints2);
    return grap;
  }
}
