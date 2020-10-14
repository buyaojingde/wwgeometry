import Home from '../scene/Model/Home/Home';
import Column from '../scene/Model/Home/Column';
import GeoSurface from '../scene/Model/Geometry/GeoSurface';
import { Vector3 } from 'three';
import Level from '../scene/Model/Home/Level';
import VectorTool from './Math/tool/vectorTool';

class HomeConvert {

  geo: any[];
  eleGeo: any[];
  eles: any[];

  convert(): Home {
    const obj = require('../../devTools/博智林机器人创研中心4号楼土建模型20200619增加施工电梯3-4数据.json');
    const home = new Home();
    this.geo = obj.mGeometries;
    this.eleGeo = obj.mElementGeorelationships;
    this.eles = obj.mElems;
    const columns = this.findColumn();
    const lvl = new Level();
    home.levels = [];
    lvl.columns.push(...columns);
    home.levels.push(lvl);
    return home;
  }

  findColumn(): Column[] {
    const columns: Column[] = [];
    for (const ele of this.eles) {
      if (ele.builtInCategory !== 'OST_Floors'
        && ele.builtInCategory !== 'OST_Doors'
        && ele.builtInCategory !== 'OST_Windows'
      ) {
        const wGeoId = this.eleGeo.find(item => item.elementId === ele.id);
        const wGeo = this.geo.find(item => item.id === wGeoId.geomIDs[0]);
        if (wGeo.solids.length > 0) {
          columns.push(this.convertColumn(wGeo));
        }
      }
    }
    return columns;
  }

  private zeroV: Vector3;

  smallVertex(origin: any): any {
    if (!this.zeroV) {
      this.zeroV = new Vector3(origin.x, origin.y, origin.z);
    }
    return {
      x: (origin.x - this.zeroV.x) / 10,
      y: (origin.y - this.zeroV.y) / 10,
      z: (origin.z - this.zeroV.z) / 10,
    };
  }

  convertColumn(geo: any): Column {
    const solid = geo.solids[0];
    let topFace: GeoSurface;
    let maxHeight = Number.NEGATIVE_INFINITY;
    for (const face of solid.faces) {
      const points: Vector3[] = [];
      for (const rVertex of face.outLoop[0]) {
        const smallV = this.smallVertex(rVertex);
        points.push(new Vector3(smallV.x, smallV.z, smallV.y));
      }
      const surface = new GeoSurface(points);
      if (surface.isHorizontal) {
        if (surface.height > maxHeight) {
          maxHeight = surface.height;
          topFace = surface;
        }
      }
    }
    const v2d = topFace.points.map(item => VectorTool.vector3toVector2(item));
    const column = new Column();
    column.boundingPoints = v2d;
    column.geo = geo;
    return column;
  }
}

export default new HomeConvert();
