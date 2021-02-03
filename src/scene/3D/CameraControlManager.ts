import { computed, observe, reaction } from 'mobx';
import {
  Math as MathT,
  OrthographicCamera,
  PerspectiveCamera,
  Spherical,
  Vector3,
} from 'three';
import CameraData, { ViewType } from '../../store/CameraData';
// @ts-ignore
import OrbitControls from './OrbitControls';
// @ts-ignore
import RoamControls from './RoamControls';
import Scene3D from './scene3d';
const CAMERA_MIN_DISTANCE = 50;
const CAMERA_MAX_DISTANCE = 3500;
const LEVEL_HEIGHT = 280;
export default class CameraControlManager {
  /** 俯视图渲染正交相交 */
  private _orthographicCamera!: OrthographicCamera;
  private _orthographicCtrl: OrbitControls;

  /** 3D场景相机控制器 */
  private _orbitControl: OrbitControls;
  private _orbitCamera!: PerspectiveCamera;

  /** 漫游场景相机控制器 */
  // private _roamContrl: RoamControls;
  private _roamCamera!: PerspectiveCamera;

  /** 当前相机 */
  private _activeCamera: any;

  /** 当前场景Scene */
  private _scene3d: Scene3D;

  /** 3D场景画布Canvas元素 */
  private _canvas: any;

  private disposeArr: any = [];
  private _enable = false;

  public get enable() {
    return this._enable;
  }

  public set enable(b: boolean) {
    this._enable = b;
    if (!b) {
      this._orbitControl.enabled = false;
      // this._roamContrl.enabled = false;

      this._orthographicCtrl.enable = false;
    } else {
      if (this._viewType === ViewType.Roam) {
        // this._roamContrl.enabled = true;
      } else if (this._viewType === ViewType.ThreeD) {
        this._orbitControl.enabled = true;
      } else if (this._viewType === ViewType.Orthographic) {
        this._orthographicCtrl.enable = true;
      }
    }
  }

  /** 当前视图类型 */
  @computed
  private get _viewType() {
    return CameraData.viewType;
  }

  constructor(scene3d: Scene3D, canvas: any) {
    this._activeCamera = null;
    this._canvas = canvas;
    this._scene3d = scene3d;
    this.initCameraControls();
  }

  protected initCameraControls() {
    this.initOrthographicCtrl();
    this.initOribtCtrl();
    // this.initRoamCtrl();

    setTimeout(() => this.update(), 2);
    this._orbitControl.enabled = false;
    // this._roamContrl.enabled = false;
    this._orthographicCtrl.enable = false;

    this._orbitControl.enabled = true;
    this.activeCamera = this._orbitCamera;
    this._activeCamera.fov = 60;
    this.initPolarAngle({
      polarAngle: 35,
    });
    this.initTargetPos({ targetPosition: { x: 0, y: 0, z: 0 } });
  }

  protected initOrthographicCtrl() {
    const halfWidth = this._canvas.width / 2;
    const halfHeight = this._canvas.height / 2;
    const near = 10;
    const far = 10000;
    this._orthographicCamera = new OrthographicCamera(
      -halfWidth,
      halfWidth,
      halfHeight,
      -halfHeight,
      near,
      far
    );

    CameraData.setOrthographicWidth(Math.max(halfWidth * 2, halfHeight * 2));

    this._orthographicCtrl = new OrbitControls(
      this._orthographicCamera,
      this._canvas,
      true
    );
    this._orthographicCamera.updateProjectionMatrix();
  }

  protected initOribtCtrl() {
    this._orbitCamera = new PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      10,
      10000
    );

    this._orbitControl = new OrbitControls(this._orbitCamera, this._canvas);

    this._orbitControl.enableDamping = true;
    this._orbitControl.dampingFactor = 0.25;
    this._orbitControl.rotateSpeed = 0.55;
    this._orbitControl.target.set(0, 0, 0);
    this._orbitControl.minDistance = CAMERA_MIN_DISTANCE;
    this._orbitControl.maxDistance = CAMERA_MAX_DISTANCE;

    const handlerChange = (() => {
      let cachePolarAngle = false;
      const cachePosition: Vector3 = new Vector3();
      const cacheTargetPosition: Vector3 = new Vector3();
      const cacheRotation: Vector3 = new Vector3();
      return () => {
        if (!this._enable) {
          return;
        }
        const angle = this._orbitControl.getPolarAngle();
        const position = this._orbitCamera.position;
        const targetPosition = this._orbitControl.target;
        const rotation = this._orbitCamera.rotation;

        if (angle !== cachePolarAngle) {
          // PolarAngle有变化
          CameraData.setPolarAngle(MathT.radToDeg(Math.PI / 2 - angle));
          cachePolarAngle = angle;
        }

        if (!cachePosition.equals(position)) {
          // Position有变化
          CameraData.setPosition(position);
          cachePosition.copy(position);
        }

        if (!cacheTargetPosition.equals(targetPosition)) {
          // targePosition有变化
          CameraData.setTargetPosition(targetPosition);
          cacheTargetPosition.copy(targetPosition);
        }

        if (!cacheRotation.equals(rotation.toVector3())) {
          // Rotation有变化
          // console.log(Object.assign({}, rotation))
          CameraData.setRotation(rotation, 'rad');
          cacheRotation.copy(rotation.toVector3());
        }
      };
    })();

    this._orbitControl.addEventListener('change', handlerChange);

    // 监听数据层中的变化
    this.disposeArr.push(() =>
      this._orbitControl.removeEventListener('change', handlerChange)
    );
  }

  public update() {
    if (this._viewType === ViewType.ThreeD) {
      this._orbitControl.update();
    } else if (this._viewType === ViewType.Orthographic) {
      this._orthographicCtrl.update();
    }
  }

  public get viewType(): ViewType {
    return this._viewType;
  }

  public set viewType(vt: ViewType) {
    CameraData.setViewType(vt);
  }

  public get orbitControls() {
    return this._orbitControl;
  }

  public set orbitControls(ctrl) {
    this._orbitControl = ctrl;
  }

  public switchTo3D() {
    CameraData.setViewType(ViewType.ThreeD);
  }

  public switchToRoam() {
    CameraData.setViewType(ViewType.Roam);
  }

  public get activeCamera(): any {
    return this._activeCamera;
  }

  public set activeCamera(val: any) {
    this._activeCamera = val;
    if (this._scene3d) {
      this._scene3d.camera = val as any;
    }
  }

  public get activeControl() {
    return this._orbitControl;
  }

  public get is3DView(): boolean {
    return this._viewType === ViewType.ThreeD;
  }

  public get isRoamView(): boolean {
    return this._viewType === ViewType.Roam;
  }

  public destroy() {
    while (this.disposeArr.length) {
      this.disposeArr.pop()();
    }
  }

  public orthographicCameraChange = (() => {
    const cachePosition: Vector3 = new Vector3();
    const cacheTargetPosition: Vector3 = new Vector3();
    let cacheZoom = 0;
    return () => {
      if (!this._enable) {
        return;
      }
      const position = this._orthographicCamera.position;
      const targetPosition = this._orbitControl.target;
      const zoom: number = this._orthographicCamera.zoom;

      if (!cachePosition.equals(position)) {
        CameraData.setPosition(position);
        cachePosition.copy(position);
      }

      if (!cacheTargetPosition.equals(targetPosition)) {
        // targePosition有变化
        CameraData.setTargetPosition(targetPosition);
        cacheTargetPosition.copy(targetPosition);
      }

      if (cacheZoom !== zoom) {
        CameraData.setZoom(zoom);
        cacheZoom = zoom;
      }
    };
  })();

  private initPolarAngle(change: any) {
    const spherical = new Spherical();
    const offset = new Vector3()
      .copy(this._orbitCamera.position)
      .sub(this._orbitControl.target);
    spherical.setFromVector3(offset);
    spherical.phi = Math.PI / 2 - MathT.degToRad(change.polarAngle);
    offset.setFromSpherical(spherical);
    this._orbitCamera.position.copy(this._orbitControl.target).add(offset);
    this._orbitCamera.lookAt(this._orbitControl.target);
  }

  private initTargetPos(param: any) {
    const { x, y, z } = param.targetPosition;
    this._orbitControl.floodHeight = y;
    this._orbitControl.target.set(x, y, z);
  }
}
