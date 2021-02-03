import { Group } from 'three';
import ConfigStructure from '../../utils/ConfigStructure';
import Obstacle from '../Model/Home/Obstacle';
import Room from '../Model/Home/Room';
import Structure from '../Model/Home/Structure';
import THREEUtils from './THREEUtils';

export default class BimElement3D extends Group {
  public model: Structure | Room | Obstacle;
  constructor(bimSt: any) {
    super();
    this.model = bimSt;
    this.drawModel3D();
  }
  private _disposeArr: Array<() => void> = [];

  public destroy(...args: any[]) {
    this.traverse((obj: any) => {
      if (obj.type === 'Mesh') {
        obj.geometry.dispose();
        obj.material.dispose();
      }
    });
    this._disposeArr.forEach((dispose) => dispose());
    this._disposeArr = [];
  }

  renderWith(grp: Group) {
    grp.add(this);
  }

  private drawModel3D() {
    const drawMeshSolid = (solid: any) => {
      const faces = solid.faces;
      for (const face of faces) {
        const outLoop = face.outLoop;
        const innerLoop = face.innerLoop;
        for (const loop of outLoop) {
          const canvasLoop = loop.map((item: any) =>
            ConfigStructure.toCanvas(item)
          );
          const canvasInner = innerLoop.map((loops: any) => {
            return loops.map((item: any) => ConfigStructure.toCanvas(item));
          });
          this.add(THREEUtils.buildMesh(canvasLoop, canvasInner));
        }
      }
    };
    if (this.model instanceof Obstacle) {
      const solid = this.model.buildData().solids[0];
      drawMeshSolid(solid);
    }
    if (this.model instanceof Structure) {
      const solid = this.model.geoEle.solid;
      drawMeshSolid(solid);
    }
    if (this.model instanceof Room) {
      const canvasBoundary = this.model.spaceData.boundary.map((item: any) =>
        ConfigStructure.toCanvas(item)
      );
      this.add(THREEUtils.buildMesh(canvasBoundary, []));
    }
  }
}
