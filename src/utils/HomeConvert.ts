import { Vector3 } from 'three';
import GeoSurface from '../scene/Model/Geometry/GeoSurface';
import Home from '../scene/Model/Home/Home';
import Level from '../scene/Model/Home/Level';
import Obstacle from '../scene/Model/Home/Obstacle';
import ObstacleFactory from '../scene/Model/Home/ObstacleFactory';
import Room from '../scene/Model/Home/Room';
import Structure from '../scene/Model/Home/Structure';
import Model2DActive from '../store/Model2DActive';
import ConfigStructure from './ConfigStructure';
import Point from './Math/geometry/Point';
import Polygon from './Math/geometry/Polygon';
import MathUtils from './Math/math/MathUtils';
import GeometryTool from './Math/tool/GeometryTool';

class HomeConvert {
  home: any;
  bimMapCode = '';
  geo!: any[];
  eleGeo!: any[];
  eles!: any[];
  spaces!: any[];
  itemCount = 2000; //最大渲染数量
  obstacles!: any[];
  extractData(obj: any): Home {
    if (this.home) return this.home;
    this.bimMapCode = obj.bimMapCode;
    this.editedHistory = obj.editedHistory;
    this.geo = obj.geometries;
    this.eleGeo = obj.elementGeometryRels;
    this.eles = obj.elements;
    this.spaces = obj.spaces;
    this.obstacles = this.editedHistory.obstacles;
    this.setElements();
    this.home = this.generateHome();
    return this.home;
  }

  generateHome() {
    const home = new Home();
    this.calcZeroAndBound();
    const structures = this.generateStructure();
    const lvl = new Level();
    lvl.bimMapCode = this.bimMapCode;
    lvl.hiddenElementCodeList = this.editedHistory.hiddenElementCodeList;
    lvl.initQuadTree();
    home.levels = [];
    let stCount = 1;
    for (const st of structures) {
      if (stCount > this.itemCount) break;
      lvl.addStructure(st);
      stCount++;
    }
    const rooms = this.generateRoom();
    for (const room of rooms) {
      if (stCount > this.itemCount) break;
      lvl.addRoom(room);
      stCount++;
    }

    const obstacles = this.generateObstacles();
    for (const obstacle of obstacles) {
      if (stCount > this.itemCount) break;
      lvl.addObstacle(obstacle);
    }
    console.log('构建数量' + (stCount - 1));
    home.levels.push(lvl);
    this.gc();
    return home;
  }

  gc() {
    this.elements = [];
    this.spaces = [];
    this.eles = [];
    this.eleGeo = [];
    this.geo = [];
    this.editedHistory = null;
  }

  /**
   * @author lianbo
   * @date 2020-12-21 14:23:12
   * @Description: 本地数据转线上数据结构
   */
  setElements() {
    this.elements = [];
    for (const ele of this.eles) {
      const wGeoId = this.eleGeo.find((item) => item.elementId === ele.id);
      const wGeo = this.geo.filter((item) => item.id === wGeoId.geomIDs[0]);
      const elementItem = { element: ele, geometrys: wGeo };
      // if (this.hiddenElement.hiddenElementCodeList.includes(ele.code)) {
      //   console.log(elementItem);
      // }
      this.elements.push(elementItem);
    }
  }

  generateRoom() {
    const rooms: Room[] = [];
    for (const room of this.spaces) {
      if (room.spaceType === 'Room') {
        if (room.boundary.length > 0) {
          const roomBoundary: Point[] = [];
          Array.from(room.boundary).forEach((item) =>
            roomBoundary.push(ConfigStructure.computePoint(item))
          );
          const roomData = new Room(roomBoundary);
          roomData.rvtId = room.code.split('-').pop();
          roomData.setSpaceData(room);
          rooms.push(roomData);
        }
      }
    }
    return rooms;
  }

  generateRoom2() {
    const rooms: Room[] = [];
    for (const room of this.spaces) {
      if (room.boundary.length > 0) {
        const roomBoundary: Point[] = [];
        Array.from(room.boundary).forEach((item) =>
          roomBoundary.push(ConfigStructure.computePoint(item))
        );
        const roomData = new Room(roomBoundary);
        roomData.rvtId = room.roomNo;
        roomData.setSpaceData(room);
        rooms.push(roomData);
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
        const x = v.x !== undefined ? v.x : v.X;
        const y = v.y !== undefined ? v.y : v.Y;
        const z = v.z !== undefined ? v.z : v.Z;
        if (x < minX) {
          minX = x;
        }
        if (y < minY) {
          minY = y;
        }
        if (x > maxX) {
          maxX = x;
        }
        if (y > maxY) {
          maxY = y;
        }
        if (z < minZ) {
          minZ = z;
        }
        if (z > maxZ) {
          maxZ = z;
        }
      }
    };
    calcSurround();
    ConfigStructure.maxGeoV3 = { x: maxX, y: minY, z: maxZ }; // Revit的Z轴是向上的
    ConfigStructure.minGeoV3 = { x: minX, y: maxY, z: minZ };
    ConfigStructure.zeroPoint.x = (maxX + minX) / 2;
    ConfigStructure.zeroPoint.y = (maxY + minY) / 2;
    ConfigStructure.zeroPoint.z = minZ;

    Model2DActive.subjectVec3.x = ConfigStructure.zeroPoint.x;
    Model2DActive.subjectVec3.y = ConfigStructure.zeroPoint.y;
    Model2DActive.subjectVec3.z = 0;
  }

  generateStructure(): Structure[] {
    const columns: Structure[] = [];
    for (const ele of this.elements) {
      // if (
      // ele.element.builtInCategory === "OST_Doors" &&
      // ele.element.builtInCategory === "OST_Windows" &&
      //   ele.element.builtInCategory === 'OST_Floors'
      // ) {
      //   continue;
      // }
      const wGeo = ele.geometrys[0];
      if (wGeo.solids.length > 0) {
        const st = this.convertColumn(wGeo, ele.element);
        if (st) {
          columns.push(st);
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
    let topFaceGeo: any;
    const mirrorHorizontal: any[] = [];
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
          topFaceGeo = face.outLoop[0]; // 取到顶面的原始数据
          mirrorHorizontal.push(topFaceGeo);
        }
      }
    }
    if (!topFace) return null;
    const v2ds = topFace.points.map((item) =>
      GeometryTool.vector3toVector2(item)
    );
    structure.boundary = v2ds.map((item) => new Point(item.x, -item.y));
    const mirrorFaces = this.filterMirrorFace(mirrorHorizontal, topFaceGeo);
    structure.setGeoEle({ ele, geo, solid, topFaceGeo, mirrorFaces });
    this.cleanUpFaces(structure);
    structure.rvtId = ele.revitId.toString();
    return structure;
  }

  private editedHistory: any;
  private elements: any[] = [];

  public adapt(data: any) {
    this.elements = data.elements;
    this.geo = this.elements.map((item) => item.geometrys[0]);
    this.spaces = data.roomNOs;
    this.editedHistory = data.hiddenElement;
    return this.generateHome();
  }

  private filterMirrorFace(mirrorHorizontal: any[], topFaceGeo: any): any[] {
    const mirrorFaces: any[] = [];
    for (const element of mirrorHorizontal) {
      if (element === topFaceGeo) continue;
      if (topFaceGeo.length !== element.length) continue;
      const mirrorIndices: any[] = [];
      for (let i = 0; i < topFaceGeo.length; i++) {
        let mirrorVertexIndex = -1;
        const topVertex = topFaceGeo[i];
        for (let j = 0; j < element.length; j++) {
          const mirrorVertex = element[j];
          if (
            topVertex.X === mirrorVertex.X &&
            topVertex.Y === mirrorVertex.Y
          ) {
            mirrorVertexIndex = j;
          }
        }
        if (mirrorVertexIndex !== -1) {
          mirrorIndices.push({ topIndex: i, mirrorIndex: mirrorVertexIndex });
        } else {
          break;
        }
      }
      if (mirrorIndices.length === topFaceGeo.length) {
        mirrorFaces.push({ mirrorFace: element, mirrorIndices: mirrorIndices });
      }
    }
    return mirrorFaces;
  }

  /**
   * @author lianbo
   * @date 2021-01-11 19:28:31
   * @Description: 为了改变顶点数据的方便，将face上重复的顶点都指向同一份数据，这里用顶面数据和底面数据描述
   */
  private cleanUpFaces(structure: Structure) {
    const topFace = structure.geoEle.topFaceGeo;
    const mirrorFaces = structure.geoEle.mirrorFaces.map(
      (item: any) => item.mirrorFace
    );

    const remainderFaces = [];
    for (const face of structure.geoEle.solid.faces) {
      const cleanUpFace = face.outLoop[0];
      if (cleanUpFace === topFace) continue;
      if (mirrorFaces.includes(cleanUpFace)) continue;
      remainderFaces.push(face.outLoop[0]);
    }

    for (const remainderFace of remainderFaces) {
      for (let i = 0; i < remainderFace.length; i++) {
        const vertex = remainderFace[i];
        const find = topFace.find(
          (item: any) =>
            item.X === vertex.X && item.Y === vertex.Y && item.Z === vertex.Z
        );
        if (find) {
          remainderFace[i] = find;
        }
        for (const mirr of mirrorFaces) {
          const find = mirr.find(
            (item: any) =>
              item.X === vertex.X && item.Y === vertex.Y && item.Z === vertex.Z
          );
          if (find) {
            remainderFace[i] = find;
          }
        }
      }
    }
  }

  private generateObstacles() {
    const obs: Obstacle[] = [];
    for (const obj of this.obstacles) {
      const ob = this.generateObstacle(obj);
      obs.push(ob);
    }
    return obs;
  }

  private generateObstacle(obj: any): Obstacle {
    const solid = obj.solids[0];
    const ob: Obstacle = ObstacleFactory.createObstacleFrom(solid);
    const topFace = solid.faces[0].outLoop[0];
    const bottomFace = solid.faces[5].outLoop[0];
    const boxData = topFace.map((item: any) => {
      return ConfigStructure.computePoint(item);
    });
    const boundary = boxData;
    const zPlane = bottomFace[0].Z;
    const height = topFace[0].Z - zPlane;
    const param = {
      boundary: boundary,
      height: height,
      zPlane: zPlane,
    };
    ob.setParams(param);
    return ob;
  }
}

export default new HomeConvert();
