import Room from "@/scene/Model/Home/Room";
import Model2DActive from "@/store/Model2DActive";
import ConfigStructure from "@/utils/ConfigStructure";
import Point from "@/utils/Math/geometry/Point";
import { Vector3 } from "three";
import GeoSurface from "../scene/Model/Geometry/GeoSurface";
import Home from "../scene/Model/Home/Home";
import Level from "../scene/Model/Home/Level";
import Structure from "../scene/Model/Home/Structure";
import GeometryTool from "./Math/tool/GeometryTool";

class HomeConvert {
  geo!: any[];
  eleGeo!: any[];
  eles!: any[];
  spaces!: any[];
  convert(): Home {
    const obj = require("../../devTools/博智林机器人创研中心4号楼土建模型20200619增加施工电梯3-4数据.json");
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
          columns.push(this.convertColumn(wGeo, ele));
        }
      }
    }
    return columns;
  }

  /**
   * @author lianbo
   * @date 2020-11-04 15:36:40
   * @Description: 通过几何数据实例化构建信息
   */
  convertColumn(geo: any, ele: any): Structure {
    const solid = geo.solids[0];
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
