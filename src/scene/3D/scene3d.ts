import * as THREE from 'three';
import {
  AmbientLight,
  Color,
  LineSegments,
  Mesh,
  Object3D,
  PerspectiveCamera,
  WebGLRenderer,
} from 'three';
import HomeTypeData from '../../model/HomeTypeData';
import CameraData from '../../store/CameraData';
import MathUtils from '../../utils/Math/math/MathUtils';
import DOMEventManager from '../2D/Utils/DOMEventManager';
import SceneBase from '../Base/SceneBase';
import { buildFloorGrid, buildTransparencyPlane } from '../Math/GraphicsUtils';
import CameraControlManager from './CameraControlManager';
import HomePlan3D from './HomePlan3D';

export default class Scene3D extends SceneBase {
  get camera(): PerspectiveCamera {
    return this._camera;
  }

  set camera(value: PerspectiveCamera) {
    this._camera = value;
  }
  private static _instance: Scene3D; // 静态单例
  private _scene!: THREE.Scene;
  private _size = 12000;
  private _divisions = 240;
  private _floorGrid!: LineSegments;
  private _floor!: Mesh;
  private _renderer!: WebGLRenderer;
  private DOMEventListener!: DOMEventManager;
  private _cameraCtrlManager!: CameraControlManager;
  private Vue: any = null; // 传进的Vue对象
  private bindNode!: HTMLElement;
  private _camera!: PerspectiveCamera;
  // private controls!: OrbitControls;

  public get renderDom(): HTMLElement {
    return this._renderer.domElement;
  }

  static getInstance() {
    if (!this._instance) {
      this._instance = new Scene3D();
      this._instance.init();
    }
    return this._instance;
  }

  public constructor() {
    super();
  }

  // @Throttle(200)
  // @Bind
  // public onWindowResize() {
  //   this.resize();
  // }

  public resize(size: any = null) {
    if (!size) {
      if (!this.Vue) {
        return;
      }
      const element = this.bindNode;
      size = [element.clientWidth, element.clientHeight];
    }
    const renderSize = this._renderer.getSize();

    if (
      MathUtils.equal(size[0] * 2, renderSize.width, 3) &&
      MathUtils.equal(size[1] * 2, renderSize.height, 3)
    ) {
      return;
    }

    this._renderer.setSize(size[0], size[1], false);
  }

  public setHomePlan(homePlan: HomePlan3D) {
    if (this._homePlan) {
      this._homePlan.destroy();
    }

    this._homePlan = homePlan;

    this._scene.add(homePlan.container);
  }

  public refreshHomePlan() {
    this.setHomePlan(new HomePlan3D(this));
    this._homePlan.render();
  }

  public getHomeContainer(): any {
    return this._homePlan.container;
  }

  clear(): void {}

  destroy(): void {}
  render() {
    this._renderer.render(this._scene, this.camera);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this._renderer.setSize(window.innerWidth, window.innerHeight);
  }

  public init() {
    console.log('init');
    this._scene = new THREE.Scene();
    this._scene.background = new THREE.Color(0xe8e8e8);

    /* 添加地面网格 */
    this._floorGrid = buildFloorGrid(
      this._size,
      this._divisions,
      new Color(0xbbbbbb),
      new Color(0xd0d0d0)
    );
    this._floorGrid.position.y = -2;
    this._scene.add(this._floorGrid);

    const floor = buildTransparencyPlane();
    floor.rotation.set(-Math.PI / 2, 0, 0);
    floor.visible = false;
    this._scene.add(floor);
    floor.name = 'floorGrid';
    this._floor = floor;
    this._renderer = new WebGLRenderer({
      antialias: true,
      // logarithmicDepthBuffer: true,
    });
    this.loadHome().then((r) => console.log(r));

    this.DOMEventListener = new DOMEventManager(this._renderer.domElement);

    const axis = new THREE.AxesHelper(400);
    this.add(axis);

    this._cameraCtrlManager = new CameraControlManager(
      this,
      this._renderer.domElement
    );

    /** 加入场景的DOM事件管理 **/
    this.DOMEventListener.on('resize', this.onWindowResize);

    const aLight = new AmbientLight(0xffffff);
    this._scene.add(aLight);
  }

  public getScene(): THREE.Scene {
    return this._scene;
  }

  public add(object: Object3D) {
    this._scene.add(object);
  }

  /**
   * 用于绑定Vue Dom元素
   * @param Vue
   */
  public async bindVue(Vue: any) {
    this.Vue = Vue;
    this.bindNode = Vue.$refs.container3d;
    if (
      !!this.bindNode &&
      !this.bindNode.getElementsByTagName('canvas').length
    ) {
      this.bindNode.appendChild(this._renderer.domElement);
    }
    setTimeout(() => {
      this.resize();
    }, 1000);
  }

  save(): void {}

  private async loadHome() {
    await HomeTypeData.getHome();
    this.home = HomeTypeData.gottenHome;
    CameraData.resetCameraPosition();
    this.refreshHomePlan();
  }
}
