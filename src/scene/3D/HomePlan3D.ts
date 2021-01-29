import { Group } from 'three';
import BimElement3DLayer from './BimElement3DLayer';

export default class HomePlan3D {
  public container: Group;
  private _scene: any;
  private _bimEleLayer!: BimElement3DLayer;
  private _layers: object = {};

  constructor(scene: any) {
    this.container = new Group();
    this._scene = scene;
    this.createBimLayer();
  }

  private createBimLayer() {
    this._bimEleLayer = new BimElement3DLayer(
      this._scene.home.curLevel.allElements
    );
    Object.defineProperty(this._layers, 'bimEles', {
      value: this._bimEleLayer,
      enumerable: true,
    });
    this._bimEleLayer.attachContainer(this.container);
  }

  public load() {}
  public render() {}
  public destroy() {}
}
