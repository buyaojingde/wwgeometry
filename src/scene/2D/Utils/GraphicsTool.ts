/**
 * 绘制方法
 */
import Constant from '../../../utils/Math/contanst/constant';
import Box from '../../../utils/Math/geometry/Box';
import Point from '../../../utils/Math/geometry/Point';
import Segment from '../../../utils/Math/geometry/Segment';
import Vector2 from '../../../utils/Math/geometry/Vector2';
import GeometryTool from '../../../utils/Math/tool/GeometryTool';
import { Graphics } from 'pixi.js';

export default class GraphicsTool {
  // 画原点
  public static drawZeroPoint(
    zero: Graphics,
    zeroPoint: Point = Point.ZERO
  ): Graphics {
    if (!zero) zero = new Graphics();
    const colorX = 0xff0000;
    const colorY = 0x0dae80;
    zero.beginFill(0x0dae80, 1);
    GraphicsTool.drawArrow(
      zero,
      zeroPoint,
      zeroPoint.translate(new Vector2(60, 0)),
      4.0,
      colorX
    );
    GraphicsTool.drawArrow(
      zero,
      zeroPoint,
      zeroPoint.translate(new Vector2(0, -60)),
      4.0,
      colorY
    );
    zero.lineStyle(1, 0xffffff, 1);
    GraphicsTool.drawCircle(zero, zeroPoint, 1);
    zero.endFill();
    return zero;
  }

  public static drawLine(
    graphicsInst: Graphics,
    point1: any,
    point2: any,
    options: any = {}
  ) {
    const lineWidth = options.lineWidth ? options.lineWidth : 1;
    const color = options.color ? options.color : 0x0000000;
    const alpha = options.alpha ? options.alpha : 1;
    const alignment = options.alignment ? options.alignment : 0.5;
    graphicsInst.lineStyle(lineWidth, color, alpha, alignment);
    graphicsInst.beginFill(color);
    graphicsInst.moveTo(point1.x, point1.y);
    graphicsInst.lineTo(point2.x, point2.y);
    graphicsInst.endFill();
  }

  public static drawLines(
    graphicsInst: Graphics,
    segs: Segment[],
    options?: any
  ) {
    for (const seg of segs) {
      GraphicsTool.drawLine(graphicsInst, seg.start, seg.end, options);
    }
  }

  /**
   * 绘制曲线
   * @param graphicsInst 指定层
   * @param point1 起点
   * @param point2 终点
   * @param gap 步长
   */
  public static drawDashedLine(
    graphicsInst: Graphics,
    point1: Point,
    point2: Point,
    gap: number,
    options: any = {}
  ): void {
    const lineWidth = options.lineWidth ? options.lineWidth : 1;
    const color = options.color ? options.color : 0x0000000;
    const alpha = options.alpha ? options.alpha : 1;
    let v2d1: Vector2;
    let v2d2: Vector2;
    const distance: number = point1.distanceToPoint(point2);
    let temp = 0;
    graphicsInst.lineStyle(lineWidth, color, alpha);
    while (temp < distance) {
      v2d1 = GeometryTool.interpolate(point2, point1, temp / distance);
      temp += gap;
      if (temp > distance) {
        temp = distance;
      }
      v2d2 = GeometryTool.interpolate(point2, point1, temp / distance);
      graphicsInst.moveTo(v2d1.x, v2d1.y);
      graphicsInst.lineTo(v2d2.x, v2d2.y);
      temp += gap;
    }
    return;
  }

  /**
   * @Description: 按段画数量画虚线
   * @param
   * @data 2019/12/25
   */
  public static drawDashedLineSegment(
    graphicsInst: Graphics,
    point1: Point,
    point2: Point,
    segment: number
  ) {
    const distance: number = point1.distanceToPoint(point2);
    const gap = distance / segment / 2;
    GraphicsTool.drawDashedLine(graphicsInst, point1, point2, gap);
  }

  public static drawSector(
    graphicsInst: Graphics,
    param2: Vector2,
    radius: number,
    startAngle: number,
    angleValue: number
  ): void {
    let num1 = NaN;
    let controlX = NaN;
    let controlY = NaN;
    let anchorX = NaN;
    let anchorY = NaN;
    const px: number = param2.x;
    const py: number = param2.y;
    const num2: number = Math.ceil(Math.abs(angleValue) / (Math.PI / 4));
    const num3: number = angleValue / num2;

    graphicsInst.moveTo(px, py);
    angleValue = Math.abs(angleValue) % (2 * Math.PI);
    graphicsInst.lineTo(
      px + radius * Math.cos(startAngle),
      py + radius * Math.sin(startAngle)
    );
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

  // public static drawBox(graphics: Graphics, param1: Point, param2: Point, param3: number) {
  //   const points = new Segment(param1, param2).box.points;
  //   graphics.beginFill(param3);
  //   GraphicsTool.drawPolygon(graphics, points);
  //   graphics.endFill();
  // }

  public static extractOptions(options: any = {}): any {
    const lineWidth = options.lineWidth ? options.lineWidth : 1;
    const color = options.color ? options.color : 0x0000000;
    const alpha = options.alpha ? options.alpha : 1;
    return { lineWidth, color, alpha };
  }

  public static drawPolygon(
    graphicsInst: Graphics,
    points: any[],
    options: any = {}
  ) {
    const lineWidth = options.lineWidth ? options.lineWidth : 1;
    const color = options.color ? options.color : 0x0000000;
    const alpha = options.alpha ? options.alpha : 1;
    const fill = options.fill ? options.fill : true;
    !fill && graphicsInst.lineStyle(lineWidth, color, alpha);
    if (fill) {
      graphicsInst.beginFill(color, alpha);
    }
    const vec = points;

    if (!vec.length) {
      return;
    }

    vec.forEach((point, key) => {
      if (key === 0) {
        graphicsInst.moveTo(point.x, point.y);
      } else {
        graphicsInst.lineTo(point.x, point.y);
      }
    });

    graphicsInst.lineTo(vec[0].x, vec[0].y);
    if (fill) {
      graphicsInst.endFill();
    }
  }

  public static drawPolygonDash(
    graphicsInst: Graphics,
    points: Vector2[],
    len = 1
  ) {
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

  public static drawCircle(
    graphics: Graphics,
    point: any,
    radius: number,
    options: any = {}
  ) {
    const { lineWidth, color, alpha } = GraphicsTool.extractOptions(options);
    graphics.beginFill(color, alpha);
    graphics.drawCircle(point.x, point.y, radius);
    graphics.endFill();
  }

  // 销毁子对象
  public static destroy(view: any, destroySelf?: boolean) {
    if (view.children) {
      const oldChildren = view.removeChildren(0, view.children.length);
      for (const child of oldChildren) {
        this.destroy(child, true);
      }
      destroySelf && view.destroy(true);
    }
  }

  public static drawTriangle(
    p: Point,
    h: number,
    base: number,
    dir: Vector2
  ): Point[] {
    const points: Point[] = [p];
    const nDir: Vector2 = dir.normalize;
    const dropPoint = p.translate(nDir.multiply(h));
    const baseDir = nDir.ccwNormal;
    const p1 = dropPoint.translate(baseDir.multiply(base / 2));
    const p2 = dropPoint.translate(baseDir.multiply(-base / 2));
    points.push(p1);
    points.push(p2);
    return points;
  }

  public static drawArrow(
    grap: Graphics,
    start: Point,
    end: Point,
    arrowWidth: number,
    color: number
  ): Graphics {
    const direction = end.subtract(start).normalize;
    const trianglePoints2 = GraphicsTool.drawTriangle(
      end,
      arrowWidth,
      arrowWidth,
      direction.multiply(-1)
    );
    const newEnd = end.translate(direction.multiply(-arrowWidth));
    GraphicsTool.drawLine(grap, start, newEnd, {
      lineWidth: 1.5,
      color: color,
    });
    grap.lineStyle(0, color);
    grap.beginFill(color, 1);
    grap.endFill();
    GraphicsTool.drawPolygon(grap, trianglePoints2, { color: color, alpha: 1 });
    return grap;
  }

  public static drawBox(grp: Graphics, box: Box) {
    grp.lineStyle(1, Constant.colorMap.RED, 1);
    grp.drawRect(box.min.x, box.min.y, box.width, box.height);
  }
}
