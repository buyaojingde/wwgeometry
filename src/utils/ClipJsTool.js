//import ClipperLib from './clipper';
var ClipperLib = require('clipper-lib');
export default class ClipJsTool {
  constructor() {}

  /**
   * 合并
   * @param {*} clips
   * @param {*} subs
   */
  unionPath(clips, subs) {
    var c = new ClipperLib.Clipper();
    c.AddPaths(clips, ClipperLib.PolyType.ptClip, true);
    c.AddPaths(subs, ClipperLib.PolyType.ptSubject, true);
    var solution = new ClipperLib.Paths();
    c.Execute(
      ClipperLib.ClipType.ctUnion,
      solution,
      ClipperLib.PolyFillType.pftNonZero,
      ClipperLib.PolyFillType.pftNonZero,
    );
    return solution;
  }

  /**
   * 求相交部分
   * @param {*} clips
   * @param {*} subs
   */
  intersectionPath(clips, clipIsClose, subs, subIsClose) {
    var c = new ClipperLib.Clipper();
    c.AddPaths(clips, ClipperLib.PolyType.ptClip, clipIsClose);
    c.AddPaths(subs, ClipperLib.PolyType.ptSubject, subIsClose);
    var solution = new ClipperLib.Paths();
    c.Execute(
      ClipperLib.ClipType.ctIntersection,
      solution,
      ClipperLib.PolyFillType.pftNonZero,
      ClipperLib.PolyFillType.pftNonZero,
    );
    return solution;
  }

  /**
   * 裁剪
   * @param {*} clips
   * @param {*} subs
   */
  differencePath(clips, clipIsClose, subs, subIsClose) {
    var c = new ClipperLib.Clipper();
    c.AddPaths(clips, ClipperLib.PolyType.ptClip, clipIsClose);
    c.AddPaths(subs, ClipperLib.PolyType.ptSubject, subIsClose);
    var solution = new ClipperLib.Paths();
    c.Execute(
      ClipperLib.ClipType.ctDifference,
      solution,
      ClipperLib.PolyFillType.pftNonZero,
      ClipperLib.PolyFillType.pftNonZero,
    );
    return solution;
  }

  simplifyPolygon(poly) {
    return ClipperLib.Clipper.SimplifyPolygon(poly);
  }

  /**
   * 一个多边形截断一根线
   * @param {*} clips
   * @param {*} subs
   */
  intersetLine(clips, subs) {
    var c = new ClipperLib.Clipper();
    c.AddPath(clips, ClipperLib.PolyType.ptClip, true);
    c.AddPath(subs, ClipperLib.PolyType.ptSubject, false);
    var solution = new ClipperLib.Paths();
    c.Execute(
      ClipperLib.ClipType.ctIntersection,
      solution,
      ClipperLib.PolyFillType.pftEvenOdd,
      ClipperLib.PolyFillType.pftEvenOdd,
    );
    return solution;
  }

  differencePathA(clips, clipIsClose, subs, subIsClose) {
    var c = new ClipperLib.Clipper();
    c.AddPaths(clips, ClipperLib.PolyType.ptClip, clipIsClose);
    c.AddPaths(subs, ClipperLib.PolyType.ptSubject, subIsClose);
    var solution = new ClipperLib.Paths();
    c.Execute(
      ClipperLib.ClipType.ctDifference,
      solution,
      ClipperLib.PolyFillType.pftEvenOdd,
      ClipperLib.PolyFillType.pftEvenOdd,
    );
    return solution;
  }

  /**
   * 偏移
   * @param {*} path
   * @param {*} offset
   */
  polygonOffset(path, offset) {
    var c = new ClipperLib.ClipperOffset(2.0, 0.25);
    c.AddPath(path, ClipperLib.JoinType.jtMiter, ClipperLib.EndType.etClosedPolygon);
    var solution = new ClipperLib.Paths();
    c.Execute(solution, offset);
    return solution;
  }
}
