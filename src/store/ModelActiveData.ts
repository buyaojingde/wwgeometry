import isEmpty from 'lodash/fp/isEmpty';
import { action, computed, observable, reaction } from 'mobx';
import { Vector3 } from 'three';
import { EActiveTypes } from '../global/Enum/EnumData';
import RouterData from './RouterData';
import VueStoreData from './VueStoreData';

class ModelActiveData {
  @observable
  public hideWallsList: any = {}; // 当前视角下需要隐藏的墙

  @observable
  public hideModelsList: any = {}; // 当前视角下需要隐藏的模型
  private _editingDisposeArr: Array<() => void> = []; // 释放监听话柄函数

  @observable
  private data: any = {};

  @observable
  private editingData: any = {};

  @observable
  public canvasCursor: string = null; // 显示的光标样式

  public initData() {
    this.editingData = {
      [EActiveTypes.Draging]: {},
      [EActiveTypes.MovingTexture]: {},
      [EActiveTypes.MovingPrototypeRoom]: {}, // 正在拖动应用的样板间
      [EActiveTypes.MovingHeight]: {},
      [EActiveTypes.Rotating]: {},
      [EActiveTypes.HoleDraging]: {},
      [EActiveTypes.ReplaceHoleModel]: {},
    };
    this.data = {
      [EActiveTypes.Editing]: {
        point: {} as Vector3,
        objectData: {},
      }, // 正在编辑的物体，不会影响到摄像机控制器
      [EActiveTypes.CameraChanging]: false, // 判断摄像机正在移动
    };

    this.hideWallsList = null;
    this.hideModelsList = null;
  }

  @observable
  public replaceModelState = false; // 是否进入替换模型状态模式

  @observable
  public isReplaceHoleStone: boolean = false; // 是否替换窗台石/门槛石（主要区别替换门窗模型）

  public constructor() {
    this.initData();
    // 当路由切换为非3DStage时清除状态
    reaction(
      () => VueStoreData && /^3DStage|floorStage|wallStage$/.test(RouterData.routeNow.name),
      enable => {
        if (!enable) {
          // 如果上一个路由是背景墙，则不进行处理
          if (RouterData.fromPath === '/wallStage' || RouterData.fromPath === '/floorStage') {
            return;
          }
          this.clearEditingModel();
          VueStoreData.setTextureStraw(false);
          Object.keys(this.editingData).map(val => {
            this.clearActive(val as any);
          });
        }
      },
    );
  }

  public setActiveObject(object: any, type: EActiveTypes = EActiveTypes.Draging) {
    this.editingData[type] = object;
  }

  public setMovingTexture(textureData: any) {
    // 3D下复制地面时传过来的是TextureItemVO，id字段是textureID
    // 新的材质分类无textureId,material_type值为2
    if (textureData.material_type !== 2 && !textureData.textureId && !textureData.textureID) {
      return console.warn('选择的模型出错，该模型没有TextureID');
    }

    // when (MovingTexture has value) => clear Move texture first
    !!this.editingData[EActiveTypes.MovingTexture] && this.clearActive(EActiveTypes.MovingTexture);

    this.editingData[EActiveTypes.MovingTexture] = textureData;
  }

  // 单间样板间应用
  public setMovingPrototypeRoom(prototypeRoomData: any) {
    !!this.editingData[EActiveTypes.MovingPrototypeRoom] && this.clearActive(EActiveTypes.MovingPrototypeRoom);

    this.editingData[EActiveTypes.MovingPrototypeRoom] = { ...prototypeRoomData };
  }

  public clearActive(type: EActiveTypes) {
    this.editingData[type] = {};
  }

  @computed
  get editingModel() {
    return this.data[EActiveTypes.Editing].objectData;
  }

  @computed
  get editingModelPoint() {
    return this.data[EActiveTypes.Editing].point;
  }

  public setEditingModel(model: any, point: Vector3) {
    // 更换EditingModel时 先触发清除Editing
    if (this.editingModel.id !== model.id) {
      this.clearEditingModel();
      this.data[EActiveTypes.Editing].objectData = model;
    }

    if (model && model.on) {
      // 当监听到Model destroy时清除状态
      const fn = () => {
        if (!this.replaceModelState) {
          if (this.editingModel === model) {
            this.clearEditingModel();
          }
        }
      };
      model.on('destroy', fn);

      this._editingDisposeArr.push(() => {
        model.off('destroy', fn);
      });
    }
    this.data[EActiveTypes.Editing].point = point;
  }

  public clearEditingModel() {
    while (this._editingDisposeArr.length) {
      this._editingDisposeArr.pop()();
    }

    this.data[EActiveTypes.Editing] = {
      point: {},
      objectData: {},
    };

    this.resetReplaceModelState();
    this.setIsReplaceHoleStone(false);
  }

  @computed
  get movingTexture() {
    return this.editingData[EActiveTypes.MovingTexture];
  }

  // 正在拖动的单间样板间
  @computed
  get movingPrototypeRoom() {
    return this.editingData[EActiveTypes.MovingPrototypeRoom];
  }

  @computed
  get dragingModel(): any {
    return this.editingData[EActiveTypes.Draging];
  }

  @computed
  get isChanging() {
    for (const index in this.editingData) {
      if (this.editingData.hasOwnProperty(index)) {
        const editingData = this.editingData[index];
        if (!isEmpty(editingData)) {
          return true;
        }
      }
    }

    if (!isEmpty(this.data[EActiveTypes.MovingTexture])) {
      return true;
    }
    if (!isEmpty(this.data[EActiveTypes.MovingPrototypeRoom])) {
      return true;
    }

    return false;
  }

  @computed
  get cameraChanging() {
    return this.data[EActiveTypes.CameraChanging];
  }

  public setChangingCamera(val: boolean) {
    this.data[EActiveTypes.CameraChanging] = val;
  }

  @computed
  get MovingHeight() {
    return this.editingData[EActiveTypes.MovingHeight];
  }

  @computed
  get rotatingModel() {
    return this.editingData[EActiveTypes.Rotating];
  }

  @computed
  get dragingHole() {
    return this.editingData[EActiveTypes.HoleDraging];
  }

  @computed
  get draggingReplaceHoleModel() {
    return this.editingData[EActiveTypes.ReplaceHoleModel];
  }

  @action
  public setReplaceModelState(val: boolean = false) {
    this.replaceModelState = val;
    !val && this.setIsReplaceHoleStone(false);
  }

  @action
  public resetReplaceModelState() {
    this.replaceModelState = false;
    this.isReplaceHoleStone = false;
  }

  @action
  public setIsReplaceHoleStone(val: boolean) {
    this.isReplaceHoleStone = val;
  }

  @action
  public setCanvasCursor(str: string) {
    this.canvasCursor = str;
  }
}

export default new ModelActiveData();
