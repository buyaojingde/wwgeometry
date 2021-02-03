import {
  Color,
  DoubleSide,
  Mesh,
  MeshPhongMaterial,
  Path,
  Shape,
  ShapeBufferGeometry,
  Vector3,
} from 'three';
import GeometryFactory from '../../utils/Math/geometry/GeometryFactory';
import GeoSurface from '../Model/Geometry/GeoSurface';

class THREEUtils {
  public buildMesh(loop: any[], innerLoops: any[]): Mesh {
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
    const matRed: THREE.MeshPhongMaterial = new MeshPhongMaterial({
      side: DoubleSide,
      color: new Color(Math.random(), Math.random(), Math.random()),
    });
    const mesh = new Mesh(geo, matRed);
    mesh.applyMatrix(surface.mat);
    return mesh;
  }
}
export default new THREEUtils();
