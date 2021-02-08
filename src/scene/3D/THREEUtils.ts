import * as THREE from 'three';
require('../../utils/threeExample/BufferGeometryUtils');
import {
  BufferGeometry,
  Color,
  DoubleSide,
  Geometry,
  Mesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  Path,
  Quaternion,
  Shape,
  ShapeBufferGeometry,
  Vector3,
} from 'three';
import GeometryFactory from '../../utils/Math/geometry/GeometryFactory';
import GeoSurface from '../Model/Geometry/GeoSurface';

class THREEUtils {
  public buildMesh(loop: any[], innerLoops: any[], colorStr = '#000000'): Mesh {
    const color: Color = new Color(colorStr);
    const vertices = loop.map((item) => GeometryFactory.createVector3(item));
    const holes = innerLoops.map((item) =>
      item.map((vertex: any) => GeometryFactory.createVector3(vertex))
    );
    const surface = new GeoSurface(vertices);
    const shape = new Shape(surface.toLocalVertices(vertices));
    const holesLocal = holes.map((hole) => surface.toLocalVertices(hole));
    const paths: Path[] = holesLocal.map((hl) => new Path(hl));
    paths.forEach((path) => shape.holes.push(path));
    const geo = new ShapeBufferGeometry(shape);
    const matRed: MeshBasicMaterial = new MeshBasicMaterial({
      color: color,
    });
    const mesh = new Mesh(geo, matRed);
    mesh.applyMatrix(surface.mat);
    return mesh;
  }

  public buildGeometry(loop: any[], innerLoops: any[]): ShapeBufferGeometry {
    const vertices = loop.map((item) => GeometryFactory.createVector3(item));
    const holes = innerLoops.map((item) =>
      item.map((vertex: any) => GeometryFactory.createVector3(vertex))
    );
    const surface = new GeoSurface(vertices);
    const shape = new Shape(surface.toLocalVertices(vertices));
    const holesLocal = holes.map((hole) => surface.toLocalVertices(hole));
    const paths: Path[] = holesLocal.map((hl) => new Path(hl));
    paths.forEach((path) => shape.holes.push(path));
    const geo = new ShapeBufferGeometry(shape);

    geo.applyMatrix(surface.mat);
    return geo;
  }

  public mergeBufferGeometry(geos: BufferGeometry[]): BufferGeometry {
    return THREE.BufferGeometryUtils.mergeBufferGeometries(geos);
  }
}
export default new THREEUtils();
