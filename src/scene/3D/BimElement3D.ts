// import * as THREE from 'three';
import {
  BufferGeometryUtils,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
} from 'three';
import ConfigStructure from '../../utils/ConfigStructure';
import Obstacle from '../Model/Home/Obstacle';
import Room from '../Model/Home/Room';
import Structure, { StType } from '../Model/Home/Structure';
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
      const geoList = [];
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
          geoList.push(THREEUtils.buildGeometry(canvasLoop, canvasInner));
        }
      }
      const mergeGeos = THREEUtils.mergeBufferGeometry(geoList);

      const matRed: MeshBasicMaterial = new MeshBasicMaterial({
        side: DoubleSide,
        color: this.colorAlpha,
      });
      const mesh = new Mesh(mergeGeos, matRed);
      this.add(mesh);
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
      this.add(THREEUtils.buildMesh(canvasBoundary, [], this.colorAlpha));
    }
  }

  get cType(): string {
    if (this.model instanceof Structure) {
      return this.model.stType;
    }
    return '';
  }

  public get colorAlpha(): string {
    if (this.model.isEdit) {
      return '#ff0000';
    }
    if (this.model instanceof Obstacle) {
      return '#ffffff';
    }
    let ca = '#8a8a8a';
    switch (this.cType) {
      case StType.Wall:
        ca = '#FFD700';
        break;
      case StType.PCWall:
        ca = '#FF5F12';
        break;
      case StType.Framing:
        ca = '#2e564b';
        break;
      case StType.Column:
        ca = '#000000';
        break;
      case StType.Door:
        ca = '#329908';
        break;
      case StType.Window:
        ca = '#0f719d';
        break;
    }
    return ca;
  }
}
