import Vector2D from './Vector2D';

export default class Curved2D {
  public static BezierFor3Point(StartPt: Vector2D, EndPt: Vector2D, ControlPt: Vector2D, Percent: number): Vector2D {
    const BezierPt: Vector2D = new Vector2D(0.0, 0.0);
    Percent = Math.max(Math.min(Percent, 1), 0);
    const OneMinusPercent: number = 1 - Percent;
    if (ControlPt) {
      BezierPt.x =
        OneMinusPercent * OneMinusPercent * StartPt.x +
        OneMinusPercent * Percent * ControlPt.x * 2 +
        Percent * Percent * EndPt.x;
      BezierPt.y =
        OneMinusPercent * OneMinusPercent * StartPt.y +
        OneMinusPercent * Percent * ControlPt.y * 2 +
        Percent * Percent * EndPt.y;
    } else {
      BezierPt.x = OneMinusPercent * StartPt.x + Percent * EndPt.x;
      BezierPt.y = OneMinusPercent * StartPt.y + Percent * EndPt.y;
    }
    return BezierPt;
  }
}
