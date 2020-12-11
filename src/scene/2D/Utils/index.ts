import Stage = PIXI.Container;
import DisplayObject = PIXI.DisplayObject;
import Point = PIXI.Point;
import { Vector2 } from "three";
import BoundingBox2D from "../../Model/Geometry/BoundingBox2D";
import Vector2D from "../../Model/Geometry/Vector2D";

export function pointToVector(point: Point): Vector2D {
  const { x, y } = point;
  return new Vector2D(x, y);
}

export function vectorToPoint(point: Vector2): Point {
  const { x, y } = point;
  return new Point(x, y);
}

// @ts-ignore
export function getRootObject(obj: DisplayObject) {
  if (!obj.parent || obj.parent instanceof Stage) {
    return obj;
  }
  return getRootObject(obj.parent);
}

/**
 * 从x轴逆时针旋转
 * 查询角度是否人体可正常查看
 * 查询角度是否在2、3象限
 */
// @ts-ignore
export function checkHumanCanVisible(angle) {
  if (angle >= Math.PI / 2 && angle < Math.PI * (3 / 2)) {
    return false;
  } else {
    return true;
  }
}

/**
 * 根据pixi显示容器获取包围盒
 * @param container
 */
export function getBoundingBoxFromPixiDisplayObject(container: DisplayObject) {
  const pixiBounds = container.getLocalBounds();
  const homeBoundBox: BoundingBox2D = new BoundingBox2D().setFromCenterAndSize(
    new Vector2D(
      pixiBounds.x + pixiBounds.width / 2,
      pixiBounds.y + pixiBounds.height / 2
    ),
    new Vector2D(pixiBounds.width, pixiBounds.height)
  );

  return homeBoundBox;
}
