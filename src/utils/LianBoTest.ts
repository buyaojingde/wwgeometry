import {
  AxesHelper,
  BoxBufferGeometry,
  BoxGeometry,
  Color,
  DoubleSide,
  Euler,
  Group,
  Matrix4,
  Mesh,
  MeshPhongMaterial,
  Shape,
  ShapeBufferGeometry,
  ShapeGeometry,
  Vector2,
  Vector3,
} from "three";
import Scene2D from "../scene/2D";
import GeoSurface from "../scene/Model/Geometry/GeoSurface";
import GraphicsTool from "../scene/2D/Utils/GraphicsTool";
import Vector2D from "../scene/Model/Geometry/Vector2D";
import Polygon2D from "../scene/Model/Geometry/Polygon2D";
import { autorun, computed, observable } from "mobx";

class LianBoTest {
  public constructor() {
    window["TEST"] = () => {
      this.testMain();
    };
  }

  public init() {}

  testMain() {
    console.log("result");
  }

  public static container: PIXI.Container = new PIXI.Container();

  public static lineWidth(): number {
    let scale = 1.5 / Scene2D.getInstance().scale.x / 2;
    scale = !Number.isFinite(scale) ? 1 : scale;
    return scale;
    // return 1.5 / this.Scene2D.scale.x / 2;
  }

  public static TestMat(): void {
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

  public static drawTest(str: string, pos: any, color: string = null) {
    const style = {
      fontSize: LianBoTest.lineWidth() * 15,
      fill: color ? color : "#ff0000",
    };
    const Text = new PIXI.Text(str, style);
    this.container.addChild(Text);

    Text.x = pos.x;
    Text.y = pos.y;
    this.renderTest();
  }

  public static drawCircle() {
    const grp = new PIXI.Graphics();
    grp.lineStyle(0);
    grp.beginFill(0xde3249, 1);
    GraphicsTool.drawCircle(grp, Vector2D.ORIGIN_V2D, 10);
    grp.endFill();
    this.container.addChild(grp);
    this.renderTest();
  }

  public static renderTest() {
    const stage = Scene2D.getInstance().getStage();
    stage.addChild(this.container);
  }

  public static clearTest() {
    this.container.removeChildren();
  }

  public static renderBimTest() {
    console.log("test!");
    // const revitObj = require('./lianboJson.json');
    const revitObj = require("./P000001-B0004-F0004.json");
    let firstP = null;
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
    const edgesToVer = (edges) => {
      const vers = [];
      for (let i = 0; i < edges.length; i++) {
        const pointStart = LianBoTest.relativeZero(edges[i].startPoint, firstP);
        const pointEnd = LianBoTest.relativeZero(edges[i].endPoint, firstP);
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
    const renderEdge = (edge) => {
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
      const matRed: MeshPhongMaterial = new MeshPhongMaterial({
        side: DoubleSide,
        color: new Color(Math.random(), Math.random(), Math.random()),
      });
      const mesh = new Mesh(geometry, matRed);
      mesh.applyMatrix(matrixWorld);
      group.add(mesh);
      // mesh.updateMatrix();
      console.log("!");
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

  public static group: Group;
  public static angle = 15;

  public static rotateGroup() {
    console.log(this.group.rotation);
    this.group.rotateX(this.angle);
    this.angle += 15;
  }

  private static relativeZero(current: any, zero: any): Vector2 {
    const v3 = new Vector2();
    v3.x = current.X - zero.X;
    v3.y = current.Y - zero.Y;
    return v3;
  }

  private static edgesToVector3(edges: any): any {
    return edges.map((item) => {
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

  private static edgeMatrix(edges: any): Matrix4 {
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

  private static pointsToMatrix(edges: Vector3[]): Matrix4 {
    const matrix = new Matrix4();
    const firstPoint = edges[0];
    const v0: Vector3 = edges[1].clone().sub(firstPoint);
    const vEnd: Vector3 = edges[edges.length - 1].clone().sub(edges[0]);
    const planeNormal = v0.clone().cross(vEnd);
    matrix.setPosition(firstPoint);
    matrix.lookAt(new Vector3(0, 0, 0), v0, planeNormal);
    return matrix;
  }

  private static worldToLocal(v: Vector3, matrixWorld: Matrix4): Vector3 {
    const mat = new Matrix4();
    const inverse = mat.getInverse(matrixWorld);
    return v.applyMatrix4(inverse);
  }

  private static localToWorld(v: Vector3, matrixWorld: Matrix4): Vector3 {
    return v.applyMatrix4(matrixWorld);
  }

  public static testWorldToLocal(): Vector3[] {
    const obj = require("./lianboJson.json");
    const result: Vector3[] = [];
    const edgesOfV3 = this.edgesToVector3(obj.edges[0]);
    const matrixWorld = this.edgeMatrix(edgesOfV3);
    for (const edge of edgesOfV3) {
      result.push(this.worldToLocal(edge.startPoint, matrixWorld));
    }
    return result;
  }
}
export default new LianBoTest();
