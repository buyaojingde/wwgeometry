import { PerspectiveCamera } from 'three';
// @ts-ignore
import { OrbitCtrl } from './OrbitCtrl.js';

export default class CameraControlManager {
  private _scene3d: any;
  private _activeCamera: null;
  private _canvas: any;
  private _orbitCamera!: PerspectiveCamera;
  private _orbitCtrl!: OrbitCtrl;
  constructor(scene3d: any, canvas: any) {
    this._activeCamera = null;
    this._canvas = canvas;
    this._scene3d = scene3d;
    this.initCameraControls();
  }

  private initCameraControls() {
    this.initOrbitCtrl();
  }

  private initOrbitCtrl() {
    this._orbitCamera = new PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      10,
      10000
    );
    this._orbitCtrl = new OrbitCtrl(this._orbitCamera, this._canvas);
  }
}
