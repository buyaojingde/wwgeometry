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
import GeoSurface from '../Model/Geometry/GeoSurface';

class THREEUtils {
  public buildMesh(loop: any[], innerLoops: any[]): Mesh {
    const vertices = loop.map((item) => new Vector3(item.x, item.y, item.z));
    const holes = innerLoops.map((item) =>
      item.map((vertex: any) => new Vector3(vertex.x, vertex.y, vertex.z))
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
