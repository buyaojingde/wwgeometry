import { Vector3 } from "three";
import JSTSUtils from "../scene/2D/Utils/JSTSUtils";
import GeoSurface from "../scene/Model/Geometry/GeoSurface";
import Home from "../scene/Model/Home/Home";
import Level from "../scene/Model/Home/Level";
import Room from "../scene/Model/Home/Room";
import Structure from "../scene/Model/Home/Structure";
import Model2DActive from "../store/Model2DActive";
import ConfigStructure from "./ConfigStructure";
import Point from "./Math/geometry/Point";
import Polygon from "./Math/geometry/Polygon";
import MathUtils from "./Math/math/MathUtils";
import GeometryTool from "./Math/tool/GeometryTool";

class HomeConvert {
  geo!: any[];
  eleGeo!: any[];
  eles!: any[];
  spaces!: any[];
  convert(): Home {
    const obj = require("../../devTools/博智林机器人创研中心6号楼土建6F.json");
    const home = new Home();
    this.geo = obj.geometries;
    this.eleGeo = obj.elementGeometryRels;
    this.eles = obj.elems;
    this.spaces = obj.spaces;
    this.calcZeroAndBound();
    const structures = this.findColumn();
    const lvl = new Level();
    lvl.initQuadTree();
    home.levels = [];
    structures.forEach((item) => lvl.addStructure(item));
    const rooms = this.generateRoom();
    rooms.forEach((item) => lvl.addRoom(item));
    home.levels.push(lvl);
    return home;
  }

  generateRoom() {
    const rooms: Room[] = [];
    for (const room of this.spaces) {
      if (room.spaceType === "Room") {
        if (room.boundary.length > 0) {
          const roomData = new Room();
          roomData.rvtName = room.name;
          roomData.rvtId = room.code.split("-").pop();
          const roomBoundary: Point[] = [];
          Array.from(room.boundary).forEach((item) =>
            roomBoundary.push(ConfigStructure.computePoint(item))
          );
          roomData.boundary = roomBoundary;
          roomData.topFaceGeo = room.boundary;
          rooms.push(roomData);
        }
      }
    }
    return rooms;
  }

  /**
   * @author lianbo
   * @date 2020-11-17 10:01:54
   * @Description: 计算包围空间
   */
  calcZeroAndBound() {
    let minX = Number.MAX_VALUE,
      maxX = Number.MIN_VALUE,
      minY = Number.MAX_VALUE,
      maxY = Number.MIN_VALUE,
      minZ = Number.MAX_VALUE,
      maxZ = Number.MIN_VALUE;
    const allGeo: any[] = [];
    for (const geo of this.geo) {
      const solid = geo.solids[0];
      if (!solid) continue;
      for (const face of solid.faces) {
        for (const rVertex of face.outLoop[0]) {
          allGeo.push(rVertex);
        }
      }
    }
    for (const room of this.spaces) {
      if (room.boundary) {
        for (const bV of room.boundary) {
          allGeo.push(bV);
        }
      }
    }
    const calcSurround = () => {
      for (const v of allGeo) {
        if (v.x < minX) {
          minX = v.x;
        }
        if (v.y < minY) {
          minY = v.y;
        }
        if (v.x > maxX) {
          maxX = v.x;
        }
        if (v.y > maxY) {
          maxY = v.y;
        }
        if (v.z < minZ) {
          minZ = v.z;
        }
        if (v.z > maxZ) {
          maxZ = v.z;
        }
      }
    };
    calcSurround();
    ConfigStructure.maxGeoV3 = { x: maxX, y: minY, z: maxZ }; // Revit的Y轴是向上的
    ConfigStructure.minGeoV3 = { x: minX, y: maxY, z: minZ };
    ConfigStructure.zeroPoint.x = (maxX + minX) / 2;
    ConfigStructure.zeroPoint.y = (maxY + minY) / 2;
    ConfigStructure.zeroPoint.z = (maxZ + minZ) / 2;

    Model2DActive.subjectVec3.x = ConfigStructure.zeroPoint.x;
    Model2DActive.subjectVec3.y = ConfigStructure.zeroPoint.y;
    Model2DActive.subjectVec3.z = 0;
  }

  findColumn(): Structure[] {
    const columns: Structure[] = [];
    for (const ele of this.eles) {
      if (
        // ele.builtInCategory !== "OST_Doors" &&
        // ele.builtInCategory !== "OST_Windows" &&
        ele.builtInCategory !== "OST_Floors"
      ) {
        const wGeoId = this.eleGeo.find((item) => item.elementId === ele.id);
        const wGeo = this.geo.find((item) => item.id === wGeoId.geomIDs[0]);
        if (wGeo.solids.length > 0) {
          const st = this.convertColumn(wGeo, ele);
          if (st) {
            columns.push(st);
          }
        }
      }
    }
    return columns;
  }

  /**
   * @author lianbo
   * @date 2020-12-03 17:48:19
   * @Description: 找solid的在XY平面的投影面
   */
  findSolidProjection(faces: any[]): Polygon | null {
    const maxHeight = Number.NEGATIVE_INFINITY;
    const topFace = null;
    const polys: Polygon[] = [];
    for (const face of faces) {
      for (const outLoop of face.outLoop) {
        if (!this.isVertical(outLoop)) {
          const ps: Point[] = [];
          for (const v of outLoop) {
            const smallV = ConfigStructure.smallVertex(v);
            const p = GeometryTool.vector3toVector2Revit(smallV); // 删除坐标
            ps.push(new Point(p.x, -p.y));
          }
          const plg = new Polygon(ps);
          polys.push(plg);
        }
      }
    }
    if (polys.length === 1) return polys[0];
    if (polys.length < 1) return null;
    // return JSTSUtils.iUnion(polys[0], polys[1]);
    return polys[0];
  }

  isHorizontal(face: any[]): boolean {
    if (face.length < 1) return false;
    const zCoordinate = face[0].Z;
    return face.every((item) => MathUtils.equal(zCoordinate, item.Z));
  }

  /**
   * @author lianbo
   * @date 2020-12-03 19:25:25
   * @Description: 垂直于XZ平面的面
   */
  isVertical(face: any[]): boolean {
    const nor = GeometryTool.normalized(
      GeometryTool.normal(face.map((item) => GeometryTool.convert(item)))
    );
    if (!nor) return false;
    const verticalV = { x: 0, y: 0, z: 1 };
    if (MathUtils.equalZero(GeometryTool.dot(nor, verticalV))) {
      return true;
    }
    return false;
  }

  /**
   * @author lianbo
   * @date 2020-11-04 15:36:40
   * @Description: 通过几何数据实例化构建信息
   */
  convertColumn(geo: any, ele: any): Structure | null {
    let solid = null;

    for (const s of geo.solids) {
      if (s.faces.length > 0) {
        solid = s;
      }
    }
    if (!solid) return null;
    let topFace!: GeoSurface;
    let maxHeight = Number.NEGATIVE_INFINITY;
    const structure: Structure = new Structure();
    for (const face of solid.faces) {
      const points: Vector3[] = [];
      for (const rVertex of face.outLoop[0]) {
        // 当前只考虑第一个外圈的场景，多个外圈暂时不考虑
        const smallV = ConfigStructure.smallVertex(rVertex); // 取中点为原点进行转换
        points.push(new Vector3(smallV.x, smallV.z, smallV.y)); // Revit坐标系中的Z轴向上的
      }
      const surface: GeoSurface = new GeoSurface(points);
      if (surface.isHorizontal) {
        if (surface.height > maxHeight) {
          maxHeight = surface.height;
          topFace = surface;
          structure.topFaceGeo = face.outLoop[0]; // 取到顶面的原始数据
        }
      }
    }
    if (!topFace) return null;
    const v2ds = topFace.points.map((item) =>
      GeometryTool.vector3toVector2(item)
    );
    structure.boundingPoints = v2ds.map((item) => new Point(item.x, -item.y));
    structure.geo = geo;
    structure.ele = ele;
    structure.rvtId = ele.revitId.toString();
    return structure;
  }
}

export default new HomeConvert();
