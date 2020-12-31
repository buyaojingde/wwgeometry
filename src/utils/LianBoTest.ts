import * as isect from 'isect';
import maxBy from 'lodash/maxBy';
import { Graphics } from 'pixi.js';
import SplayTree from 'splaytree';
import {
  Color,
  DoubleSide,
  Euler,
  Group,
  Matrix4,
  Mesh,
  MeshPhongMaterial,
  Shape,
  ShapeBufferGeometry,
  Vector3,
} from 'three';
import Scene2D from '../scene/2D';
import GraphicsTool from '../scene/2D/Utils/GraphicsTool';
import JSTSUtils from '../scene/2D/Utils/JSTSUtils';
import GeoSurface from '../scene/Model/Geometry/GeoSurface';
import Structure, { StType } from '../scene/Model/Home/Structure';
import ObserveVector3 from '../scene/Model/ObserveMath/ObserveVector3';
import ConfigStructure from './ConfigStructure';
import Constant from './Math/contanst/constant';
import Sweep from './Math/geometry/algorithm/Sweep';
import Box from './Math/geometry/Box';
import Matrix3x3 from './Math/geometry/Matrix3x3';
import Point from './Math/geometry/Point';
import Polygon from './Math/geometry/Polygon';
// import PolygonOp from "./Math/geometry/PolygonOp";
import Segment from './Math/geometry/Segment';
import Vector2 from './Math/geometry/Vector2';
import MathUtils from './Math/math/MathUtils';
import Quadtree from './Math/math/Quadtree';
import PolygonClipper from './PolygonClipper';
import GeometryFactory = jsts.geom.GeometryFactory;
import Geometry = jsts.geom.Geometry;
import Coordinate = jsts.geom.Coordinate;
import Matrix = PIXI.Matrix;

class LianBoTest {
  public vv!: ObserveVector3;
  public v3 = new ObserveVector3();
  public changNum = 10;
  public container: PIXI.Container = new PIXI.Container();
  public group!: Group;
  public angle = 15;

  public constructor() {
    (window as any).TEST = () => {
      this.testMain();
    };
    (window as any).TEST1 = () => {
      // this.testJSTSSegIntersection();
      // this.testJSTSPlyIntersection();
      // this.testFindOutFace();
      this.testOutFace();
    };
    (window as any).TEST2 = () => {
      this.testPolygonOverlap();
    };
  }

  public init(): void {
    // autorun(() => {
    //   console.log(this.v3.x);
    //   console.log(this.v3.z);
    //   console.log(this.v3.y);
    // })
    // reaction(
    //   () => {
    //     return [this.v3.x, this.v3.y, this.v3.z];
    //   },
    //   () => {
    //     console.log("[this.v3.x, this.v3.y, this.v3.z]");
    //   }
    // );
    return;
  }

  testFindOutFace() {
    const st = this.lvl.findByRvtId('2189459');
    const segs = this.findOutWallFace(st);
  }
  // 1647061
  testOutFace() {
    const st = this.lvl.findByRvtId('2189472');
    const st1 = this.lvl.findByRvtId('1647145');
    // const st2 = this.lvl.findByRvtId("1647548");
    // const r2 = this.lvl.findByRvtId("1647548");
    const segs = st.outFace([st1]);
    this.drawSegs(segs);
  }

  testDiff(plg: Polygon, plg2: Polygon) {
    const diffPlg = JSTSUtils.iDifference(plg, plg2);
    const segs = diffPlg.edges.filter((item) => !plg.insideSeg(item));
    this.drawSegs(segs);
  }

  testJSTSPlyIntersection() {
    const ply = this.lvl.findByRvtId('1647039').polygon;
    const ply1 = this.lvl.findByRvtId('1650962').polygon;
    const ply2 = this.lvl.findByRvtId('2187646').polygon;
    const result = JSTSUtils.iItersectionPlg(ply, ply2);
    const result1 = JSTSUtils.iDifference(ply, ply2);
    console.log(result);
    console.log(result1);
  }

  testJSTSSegIntersection() {
    const seg = new Segment(new Point(0, 0), new Point(0, 10));
    const seg1 = new Segment(new Point(0, 5), new Point(10, 5));
    const result = this.intersection(seg, seg1);
    console.log(result);
  }

  public intersection(seg: Segment, seg1: Segment) {
    if (seg.collinear(seg1)) {
      const seg = new Segment(new Point(0, 0), new Point(0, 10));
      const seg1 = new Segment(new Point(0, 5), new Point(10, 5));
      const result = JSTSUtils.iIntersectionSeg(seg, seg1);
      return result;
    }
    return null;
  }
  public get lvl() {
    return Scene2D.getInstance().home.curLevel;
  }

  testPolygonOverlap() {
    MathUtils.Epsilon = ConfigStructure.accuracy;
    this.container.removeChildren();
    const f0 = this.lvl.findByRvtId('2187670');
    const s1 = this.lvl.findByRvtId('1647122');
    const r0 = this.lvl.findByRvtId('1650976');
    console.log(f0.polygon.isBox());
    console.log(s1.polygon.isBox());

    // console.log(r0.polygon.insidePolygon(f0.polygon));
    this.findOutWallFace(f0);
    // this.drawSegs(segs);
    // const segs = this.findOutWallFace(f0);
    // const seg0 = s1.polygon.edges[1];
    // const rSeg = r0.polygon.edges[3];
    // const result = seg0.subtract(rSeg);
    // const segs = f0.outFace([s1]);
    // this.drawSegs(segs);
    MathUtils.resetAccuracy();
  }

  testMain() {
    // this.testJSTS();
    // this.drawRemainder();
    // this.testrenderHome();
    // this.renderTest();

    this.testStructureMove();
  }

  /**
   * @author lianbo
   * @date 2020-12-29 11:21:04
   * @Description: 构建移动后房间跟随变化
   */
  testStructureMove() {
    const room = this.lvl.findByRvtId('2039953');
    const seg = ConfigStructure.guidelines[0];
  }

  testCutBox() {
    const column = this.lvl.findByRvtId('2037034');
    const boxes = column.polygon.cutBox();
    console.log(boxes);
  }

  calcBox(minP: Point, width: number, height: number) {
    const maxP = minP.translate(new Vector2(width, height));
    return new Box(minP, maxP);
  }

  testGrpzIndex() {
    const width = 40;
    const height = 50;
    this.container.sortableChildren = true;
    for (let i = 0; i < 10; i++) {
      const grpPath = this.calcBox(
        new Point((width * i) / 2, (height * i) / 2),
        width,
        height
      ).points;
      const grp = new PIXI.Graphics();
      grp.zIndex = 10 - i;
      grp.lineStyle(1, Constant.colorRandom(), 1);
      grp.beginFill(Constant.colorRandom(), 1);
      GraphicsTool.drawPolygon(grp, grpPath);
      grp.endFill();
      this.container.addChild(grp);
    }
    this.renderTest();
    console.log('done');
  }

  testrenderHome() {
    // @ts-ignore
    const draws: any[] = this.lvl.structures.concat(this.lvl.rooms);
    for (const testStructure of draws) {
      const grp = new PIXI.Graphics();
      grp.cacheAsBitmap = true;
      grp.lineStyle(1, Constant.colorRandom(), 1);
      grp.beginFill(Constant.colorRandom(), 0.8);
      GraphicsTool.drawPolygon(grp, testStructure.boundary);
      grp.endFill();
      this.container.addChild(grp);
    }
  }

  /**
   * @author lianbo
   * @date 2020-12-16 17:35:20
   * @Description: pixi 渲染的性能测试
   *
   */
  pixiRenderPerformance() {
    const maxWidth = 40;
    const maxHeight = 50;
    const width = 5;
    const height = 5;

    for (let i = 0; i < maxHeight; i++) {
      for (let j = 0; j < maxWidth; j++) {
        const grp = new PIXI.Graphics();
        // const con = new PIXI.Container();
        // grp.cacheAsBitmap = true;
        const grpPath = [
          { x: width * j, y: height * i },
          { x: width * (j + 1), y: height * i },
          { x: width * (j + 1), y: height * (i + 1) },
          { x: width * j, y: height * (i + 1) },
        ];
        // con.addChild(grp);
        grp.lineStyle(1, Constant.colorRandom(), 1);
        grp.beginFill(Constant.colorRandom(), 0.8);
        GraphicsTool.drawPolygon(grp, grpPath);
        grp.endFill();
        this.container.addChild(grp);
      }
    }
    this.renderTest();
    console.log('done');
  }

  testSegIntersection() {
    const seg = new Segment(new Point(0, 0), new Point(1, 1));
    const seg1 = new Segment(new Point(0.4, 0.5), new Point(0, 2));
    const result = seg.intersect(seg1);
    if (result) {
      console.log(seg.contain(result));
      console.log(seg1.contain(result));
    }
  }

  testShearTF() {
    const p = new Point(1, 1);
    const p1 = new Point(3, 2);
    const p2 = new Point(3, 3);
    const p3 = new Point(1, 2);
    const poly = new Polygon([p, p1, p2, p3]);
    const seg = new Segment(new Point(0, 0), new Point(2, 2.5));
    // this.drawPolygon(poly.vertices);
    // this.drawSegs([seg]);
    // return;
    const mat = new Matrix3x3();
    mat.shearTfX(-seg.slope);
    const invertMat = mat.clone().invert();
    const shearSeg = new Segment(mat.apply(seg.start), mat.apply(seg.end));
    const y = shearSeg.start.y;
    const xMin =
      shearSeg.start.x < shearSeg.end.x ? shearSeg.start.x : shearSeg.end.x;
    const xMax =
      shearSeg.start.x >= shearSeg.end.x ? shearSeg.start.x : shearSeg.end.x;
    for (const edge of poly.edges) {
      const start = mat.apply(edge.start);
      const end = mat.apply(edge.end);
      if ((y <= start.y && y >= end.y) || (y <= end.y && y >= start.y)) {
        if (end.y == start.y) {
          break;
        }
        const iX =
          start.x + ((end.x - start.x) * (y - start.y)) / (end.y - start.y);
        if (iX <= xMax && iX >= xMin) {
          const iP = new Point(iX, y);
          console.log(invertMat.apply(iP));
        }
      }
    }
    for (const edge of poly.edges) {
      const ps = seg.intersect(edge, true);
      if (ps) {
        console.log(ps);
      }
    }
  }

  testRoomRel() {
    const room = this.lvl.findByRvtId('2039946');
    this.lvl.preprocessRoom(room);
  }

  testSplayTree() {
    const tree = new SplayTree<number, undefined>();
    tree.add(1);
    tree.add(2);
    console.log(tree);
  }

  testSweep() {
    const seg = new Segment(new Point(0, 0), new Point(1, 1));
    const seg1 = new Segment(new Point(0, 1), new Point(1, 0));
    const seg2 = new Segment(new Point(0.25, 0), new Point(0.75, 1));
    // const p = new Point(0.25, 0);
    //
    // console.log(seg.intersectionY(p));
    // console.log(seg1.intersectionY(p));
    // console.log(seg2.intersectionY(p));
    const sweep = new Sweep([[seg, seg1, seg2]]);
    console.log(sweep.eps);
    const result = sweep.calc();
    console.log(result);
  }

  testIsect() {
    const a = this.lvl.findByRvtId('2087366').polygon;
    const b = this.lvl.findByRvtId('2040197').polygon;
    const seg = new Segment(new Point(0, 0), new Point(1, 1));
    const seg1 = new Segment(new Point(0, 1), new Point(1, 0));
    const seg2 = new Segment(new Point(0.25, 0), new Point(0.75, 1));
    // @ts-ignore
    const inter = isect.sweep([seg, seg1, seg2], []);
    const inters = inter.run();
    console.log(inters);
    const segT = new Segment(new Point(1, 1), new Point(10, 1));
    // @ts-ignore

    // const i = this.getIntersectionXPoint(segT, 0, 0);
    // Number.NEGATIVE_INFINITY;
    // console.log(typeof i);
    // op.intersection();
  }

  // @ts-ignore
  getIntersectionXPoint(segment, xPos, yPos) {
    const dy1 = segment.from.y - yPos;
    const dy2 = yPos - segment.to.y;
    const dy = segment.to.y - segment.from.y;
    if (Math.abs(dy1) < MathUtils.Epsilon) {
      // The segment starts on the sweep line
      if (Math.abs(dy) < MathUtils.Epsilon) {
        // the segment is horizontal. Intersection is at the point
        if (xPos <= segment.from.x) return segment.from.x;
        if (xPos > segment.to.x) return segment.to.x;
        return xPos;
      }
      return segment.from.x;
    }

    const dx = segment.to.x - segment.from.x;
    let xOffset;
    if (dy1 >= dy2) {
      xOffset = dy1 * (dx / dy);
      return segment.from.x - xOffset;
    }
    xOffset = dy2 * (dx / dy);
    return segment.to.x + xOffset;
  }

  testJSTS() {
    // const w0 = this.lvl.findByRvtId("1647679");
    // const f0 = this.lvl.findByRvtId("2189472");
    // const f1 = this.lvl.findByRvtId("2189474");
    // const f2 = this.lvl.findByRvtId("1647040");
    // const offsetPlyg = JSTSUtils.iUnion(w0.polygon, f0.polygon);
    const f0 = this.lvl.findByRvtId('2187670');
    const s1 = this.lvl.findByRvtId('1647122');
    const r1 = this.lvl.findByRvtId('1698735');
    const c1 = this.lvl.findByRvtId('1650976');
    const sts = Scene2D.getInstance()
      .home.curLevel.structures.filter((item) => {
        return (
          item.visible &&
          (item.stType === StType.Column ||
            item.stType === StType.Framing ||
            item.stType === StType.Wall ||
            item.stType === StType.Window ||
            item.stType === StType.Door)
        );
      })
      .map((item) => item.polygon);
    const offsetPlyg = JSTSUtils.iDifference(f0.polygon, c1.polygon, 0);
    console.log(offsetPlyg);
    const syEdges = offsetPlyg.edges.filter(
      (item) => !s1.polygon.insideSeg(item)
    );
    this.drawSegs(syEdges);
    // this.drawPolygon(offsetPlyg.vertices);
  }

  /**
   * @author lianbo
   * @date 2020-11-26 10:56:26
   * @Description: 绘制外墙
   */
  drawRemainder() {
    MathUtils.Epsilon = ConfigStructure.accuracy;
    this.container.removeChildren();
    const sts = Scene2D.getInstance().home.curLevel.structures.filter(
      (item) => {
        return (
          item.visible &&
          (item.stType === StType.Column ||
            item.stType === StType.Framing ||
            item.stType === StType.Wall) // ||
          // item.stType === StType.Window ||
          // item.stType === StType.Door)
        );
      }
    );
    for (const startWall of sts) {
      this.findOutWallFace(startWall);
    }
    MathUtils.resetAccuracy();
  }

  findOutWallFace(startWall: Structure) {
    const strs = Scene2D.getInstance()
      .home.curLevel.quadTree.retrieve(startWall.quadData)
      .filter(
        (item: any) =>
          item.data !== startWall && item.data.stType !== StType.PCWall
      )
      .map((item: any) => item.data);
    const segs = startWall.outFace(strs);
    this.drawSegs(segs);
  }

  drawSegs(bigPath: any[]) {
    // this.container.removeChildren();
    const grp = new PIXI.Graphics();
    this.container.addChild(grp);
    // const cleanPath = PolygonClipper.pointsToShape(bigPath).clean(0.1);
    bigPath.forEach(
      (item) =>
        item &&
        GraphicsTool.drawLine(grp, item.start, item.end, {
          color: Constant.colorRandom(),
        })
    );
    this.renderTest();
  }

  findOutWallPath() {
    const startWalls = Scene2D.getInstance().home.curLevel.structures.filter(
      (item) => item.rvtId === '1647035'
    );
    let startWall!: Structure;
    if (startWalls.length > 0) startWall = startWalls[0];
    if (!startWall) return;
    const faces = startWall.wallFaces();
    let outFace: Segment;
    // for (const face of faces) {
    //   if (!startWall.roomRels.some((item) => item.collinear(face))) {
    //     outFace = face;
    //   }
    // }
  }

  testClipperOffset() {
    const p0 = new Point(0, 0);
    const p1 = new Point(100, 0);
    const p2 = new Point(100, 100);
    const p3 = new Point(0, 100);
    const result = PolygonClipper.offset([p0, p1, p2, p3], 10);
    console.log(result);
  }

  disappearInsideWall() {
    const sts = [...Scene2D.getInstance().home.curLevel.structures];
    for (const st of sts) {
      if (st.insideWall()) {
        st.visible = false;
      }
    }
  }

  public testStructures: Structure[] = [];

  findOutLine() {
    const sts = [...Scene2D.getInstance().home.curLevel.structures].filter(
      (item) => {
        return (
          item.visible &&
          (item.stType === StType.Window ||
            item.stType === StType.Wall ||
            item.stType === StType.Framing ||
            item.stType === StType.Column)
        );
      }
    );
    this.testTurfUnion(sts);
  }

  unionRoom() {
    const rooms = Scene2D.getInstance().home.curLevel.rooms;
    const roomPaths: any[][] = [];
    for (const room of rooms) {
      const allSts = room.allSts();
      const path = this.unionSts([room, ...allSts]);
      roomPaths.push(path!);
    }
    const result = PolygonClipper.unionPoint(roomPaths);
    const bigPath = maxBy(result, (o: any) => {
      return o.length;
    });
    this.drawUninoPaht(bigPath!);
  }

  unionSts(sts: any[]) {
    const polys = sts.map((item) => item.polygon.vertices);
    const result = PolygonClipper.unionPoint(polys);
    const bigPath = maxBy(result, (o: any) => {
      return o.length;
    });
    return bigPath;
  }

  drawUninoPaht(bigPath: any[]) {
    this.container.removeChildren();
    const grp = new PIXI.Graphics();
    this.container.addChild(grp);
    grp.lineStyle(3, Constant.colorMap.MidnightBlue, 1);
    // const cleanPath = PolygonClipper.pointsToShape(bigPath).clean(0.1);
    bigPath && GraphicsTool.drawPolygon(grp, bigPath);
    this.renderTest();
  }

  testTurfUnion(sts: any[]) {
    // const sts = this.testStructures;

    const polys = [];
    for (const st of sts) {
      const ves = st.topFaceGeo;
      const turfPoly = [...ves];
      polys.push(turfPoly);
    }
    const result = PolygonClipper.unionPoint(polys);
    // const bigPath = maxBy(result, (o: any) => {
    //   return o.length;
    // });
    for (const bigPath of result) {
      if (!bigPath) return;
      console.log(bigPath);
      this.container.removeChildren();
      const grp = new PIXI.Graphics();
      this.container.addChild(grp);
      grp.lineStyle(3, Constant.colorRandom(), 1);
      const cleanPath = PolygonClipper.pointsToShape(bigPath).clean(0.1);
      const grpPath = bigPath.map((item) => ConfigStructure.computePoint(item));
      bigPath && GraphicsTool.drawPolygon(grp, grpPath);
    }

    this.renderTest();
  }

  drawPolygon(grpPath: any[]) {
    const grp = new PIXI.Graphics();
    this.container.addChild(grp);
    grp.lineStyle(1, Constant.colorRandom(), 1);
    grpPath && GraphicsTool.drawPolygon(grp, grpPath);
    this.renderTest();
  }

  /**
   * @author lianbo
   * @date 2020-11-26 11:10:16
   * @Description: 实心的
   */
  drawSolidPolygon(grpPath: any[]) {
    const grp = new PIXI.Graphics();
    this.container.addChild(grp);
    grp.lineStyle(1, Constant.colorRandom(), 1);
    grp.beginFill(Constant.colorRandom(), 0.8);
    grpPath && GraphicsTool.drawPolygon(grp, grpPath);
    grp.endFill();
    this.renderTest();
  }

  testQuadTree() {
    const tree = new Quadtree({ x: 0, y: 0, width: 200, height: 200 });
    tree.insert({ x: 50, y: 50, width: 10, height: 10 });
    const result = tree.retrieve({ x: 50, y: 50, width: 10, height: 10 });
    console.log(result);
  }

  testCanvas() {
    const canvas: any = document.createElement('canvas');
    document.body.append(canvas);
    // canvas.width = ConfigStructure.maxCanvasV3.x - ConfigStructure.minCanvasV3.x;
    // canvas.height = ConfigStructure.maxCanvasV3.y - ConfigStructure.minCanvasV3.y;
    const ctx = canvas.getContext('2d');
    ctx!.strokeStyle = 'rgba(255,0,0,0.5)';
    ctx!.strokeRect(0, 0, 200, 200);
  }

  testPIXITextRoom() {
    const txt = new PIXI.Text('');
    txt.style.fontSize = 13;

    txt.anchor.set(0.5, 0.5);
    // txt.parentGroup = layerOrderGroups[LayerOrder.Camera];
    this.container.addChild(txt);
  }

  testDrawPolygon() {
    const p0 = new Point(0, 0);
    const p1 = new Point(100, 0);
    const p2 = new Point(100, 100);
    const p3 = new Point(0, 100);
    const grp = new PIXI.Graphics();
    grp.beginFill(Constant.colorMap.MidnightBlue);
    GraphicsTool.drawPolygon(grp, [p0, p1, p2, p3]);
    grp.endFill();
    this.container.addChild(grp);
    this.renderTest();
  }

  testDrawPolygonEdge() {
    const p0 = new Point(0, 0);
    const p1 = new Point(100, 0);
    const p2 = new Point(100, 100);
    const p3 = new Point(0, 100);
    const grp = new PIXI.Graphics();
    grp.lineStyle(2, Constant.colorMap.Yellow, 1);
    GraphicsTool.drawPolygon(grp, [p0, p1, p2, p3]);
    this.container.addChild(grp);
    this.renderTest();
  }

  testBoxTouch() {}

  testSegmentIntercation() {
    const s = new Segment(new Point(0, 0), new Point(1, 0));
    const s1 = new Segment(new Point(0.5, 1), new Point(0.5, 3));
    const result = s.intersect(s1);
    console.log(result);
  }

  testColorHex() {
    const re = Constant.colorHexNumber('#ffffff');
    console.log(re);
    const re1 = Constant.colorHex(0xffffff);
    console.log(re1);
  }

  test1() {
    this.testTurfUnion(this.testStructures);
    this.testStructures = [];
  }

  test2() {
    this.vv.x = this.changNum++;
  }

  public testObservalV3() {
    const tmp = new ObserveVector3(this.changNum++, 1, 1);
    // this.v3.copy(tmp);
    this.v3.z = this.changNum++;
  }

  public test_distanceToSegment() {
    const seg = new Segment(new Point(0, 0), new Point(0, -330));
    const p = new Point(0, -165);
    const result = seg.distanceToPoint(p).dis;
    console.log(result === 0);
  }

  public lineWidth(): number {
    let scale = 1.5 / Scene2D.getInstance().scale.x / 2;
    scale = !Number.isFinite(scale) ? 1 : scale;
    return scale;
    // return 1.5 / this.Scene2D.scale.x / 2;
  }

  public TestMat(): void {
    const v0 = new Vector3(400, 400, 10);
    const v1 = new Vector3(500, 400, 20);
    const v2 = new Vector3(400, 500, 30);
    const face = new GeoSurface([v0, v1, v2]);
    const mat = face.getMat();
    const invertMat = new Matrix4().getInverse(mat);
    const r0 = v0.applyMatrix4(invertMat);
    const r1 = v1.applyMatrix4(invertMat);
    const r2 = v2.applyMatrix4(invertMat);
    console.log(r0);
    console.log(r1);
    console.log(r2);
  }

  public drawTest(str: string, pos: any, color = '') {
    const style = {
      fontSize: this.lineWidth() * 15,
      fill: color ? color : '#ff0000',
    };
    const Text = new PIXI.Text(str, style);
    this.container.addChild(Text);

    Text.x = pos.x;
    Text.y = pos.y;
    this.renderTest();
  }

  public drawCircle() {
    const grp = new PIXI.Graphics();
    grp.lineStyle(0);
    grp.beginFill(0xde3249, 1);
    GraphicsTool.drawCircle(grp, Point.ZERO, 10);
    grp.endFill();
    this.container.addChild(grp);
    this.renderTest();
  }

  public Circle(): PIXI.Graphics {
    const grp = new PIXI.Graphics();
    grp.lineStyle(1);
    grp.beginFill(0xde3249, 1);
    GraphicsTool.drawCircle(grp, Point.ZERO, 1000000);
    grp.endFill();
    return grp;
  }

  public renderTest() {
    const stage = Scene2D.getInstance().getStage();
    stage.addChild(this.container);
  }

  public clearTest() {
    this.container.removeChildren();
  }

  public renderBimTest() {
    console.log('test!');
    // const revitObj = require('./lianboJson.json');
    const revitObj = require('./P000001-B0004-F0004.json');
    let firstP: any;
    if (revitObj.length > 0) {
      const geo = revitObj[0];
      if (geo.solids.length > 0) {
        const solid = geo.solids[0];
        if (solid.faces.length > 0) {
          const face = solid.faces[0];
          if (face.edges.length > 0) {
            const edges = face.edges[0];
            if (edges.length > 0) {
              const edge = edges[0];
              firstP = edge.startPoint;
            }
          }
        }
      }
    }
    // const renderSingle = function(face) {
    //
    // };
    const optimization = () => {
      for (const geo of revitObj) {
        for (const solid of geo.solids) {
          for (const edges of solid.faces) {
            for (const edgeArr of edges.edges) {
              for (const edge of edgeArr) {
                edge.startPoint = {
                  X: (edge.startPoint.X - firstP.X) / 30,
                  Y: (edge.startPoint.Y - firstP.Y) / 30,
                  Z: (edge.startPoint.Z - firstP.Z) / 30,
                };
                edge.endPoint = {
                  X: (edge.endPoint.X - firstP.X) / 30,
                  Y: (edge.endPoint.Y - firstP.Y) / 30,
                  Z: (edge.endPoint.Z - firstP.Z) / 30,
                };
              }
            }
          }
        }
      }
    };
    optimization();
    const edgesToVer = (edges: any[]) => {
      const vers: any[] = [];
      for (let i = 0; i < edges.length; i++) {
        const pointStart = this.relativeZero(edges[i].startPoint, firstP);
        const pointEnd = this.relativeZero(edges[i].endPoint, firstP);
        if (vers.length > 0) {
          if (vers[vers.length - 1].equals(pointStart)) {
            vers.push(pointEnd);
          } else if (vers[vers.length - 1].equals(pointEnd)) {
            vers.push(pointStart);
          } else {
            vers.push(pointStart);
            vers.push(pointEnd);
          }
        } else {
          vers.push(pointStart);
          vers.push(pointEnd);
        }
      }
      return vers;
    };
    const renderEdge = (edge: any[]) => {
      const result: Vector3[] = [];
      const edgesOfV3 = this.edgesToVector3(edge);
      const matrixWorld = this.edgeMatrix(edgesOfV3);
      for (const edgeItem of edgesOfV3) {
        result.push(this.worldToLocal(edgeItem.startPoint, matrixWorld));
      }
      result.forEach((item) => {
        item.x.toFixed(6);
        item.y.toFixed(6);
        item.z.toFixed(6);
      });
      const resultW: Vector3[] = [];
      for (const item of result) {
        resultW.push(this.localToWorld(item.clone(), matrixWorld));
      }
      const shape = new Shape();
      shape.moveTo(result[0].x, result[0].y);
      for (let i = 1; i < result.length; i++) {
        shape.lineTo(result[i].x, result[i].y);
      }
      const geometry = new ShapeBufferGeometry(shape);
      const matRed: THREE.MeshPhongMaterial = new MeshPhongMaterial({
        side: DoubleSide,
        color: new Color(Math.random(), Math.random(), Math.random()),
      });
      const mesh = new Mesh(geometry, matRed);
      mesh.applyMatrix(matrixWorld);
      group.add(mesh);
      // mesh.updateMatrix();
      console.log('!');
    };
    const group = new Group();
    for (const geo of revitObj) {
      for (const solid of geo.solids) {
        for (const edges of solid.faces) {
          for (const edge of edges.edges) {
            renderEdge(edge);
          }
        }
      }
    }
    group.setRotationFromEuler(new Euler(-Math.PI / 2, 0, 0));
    this.group = group;
  }

  public rotateGroup() {
    console.log(this.group.rotation);
    this.group.rotateX(this.angle);
    this.angle += 15;
  }

  public testWorldToLocal(): Vector3[] {
    // const obj = require('./lianboJson.json');
    const obj: any = null;
    const result: Vector3[] = [];
    const edgesOfV3 = this.edgesToVector3(obj.edges[0]);
    const matrixWorld = this.edgeMatrix(edgesOfV3);
    for (const edge of edgesOfV3) {
      result.push(this.worldToLocal(edge.startPoint, matrixWorld));
    }
    return result;
  }

  private relativeZero(current: any, zero: any): Vector2 {
    const v3 = new Vector2();
    v3.x = current.X - zero.X;
    v3.y = current.Y - zero.Y;
    return v3;
  }

  private edgesToVector3(edges: any): any {
    return edges.map((item: any) => {
      return {
        startPoint: new Vector3(
          item.startPoint.X,
          item.startPoint.Y,
          item.startPoint.Z
        ),
        endPoint: new Vector3(
          item.endPoint.X,
          item.endPoint.Y,
          item.endPoint.Z
        ),
      };
    });
  }

  private edgeMatrix(edges: any): Matrix4 {
    const matrix = new Matrix4();
    const firstPoint = edges[0].startPoint;
    const v0: Vector3 = edges[0].endPoint.clone().sub(firstPoint);
    const vEnd: Vector3 = edges[edges.length - 1].endPoint
      .clone()
      .sub(edges[edges.length - 1].startPoint);
    const planeNormal = v0.clone().cross(vEnd);
    matrix.setPosition(firstPoint);
    matrix.lookAt(planeNormal, new Vector3(0, 0, 0), v0);
    return matrix;
  }

  private pointsToMatrix(edges: Vector3[]): Matrix4 {
    const matrix = new Matrix4();
    const firstPoint = edges[0];
    const v0: Vector3 = edges[1].clone().sub(firstPoint);
    const vEnd: Vector3 = edges[edges.length - 1].clone().sub(edges[0]);
    const planeNormal = v0.clone().cross(vEnd);
    matrix.setPosition(firstPoint);
    matrix.lookAt(new Vector3(0, 0, 0), v0, planeNormal);
    return matrix;
  }

  private worldToLocal(v: Vector3, matrixWorld: Matrix4): Vector3 {
    const mat = new Matrix4();
    const inverse = mat.getInverse(matrixWorld);
    return v.applyMatrix4(inverse);
  }

  private localToWorld(v: Vector3, matrixWorld: Matrix4): Vector3 {
    return v.applyMatrix4(matrixWorld);
  }
}

export default new LianBoTest();
