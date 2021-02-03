import mapValues from 'lodash/mapValues';
import { action, computed, observable } from 'mobx';
import {
  Box3,
  Euler,
  Math as MathT,
  Matrix4,
  Quaternion,
  Spherical,
  Vector2,
  Vector3,
} from 'three';
import HomeTypeData from '../model/HomeTypeData';
import Scene3D from '../scene/3D/scene3d';
import ConfigStructure from '../utils/ConfigStructure';
import VueStoreData from './VueStoreData';

const CAMERA_DEFAULT_PARAMS = {
  roam: {
    position: {
      x: 0,
      y: 140,
      z: 0,
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0,
    },
  },
  threeD: {
    // position: {
    //   x: 589.9530024211396,
    //   y: 1373.183172520194,
    //   z: 1468.9370235467209,
    // },
    position: {
      x: 528.7129955345359,
      y: 1394.0163249697289,
      z: 1113.3792405140932,
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0,
    },
    polarAngle: 45,
    thetaAngle: 45,
    targetPosition: {
      x: -63.46484213593499,
      y: 0,
      z: -356.436237857175,
      // x: 0,
      // y: 0,
      // z: 0,
    },
  },
  fov: 60,
};

export enum ViewType {
  ThreeD, // 3D视图
  Roam, // 漫游视图
  Orthographic,
}

class CameraData {
  public cameraNeedReset = true;
  public roamCameraNeedReset = true;

  /**
   * ViewType管理全局摄像机的现实状态
   */
  @observable
  private _viewType = {
    active: ViewType.ThreeD,
  };

  @computed
  public get viewType() {
    return this._viewType.active;
  }

  @action.bound
  public setViewType(val: ViewType) {
    this._viewType.active = val;
  }

  /**
   * 这里的camera最终实例化后有他自己的position,rotation等属性
   * 这里没有办法引入vuex，但他的属性变化后
   * 需要同步到vue层，告知vue当前的数据 (过程中有计算比例)
   * 要同步到2d层，让他重绘当前平面俯视图(过程中有计算比例)
   * ...以及后续还会用到很多他的属性，都需要达到响应式
   */
  @observable
  private data: any = {
    [ViewType.Roam]: {
      position: { x: 0, y: 130, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
    },

    [ViewType.ThreeD]: {
      position: {
        x: 528.7129955345359,
        y: 1394.0163249697289,
        z: 1113.3792405140932,
      },
      rotation: { x: 0, y: 0, z: 0 },
      polarAngle: 35, // 俯视图(围绕模式)下极度旋转角
      targetPosition: {
        x: 0,
        y: 0,
        z: 0,
      },
    },

    [ViewType.Orthographic]: {
      position: { x: 0, y: 100, z: 0 },
      targetPosition: {
        x: 0,
        y: 0,
        z: 0,
      },
      orthographicWidth: 1340,
    },

    zoom: 0.2,
    fov: 60,
    innerDepth: 0.1, // 相机内部半径
    inCroping: {
      normal: false, // 平面
      panorama: false, // 全景
    }, // 是处于视图区域裁剪状态
    aspect: 1,
  };

  private getObservableData(key: any) {
    const data = this.data[this.viewType];
    // 兼容公共属性
    if (data[key] === undefined) {
      return this.data[key];
    }
    return data[key];
  }

  public resetCameraPosition() {
    Object.assign(this.data[ViewType.Roam].position, { x: 0, z: 0 });
    this.setTargetPosition({ x: 0, z: 0 });
  }

  /**
   * 俯视图下的相机视图范围
   * 仅 Roam相机有效
   * @returns {number}
   */
  @computed
  public get overlookAngle() {
    // const height = 100 * Math.tan(MathT.degToRad(this.fov / 2)) * 2;
    // const width = height * this.data.aspect;
    const matrix = new Matrix4();
    const { x } = this.data[ViewType.Roam].rotation;
    const quaternion = new Quaternion(x, 0, 0);
    matrix.compose(new Vector3(0, 0, 0), quaternion, new Vector3(1, 1, 1));
    const vectors: Vector3[] = this.calculateFovWidthPos();
    const vector1 = vectors[0];
    const vector2 = vectors[1];
    // 对局部坐标做坐标转换
    vector1.applyMatrix4(matrix);
    vector2.applyMatrix4(matrix);

    // 投影坐标
    const planeVector = new Vector3(0, 1, 0);
    vector1.projectOnPlane(planeVector);
    vector2.projectOnPlane(planeVector);

    return MathT.radToDeg(this.angleBetweenVectors(vector2, vector1));
  }

  private angleBetweenVectors(Vec1: Vector3, Vec2: Vector3) {
    Vec1 = new Vector3().copy(Vec1);
    Vec2 = new Vector3().copy(Vec2);

    let rotY: number = Vec1.angleTo(Vec2);

    // when (rotY> Math.PI) => rotY should be 2 PI - rotY
    Vec1.cross(Vec2);
    if (Vec1.y < 0) {
      // 逆时针
      rotY = 2 * Math.PI - rotY;
    }

    return rotY;
  }
  /**
   * 计算fov宽的两个坐标
   */
  public calculateFovWidthPos(): Vector3[] {
    const height = 100 * Math.tan(MathT.degToRad(this.fov / 2)) * 2;
    const width = height * this.data.aspect;
    const vector1 = new Vector3(width / 2, 0, 100);
    const vector2 = new Vector3(-width / 2, 0, 100);
    return [vector1, vector2];
  }

  /**
   * 俯视图下的相机视图范围
   * 仅 Roam相机有效
   * @returns {number}
   */
  @computed
  public get normalAngle() {
    const vect: Vector3[] = this.calculateFovWidthPos();
    return vect && MathT.radToDeg(this.angleBetweenVectors(vect[1], vect[0]));
  }

  @computed
  public get polarAngle() {
    return this.getObservableData('polarAngle');
  }

  // @action.bound
  public setPolarAngle(val: number) {
    val = Math.max(val, -90);
    val = Math.min(val, 90);
    this.data[this.viewType].polarAngle = val;
  }

  @computed
  public get position() {
    return this.getObservableData('position');
  }

  public setPosition(val: any) {
    this.setXYZ('position', val);
  }

  private getPositionByViewType(viewType: any) {
    const data = this.data[viewType];
    // 兼容公共属性
    if (data.position === undefined) {
      return this.data.position;
    }
    return data.position;
  }

  private getRotationByViewType(viewType: any) {
    const data = this.data[viewType];
    // 兼容公共属性
    if (data.rotation === undefined) {
      return this.data.rotation;
    }
    return data.rotation;
  }

  public getCameraData() {
    const data = {
      [ViewType.Roam]: {
        position: this.getPositionByViewType(ViewType.Roam),
        rotation: this.getRotationByViewType(ViewType.Roam),
      },

      [ViewType.ThreeD]: {
        position: this.getPositionByViewType(ViewType.ThreeD),
        rotation: this.getRotationByViewType(ViewType.ThreeD),
        polarAngle: this.polarAngle,
        targetPosition: this.targetPosition,
      },
    };

    return data;
  }

  @computed
  public get rotation() {
    const rotation = this.getObservableData('rotation');
    return Object.keys(rotation).reduce<{ x: number; y: number; z: number }>(
      (obj, key) =>
        Object.assign(obj, { [key]: MathT.radToDeg(rotation[key]) }),
      { x: 0, y: 0, z: 0 }
    );
  }

  /**
   * @param type rad弧度 deg角度
   */
  public setRotation(val: any, type = 'deg') {
    type === 'deg' &&
      (val = mapValues(val, (_val) => {
        return MathT.degToRad(_val);
      }));

    if (val instanceof Euler) {
      const { x, y, z } = val;
      val = { x, y, z };
    }

    this.setXYZ('rotation', val);
  }

  @computed
  public get fov() {
    return this.getObservableData('fov');
  }

  public setFov(val: any) {
    this.data.fov = val;
  }

  @computed
  public get zoom() {
    return this.getObservableData('zoom');
  }

  public setZoom(val: any) {
    this.data.zoom = val;
  }

  @computed
  public get orthographicWidth() {
    return this.getObservableData('orthographicWidth');
  }

  public setOrthographicWidth(val: any) {
    this.data[this.viewType].orthographicWidth = val;
  }

  // ===设置相机内部视野半径
  @computed
  public get getInnerRadius() {
    return this.data.innerDepth;
  }

  @action.bound
  public setInnerRadius(val: any) {
    this.data.innerDepth = Math.max(val, 1);
  }

  @computed
  public get targetPosition() {
    return this.data[ViewType.ThreeD].targetPosition;
  }

  public setTargetPosition(val: any) {
    this.setXYZ('targetPosition', val);
  }

  private setXYZ(key: string, val: any) {
    const newData = {
      ...this.getObservableData(key),
      ...val,
    };
    const { x, y, z } = newData;

    // this.camera[key].set(x, y, z)
    this.data[this.viewType][key] = { x, y, z };
  }

  @action.bound
  public setRomePosition(val: any) {
    if (!val) {
      return;
    }
    const { x, y, z } = val;
    this.data[ViewType.Roam].position = { x, y, z };
  }

  /**
   * 重置3D相机视角
   * @returns {Promise<void>}
   */
  @action
  public async resetView() {
    let defaultInfo = null;
    const min = ConfigStructure.toCanvas(ConfigStructure.minCanvasV3);
    const max = ConfigStructure.toCanvas(ConfigStructure.maxCanvasV3);
    const homeBoundingBox = new Box3(
      new Vector3(min.x, min.y, min.z),
      new Vector3(max.x, max.y, max.z)
    );

    this.setFov(CAMERA_DEFAULT_PARAMS.fov);

    if (this.viewType === ViewType.ThreeD) {
      defaultInfo = CAMERA_DEFAULT_PARAMS.threeD;

      this.setXYZ('targetPosition', homeBoundingBox);

      /**
       * 适配环绕相机到当前户型
       * @param boundingBox
       */
      const fitCameraToObject = (boundingBox: Box3) => {
        const spherical = new Spherical();
        // const offset = new Vector3().copy(this.position).sub(new Vector3().copy(this.targetPosition));
        defaultInfo = CAMERA_DEFAULT_PARAMS.threeD;
        spherical.phi = Math.PI / 2 - MathT.degToRad(defaultInfo.polarAngle);
        spherical.theta = Math.PI / 2 - MathT.degToRad(defaultInfo.thetaAngle);
        spherical.radius =
          (boundingBox.getSize(new Vector3()).length() / 3) * 2 + 100;

        const offset = new Vector3();
        offset.setFromSpherical(spherical);

        const target = new Vector3().copy(this.targetPosition);
        const cameraPos = target.clone().add(offset);

        this.setXYZ('position', cameraPos);
      };

      fitCameraToObject(homeBoundingBox);
    } else {
      defaultInfo = CAMERA_DEFAULT_PARAMS.roam;

      const center = homeBoundingBox
        .getCenter(new Vector3())
        .setY(defaultInfo.position.y);

      this.setXYZ('position', center);
      this.setRotation(defaultInfo.rotation);
    }
  }

  public getHomeCenter() {
    return new Vector2(0, 0);
  }

  public getZoom(rendererDom: any) {
    return 0.2;
  }

  constructor() {
    // this.init()
  }

  @computed
  public get aspect() {
    return this.data.aspect;
  }

  public setAspect(num: number) {
    this.data.aspect = num;
  }
}

export default new CameraData();
