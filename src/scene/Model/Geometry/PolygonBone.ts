import Lineseg2D from './Lineseg2D';
import Vector2D from './Vector2D';

export default class PolygonBone {
  private _bone: Lineseg2D = null;
  private _leftIndex: number[] = null;
  private _rightIndex: number[] = null;
  private _distance: number;
  private _boneSegCenter: Vector2D = null;
  private _mode: number = 0;

  constructor() {}

  public setBone(bone: Lineseg2D) {
    this._bone = bone;
  }

  public getBone(): Lineseg2D {
    return this._bone;
  }

  public setDistance(d: number) {
    this._distance = d;
  }

  public getDistance(): number {
    return this._distance;
  }

  public setIndex(left: number[], right: number[]) {
    this._leftIndex = left;
    this._rightIndex = right;
  }

  public getLeftIndex(): number[] {
    return this._leftIndex;
  }

  public getRightIndex(): number[] {
    return this._rightIndex;
  }

  public getBoneCenter(): Vector2D {
    return this._boneSegCenter;
  }

  public setBoneCenter(center: Vector2D) {
    this._boneSegCenter = center;
  }

  public equal(polygon: PolygonBone): boolean {
    return (
      (Math.abs(polygon._bone.start.x - this._bone.start.x) < 0.0001 &&
        Math.abs(polygon._bone.start.y - this._bone.start.y) < 0.0001 &&
        Math.abs(polygon._bone.end.x - this._bone.end.x) < 0.0001 &&
        Math.abs(polygon._bone.end.y - this._bone.end.y) < 0.0001) ||
      (Math.abs(polygon._bone.start.x - this._bone.end.x) < 0.0001 &&
        Math.abs(polygon._bone.start.y - this._bone.end.y) < 0.0001 &&
        Math.abs(polygon._bone.end.x - this._bone.start.x) < 0.0001 &&
        Math.abs(polygon._bone.end.y - this._bone.start.y) < 0.0001)
    );
  }
}
