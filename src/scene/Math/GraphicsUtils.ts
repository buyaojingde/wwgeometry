import { Graphics } from "pixi.js";
import {
  Box3,
  BoxBufferGeometry,
  BoxGeometry,
  BufferGeometry,
  Color,
  DoubleSide,
  EdgesGeometry,
  Float32BufferAttribute,
  LineBasicMaterial,
  LineSegments,
  Material,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PlaneGeometry,
  RingBufferGeometry,
  Shape,
  ShapeBufferGeometry,
  Vector3,
  VertexColors,
} from "three";

/**
 * Desc: 绘制双向箭头
 *
 * @bodyLen:   中间部分长度
 * @bodyWidth: 中间部分宽度
 * @arrowLenth: 单个箭头长度
 * @arrowWidth: 单个箭头宽度
 *
 *       /\
 *      /  \
 *       ||
 *       ||
 *       ||
 *       ||
 *       ||
 *      \  /
 *       \/
 */
export function drawDoubleDirectionArrow(
  bodyLen: number,
  bodyWidth: number,
  arrowLen: number,
  arrowWidth: number
): Shape {
  const Minus = -1;

  const shape = new Shape();
  shape.moveTo(0, bodyLen * 0.5 + arrowLen);
  shape.lineTo(arrowWidth * 0.5 * Minus, bodyLen * 0.5);
  shape.lineTo(bodyWidth * 0.5 * Minus, bodyLen * 0.5);
  shape.lineTo(bodyWidth * 0.5 * Minus, bodyLen * 0.5 * Minus);
  shape.lineTo(arrowWidth * 0.5 * Minus, bodyLen * 0.5 * Minus);
  shape.lineTo(0, (bodyLen * 0.5 + arrowLen) * Minus);
  shape.lineTo(arrowWidth * 0.5, bodyLen * 0.5 * Minus);
  shape.lineTo(bodyWidth * 0.5, bodyLen * 0.5 * Minus);
  shape.lineTo(bodyWidth * 0.5, bodyLen * 0.5);
  shape.lineTo(arrowWidth * 0.5, bodyLen * 0.5);
  shape.lineTo(0, bodyLen * 0.5 + arrowLen);

  return shape;
}

/**
 *  根据内、外半径生成完整圆环或圆环弧
 * @outerRadius:  外半径
 * @innerRadius:  内半径
 * @angleInRadian:  生成圆环的角度
 * @mat: 圆环对应的材质
 *
 **/

// @ts-ignore
export function createRingByAngle(
  outerRadius,
  innerRadius,
  angleInRadian,
  mat?: Material
) {
  const shapeGeometry = new RingBufferGeometry(
    innerRadius,
    outerRadius,
    32 * 8,
    1,
    0,
    angleInRadian
  );
  mat = mat
    ? mat
    : new MeshBasicMaterial({
        color: 0x0eaf7f,
        opacity: 0.3,
        transparent: false,
      });

  const ringMesh: Mesh = new Mesh(shapeGeometry, mat);
  ringMesh.rotateX((Math.PI / 2) * -1);
  return ringMesh;
}

/**
 * 绘制PIXI(2D场景)下的扇形
 * @param graphics
 * @param point
 * @param radius
 * @param startAngle
 * @param angleValue
 */
export function drawSector(
  graphics: any,
  point: any,
  radius: number,
  startAngle: number,
  angleValue: number
): void {
  let num2 = NaN;
  let num3 = NaN;
  let num4 = NaN;
  let num5 = NaN;
  let num6 = NaN;
  const tmpx: any = point.x;
  const tmpy: any = point.y;
  const tmpradias: any = radius;
  graphics.moveTo(tmpx, tmpy);
  angleValue = Math.abs(angleValue) > 360 ? 360 : angleValue;
  const num9: any = Math.ceil(Math.abs(angleValue) / 45);
  const num10: any = ((angleValue / num9) * Math.PI) / 180;
  startAngle = (startAngle * Math.PI) / 180;
  graphics.lineTo(
    tmpx + tmpradias * Math.cos(startAngle),
    tmpy + tmpradias * Math.sin(startAngle)
  );
  let num11 = 1;
  while (num11 <= num9) {
    startAngle = startAngle + num10;
    num2 = startAngle - num10 / 2;
    num3 = tmpx + (tmpradias / Math.cos(num10 / 2)) * Math.cos(num2);
    num4 = tmpy + (tmpradias / Math.cos(num10 / 2)) * Math.sin(num2);
    num5 = tmpx + tmpradias * Math.cos(startAngle);
    num6 = tmpy + tmpradias * Math.sin(startAngle);
    graphics.quadraticCurveTo(num3, num4, num5, num6);
    num11 = num11 + 1;
  }
  if (angleValue !== 360) {
    graphics.lineTo(tmpx, tmpy);
  }
  return;
}

/**
 * 绘制平底扇形
 * @param graphics
 * @param point
 * @param radius
 * @param startAngle
 * @param angleValue
 * @returns {PIXI.Graphics}
 */
export function drawLineSector(
  graphics: Graphics,
  point: { x: number; y: number },
  radius: { outerRadius: number; innerRadius: number },
  startAngle: number,
  angleValue: number,
  lineWidth = 1
): Graphics {
  const tmpx: any = point.x;
  const tmpy: any = point.y;
  const tmpradias: any = radius.outerRadius;
  const temInnerRad: any = radius.innerRadius;

  // angleValue = Math.abs(angleValue) > 180 ? 180 : angleValue;
  startAngle = (startAngle * Math.PI) / 180;

  const startInnerArcPointX = tmpx + temInnerRad * Math.cos(-startAngle); // 内部弧线起点
  const startInnerArcPointY = tmpy + temInnerRad * Math.sin(-startAngle); // 内部弧线起点

  const startOuterArcPointX = tmpx + tmpradias * Math.cos(-startAngle); // 外部弧线起点
  const startOuterArcPointY = tmpy + tmpradias * Math.sin(-startAngle); // 外部弧线起点

  graphics.arc(0, 0, tmpradias, startAngle, -startAngle, false);
  graphics.lineTo(startInnerArcPointX, startInnerArcPointY);
  graphics.lineTo(startInnerArcPointX, -startInnerArcPointY);
  graphics.lineTo(startOuterArcPointX, -startOuterArcPointY);
  graphics.endFill();

  graphics.beginFill(0xffffff, 0);
  graphics.lineStyle(lineWidth, 0xffffff, 1);
  graphics.moveTo(startOuterArcPointX, -startOuterArcPointY);
  graphics.lineTo(startInnerArcPointX, -startInnerArcPointY);
  graphics.lineTo(startInnerArcPointX, startInnerArcPointY);
  graphics.lineTo(startOuterArcPointX, startOuterArcPointY);

  return graphics;
}

/**
 * 绘制PIXI(2D)场景的网格
 * @param {{}} opt
 * @returns {Graphics}
 * @param graphics
 */
export function drawGrid(graphics: Graphics, opt = {}) {
  // 兼容falsh，将2D场景画布大小改为7144，这里取根号，即将size和step的值由原来的100改为84
  const options = {
    size: 240,
    lineWidth: 1,
    step: 50,
    lineColor: 0xd4d4d4,
    lineColor2: 0xc0c0c0,
    ...opt,
  };

  const unitGrid = graphics;
  unitGrid.clear();

  const unitNum = options.size;
  const length = options.size * options.step;
  unitGrid.width = length;
  unitGrid.height = length;
  const items = ["column", "row"];
  for (const item of items) {
    for (let i = 0; i <= unitNum; i++) {
      const offset = i * options.step;
      unitGrid.lineStyle(
        options.lineWidth,
        !(i % 10) ? options.lineColor2 : options.lineColor
      );
      if (item === "row") {
        unitGrid.moveTo(0, offset);
        unitGrid.lineTo(length, offset);
      } else if (item === "column") {
        unitGrid.moveTo(offset, 0);
        unitGrid.lineTo(offset, length);
      }
    }
  }
  const sizePx = options.size * options.step;
  unitGrid.position.set(-sizePx / 2, -sizePx / 2);

  // drawzeroPoint();

  return unitGrid;
}

/**
 * 绘制PIXI(2D)场景下的虚线
 * @param x0
 * @param y0
 * @param x1
 * @param y1
 * @param dashedLength
 * @param graphics
 * @param lineStyle
 */
export const drawDash = (() => {
  const dashed: Graphics = new Graphics();

  function angle(x0: number, y0: number, x1: number, y1: number) {
    const diffX = Math.abs(x1 - x0);
    const diffY = Math.abs(y1 - y0);
    let cita;
    if (x1 > x0) {
      if (y1 > y0) {
        cita = (360 * Math.atan(diffY / diffX)) / (2 * Math.PI);
      } else {
        if (y1 < y0) {
          cita = (-360 * Math.atan(diffY / diffX)) / (2 * Math.PI);
        } else {
          cita = 0;
        }
      }
    } else {
      if (x1 < x0) {
        if (y1 > y0) {
          cita = 180 - (360 * Math.atan(diffY / diffX)) / (2 * Math.PI);
        } else {
          if (y1 < y0) {
            cita = 180 + (360 * Math.atan(diffY / diffX)) / (2 * Math.PI);
          } else {
            cita = 180;
          }
        }
      } else {
        if (y1 > y0) {
          cita = 90;
        } else {
          if (y1 < y0) {
            cita = -90;
          } else {
            cita = 0;
          }
        }
      }
    }
    return cita;
  }

  function drawDashUnit(
    graphics: Graphics,
    dashedLength = 20,
    lineStyle: number[]
  ) {
    graphics.clear();
    graphics.lineStyle(...lineStyle);
    graphics.moveTo(0, 0);
    graphics.lineTo(dashedLength, 0);
    graphics.moveTo(dashedLength * 2, 0);
    graphics.lineTo(dashedLength * 2.5, 0);
  }

  return (
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    lineStyle: number[] = [5, 0xfffff, 1],
    dashedLength = 20,
    graphics = undefined
  ) => {
    let dashUnit: any;

    if (graphics) {
      dashUnit = graphics;
    } else {
      dashUnit = dashed;
    }

    if (!!lineStyle && dashUnit.$lineStyle !== lineStyle) {
      drawDashUnit(dashUnit, dashedLength, lineStyle);
    }

    const dashedtexture = dashUnit.generateCanvasTexture(1, 1);
    const linelength = Math.pow(
      Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2),
      0.5
    );
    const tilingSprite = new PIXI.TilingSprite(
      dashedtexture,
      linelength,
      lineStyle[0]
    );
    tilingSprite.x = x0;
    tilingSprite.y = y0;
    tilingSprite.rotation = (angle(x0, y0, x1, y1) * Math.PI) / 180;
    tilingSprite.pivot.set(lineStyle[0] / 2, lineStyle[0] / 2);

    return tilingSprite;
  };
})();

/**
 * 绘制左旋转环箭头
 * @innerRadius:  内半径
 * @outerRadius:  外半径
 * @edgeLen: 箭头边长
 *
 */

export function drawRotateArrowLeft(
  innerRadius: number,
  outerRadius: number,
  edgeLen: number,
  mat?: Material
): Mesh {
  const shape: Shape = new Shape();

  shape.moveTo((innerRadius + outerRadius) * 0.5 - edgeLen * 0.5, 0);
  shape.lineTo((innerRadius + outerRadius) * 0.5, edgeLen * -1);
  shape.lineTo((innerRadius + outerRadius) * 0.5 + edgeLen * 0.5, 0);
  shape.lineTo((innerRadius + outerRadius) * 0.5 - edgeLen * 0.5, 0);

  const shapeGeom: ShapeBufferGeometry = new ShapeBufferGeometry(shape);
  mat = mat
    ? mat
    : new MeshBasicMaterial({
        color: 0x0eaf7f,
      });

  const mesh: Mesh = new Mesh(shapeGeom, mat);
  mesh.rotateX((Math.PI / 2) * -1);

  return mesh;
}

/**
 * 绘制右旋转环箭头
 * @innerRadius:  内半径
 * @outerRadius:  外半径
 * @edgeLen: 箭头边长
 *
 */

export function drawRotateArrowRight(
  innerRadius: number,
  outerRadius: number,
  edgeLen: number,
  mat?: Material
): Mesh {
  const shape: Shape = new Shape();

  shape.moveTo(0, (innerRadius + outerRadius) * 0.5 - edgeLen * 0.5);
  shape.lineTo(0, (innerRadius + outerRadius) * 0.5 + edgeLen * 0.5);
  shape.lineTo(edgeLen * -1, (innerRadius + outerRadius) * 0.5);
  shape.lineTo(0, (innerRadius + outerRadius) * 0.5 - edgeLen * 0.5);

  const shapeGeom: ShapeBufferGeometry = new ShapeBufferGeometry(shape);
  mat = mat
    ? mat
    : new MeshBasicMaterial({
        color: 0x0eaf7f,
      });

  const mesh: Mesh = new Mesh(shapeGeom, mat);
  mesh.rotateX((Math.PI / 2) * -1);

  return mesh;
}

/**
 * Desc: 绘制圆环状双向箭头
 *
 * @minRadius: 箭头上离圆心最小值
 * @maxRadius: 箭头上点离圆形最大值
 * @addAngle：角度增加量，决定了箭头部分长度
 *
 */
export function drawArrowLeft(
  minRadius: number,
  maxRadius: number,
  addAngle: number
): Shape {
  const ratio = 1.75;
  const middleRadius = 0.5 * (minRadius + maxRadius);

  const shape = new Shape();

  shape.moveTo(
    minRadius * Math.cos(ratio * Math.PI),
    minRadius * Math.sin(ratio * Math.PI)
  );
  shape.lineTo(
    maxRadius * Math.cos(ratio * Math.PI),
    maxRadius * Math.sin(ratio * Math.PI)
  );
  shape.lineTo(
    middleRadius * Math.cos(ratio * Math.PI + addAngle),
    middleRadius * Math.sin(ratio * Math.PI + addAngle)
  );
  shape.lineTo(
    minRadius * Math.cos(ratio * Math.PI),
    minRadius * Math.sin(ratio * Math.PI)
  );

  return shape;
}

export function drawArrowRight(
  minRadius: number,
  maxRadius: number,
  addAngle: number
): Shape {
  const middleRadius = 0.5 * (minRadius + maxRadius);
  const quarter = 1.25;

  const shape = new Shape();

  shape.moveTo(
    minRadius * Math.cos(quarter * Math.PI),
    minRadius * Math.sin(quarter * Math.PI)
  );
  shape.lineTo(
    maxRadius * Math.cos(quarter * Math.PI),
    maxRadius * Math.sin(quarter * Math.PI)
  );
  shape.lineTo(
    middleRadius * Math.cos(quarter * Math.PI - addAngle),
    middleRadius * Math.sin(quarter * Math.PI - addAngle)
  );
  shape.lineTo(
    minRadius * Math.cos(quarter * Math.PI),
    minRadius * Math.sin(quarter * Math.PI)
  );

  return shape;
}

/**
 * Desc: 获取当前Object3D对象包围盒长、宽、高
 *
 * @return Vector3(长、高、宽)
 *
 */
export function getBoundingBoxSize(object: Object3D): Vector3 {
  let minX = Number.MAX_VALUE;
  let minY = Number.MAX_VALUE;
  let minZ = Number.MAX_VALUE;
  let maxX = Number.MIN_VALUE;
  let maxY = Number.MIN_VALUE;
  let maxZ = Number.MIN_VALUE;

  if (object instanceof Object3D) {
    object.traverse((mesh) => {
      if (mesh instanceof Mesh) {
        mesh.geometry.computeBoundingBox();
        const bBox = mesh.geometry.boundingBox;

        // compute overall bbox
        minX = Math.min(minX, bBox.min.x);
        minY = Math.min(minY, bBox.min.y);
        minZ = Math.min(minZ, bBox.min.z);
        maxX = Math.max(maxX, bBox.max.x);
        maxY = Math.max(maxY, bBox.max.y);
        maxZ = Math.max(maxZ, bBox.max.z);
      }
    });
  }

  const width = Math.abs(maxX - minX);
  const height = Math.abs(maxY - minY);
  const depth = Math.abs(maxZ - minZ);

  const size: Vector3 = new Vector3();
  size.x = width; // 长
  size.y = height; // 高
  size.z = depth; // 宽

  return size;
}

/**
 * Desc: 根据尺寸构建3D显示对象的包围盒
 * @param size ：包围盒线框尺寸
 * @param lineMat : 包围盒线框材质
 */
export function buildBoundingBoxBySize(
  size: Vector3,
  lineMat?: LineBasicMaterial,
  color?: number
): LineSegments {
  const tmpBox: BoxBufferGeometry = new BoxBufferGeometry(
    size.x,
    size.y,
    size.z
  );
  tmpBox.translate(0, size.y * 0.5, 0);
  const edges: EdgesGeometry = new EdgesGeometry(tmpBox, 1);

  lineMat = lineMat
    ? lineMat
    : new LineBasicMaterial({
        color: color || 0x0eaf7f,
        transparent: true,
        opacity: 0.85,
        linewidth: 2,
        depthTest: false,
      });

  const line = new LineSegments(edges, lineMat);

  return line;
}

/**
 * Desc: 根据尺寸构建3D显示对象的包围盒
 * @param size ：包围盒线框尺寸
 * @param lineMat : 包围盒线框材质
 */
export function buildBoxGeometryBySize(
  size: Vector3,
  lineMat?: MeshBasicMaterial
): Mesh {
  const tmpBox: BoxGeometry = new BoxGeometry(size.x, size.y, size.z);
  tmpBox.translate(0, size.y * 0.5, 0);

  lineMat = lineMat
    ? lineMat
    : new MeshBasicMaterial({
        color: 0x0eaf7f,
        transparent: true,
        opacity: 0.55,
        depthTest: false,
      });

  const line = new Mesh(tmpBox, lineMat);

  return line;
}

const planeGeo = new PlaneGeometry(15000, 15000);
const meshMat = new MeshBasicMaterial({
  transparent: true,
  opacity: 0,
  side: DoubleSide,
});

/**
 * Desc : 创建一个透明的Plane Mesh 用于拾取等操作
 * @returns {Mesh}
 */
export function buildTransparencyPlane(): Mesh {
  return new Mesh(planeGeo, meshMat);
}

const lineSegmentsMaterial = new LineBasicMaterial({
  vertexColors: VertexColors,
  depthWrite: false,
});

// @ts-ignore
export function buildFloorGrid(size, divisions, color1, color2): LineSegments {
  size = 12000;
  divisions = 240;
  size = size || 10;
  divisions = divisions || 10;
  color1 = new Color(color1 !== undefined ? color1 : 0x444444);
  color2 = new Color(color2 !== undefined ? color2 : 0x888888);

  const center = divisions / 2;
  const step = size / divisions;
  const halfSize = size / 2;

  const vertices = [];
  // @ts-ignore
  const colors = [];

  for (let i = 0, j = 0, k = -halfSize; i <= divisions; i++, k += step) {
    vertices.push(-halfSize, 0, k, halfSize, 0, k);
    vertices.push(k, 0, -halfSize, k, 0, halfSize);

    const color = i % 10 === 0 ? color1 : color2;

    // @ts-ignore
    color.toArray(colors, j);
    j += 3;
    // @ts-ignore
    color.toArray(colors, j);
    j += 3;
    // @ts-ignore
    color.toArray(colors, j);
    j += 3;
    // @ts-ignore
    color.toArray(colors, j);
    j += 3;
  }

  const geometry = new BufferGeometry();
  geometry.addAttribute("position", new Float32BufferAttribute(vertices, 3));
  // @ts-ignore
  geometry.addAttribute("color", new Float32BufferAttribute(colors, 3));

  return new LineSegments(geometry, lineSegmentsMaterial);
}

export function getVectorsByBox3(bBox: Box3) {
  const minX = bBox.min.x;
  const minY = bBox.min.y;
  const minZ = bBox.min.z;
  const maxX = bBox.max.x;
  const maxY = bBox.max.y;
  const maxZ = bBox.max.z;

  return [
    new Vector3(minX, minY, minZ),
    new Vector3(maxX, minY, minZ),
    new Vector3(maxX, minY, maxZ),
    new Vector3(minX, minY, maxZ),

    new Vector3(minX, maxY, minZ),
    new Vector3(maxX, maxY, minZ),
    new Vector3(maxX, maxY, maxZ),
    new Vector3(minX, maxY, maxZ),
  ];
}

/**
 * 画简单箭头
 */
// @ts-ignore
export function drawArrowSimple(options: any = {}, grap: Graphics = null) {
  options = {
    width: 3,
    length: 200,
    color: 0x000000,
    arrowLength: 10,
    arrowAngle: Math.PI / 4,
    ...options,
  };
  if (!grap) {
    grap = new Graphics();
  }
  if (options.length > 0) {
    grap.lineStyle(options.width, options.color);
    grap.moveTo(0, 0);
    grap.lineTo(options.length, 0);
    grap.moveTo(
      options.length - options.arrowLength * Math.cos(options.arrowAngle),
      -options.arrowLength * Math.sin(options.arrowAngle)
    );
    grap.lineTo(options.length, 0);
    grap.lineTo(
      options.length - options.arrowLength * Math.cos(options.arrowAngle),
      options.arrowLength * Math.sin(options.arrowAngle)
    );
  }

  return grap;
}
