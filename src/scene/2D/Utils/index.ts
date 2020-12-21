import Stage = PIXI.Container;
import DisplayObject = PIXI.DisplayObject;
import Point = PIXI.Point;
import Vector2 from '../../../utils/Math/geometry/Vector2';

export function pointToVector(point: Point): Vector2 {
  const { x, y } = point;
  return new Vector2(x, y);
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
