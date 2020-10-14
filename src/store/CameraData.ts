import mapValues from 'lodash/mapValues';
import { action, computed, observable } from 'mobx';
import { Box3, Euler, Math as MathT, Matrix4, Quaternion, Spherical, Vector2, Vector3 } from 'three';
import VueStoreData from './VueStoreData';

export enum ViewType {
  ThreeD, // 3D视图
  Roam, // 漫游视图
  Orthographic,
}
class CameraData {
  /**
   * ViewType管理全局摄像机的现实状态
   */
  @observable
  private _viewType = {
    active: ViewType.Roam,
  };

  @computed
  public get viewType() {
    return this._viewType.active;
  }

  @action.bound
  public setViewType(val: number | string) {
    if (typeof val === 'number') {
      this._viewType.active = val;
    }
    if (typeof val === 'string') {
      this._viewType.active = ViewType[val];
    }
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

  private getObservableData(key) {
    const data = this.data[this.viewType];
    // 兼容公共属性
    if (data[key] === undefined) {
      return this.data[key];
    }
    return data[key];
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

  @computed
  public get polarAngle() {
    return this.getObservableData('polarAngle');
  }

  @computed
  public get position() {
    return this.getObservableData('position');
  }

  public setPosition(val) {
    this.setXYZ('position', val);
  }

  private getPositionByViewType(viewType) {
    const data = this.data[viewType];
    // 兼容公共属性
    if (data.position === undefined) {
      return this.data.position;
    }
    return data.position;
  }

  private getRotationByViewType(viewType) {
    const data = this.data[viewType];
    // 兼容公共属性
    if (data.rotation === undefined) {
      return this.data.rotation;
    }
    return data.rotation;
  }

  /**
   * @param type rad弧度 deg角度
   */
  public setRotation(val, type = 'deg') {
    type === 'deg' &&
    (val = mapValues(val, _val => {
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

  @computed
  public get zoom() {
    return this.getObservableData('zoom');
  }

  @computed
  public get orthographicWidth() {
    return this.getObservableData('orthographicWidth');
  }

  // ===设置相机内部视野半径
  @computed
  public get getInnerRadius() {
    return this.data.innerDepth;
  }

  @action.bound
  public setInnerRadius(val) {
    this.data.innerDepth = Math.max(val, 1);
  }

  // ==当前试图是否处于裁剪状态
  @computed
  public get isClipState() {
    return this.data.inCroping[VueStoreData.previewTabShow];
  }

  @action.bound
  public setClipState(val) {
    this.data.inCroping[VueStoreData.previewTabShow] = val;
  }

  // ===========

  @computed
  public get targetPosition() {
    return this.data[ViewType.ThreeD].targetPosition;
  }

  public setTargetPosition(val) {
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
  public setRomePosition(val) {
    if (!val) {
      return;
    }
    const { x, y, z } = val;
    this.data[ViewType.Roam].position = { x, y, z };
  }


  constructor() {
    // this.init()
  }

  @computed
  public get aspect() {
    return this.data.aspect;
  }

}

export default new CameraData();
