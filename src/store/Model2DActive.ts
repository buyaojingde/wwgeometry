import isEmpty from 'lodash/isEmpty';
import { action, computed, observable } from 'mobx';
import ModelContext from '../model/context/ModelContex';
import ViewObject from '../scene/2D/ViewObject/ViewObject';
import { DRAWING_WALL_MODE } from '../scene/Constants/Constant0';
import ObjectIndex from '../scene/Model/BaseInterface/ObjectIndex';
import Column from '../scene/Model/Home/Column';

class Model2DActive {
  @observable
  public editingTexture;
  @observable
  public editingPrototypeRoom; // 正在拖动应用的样板间
  @observable
  public editingModel;
  @observable
  public editingModel2D: ViewObject;
  @observable
  public cameraChanging = false;
  @observable
  public dragingModel = null;
  @observable
  public rotatingModel = null;
  @observable
  public resizingModel = null;
  @observable
  public resizingHole = null; // 正在resize墙洞
  @observable
  public resizingPointIndex: string = null;
  @observable
  public selectingStatus = null; // 正在触发框选动作
  @observable
  public dragingColumn: Column = null; // 正在拖动构建
  @observable
  public selectColumn: Column = null; // 正在拖动构建
  @observable
  public dragingLight = null; // 正在拖动灯光
  @observable
  public drawingWallModeState = false; // 墙体绘制模式
  @observable
  public drawingRoomModeState = false; // 房间绘制模式
  @observable
  public isWallDrawing = false; // 墙体绘制中
  @observable
  public isRoomDrawing = false; // 房间绘制中
  @observable
  public dragingText2D = null; // 正在拖动的文本
  @observable
  public drawingOptions: any;
  @observable
  public actionDrawing = '';
  @observable
  public settingCopydrawingScale: any; // 设置临摹图比例
  @observable
  public replaceModelState = false; // 替换模型状态模式
  @observable
  public isReplaceHoleStone: boolean = false; // 是否替换窗台石/门槛石（主要区别替换门窗模型）
  @observable
  public canvasCursor: string = null; // canvas中需要显示的光标

  public isFittingCeiling: boolean = false;

  @observable
  public measureLengthState = false;

  @observable
  public editingPaveTexture = null; // 拖动的铺贴

  private _editingDisposeArr: Array<() => void> = [];

  constructor() {
    this.drawingOptions = {
      orthogonal: false,
      shouldSnap: true,
      mode: DRAWING_WALL_MODE.CENTER,
      thickness: ModelContext.getInstance().wallThickness,
    };
    this.settingCopydrawingScale = {
      startVector2D: null,
      endVector2D: null,
      isDrawing: false,
      popperShow: false,
      popperPosition: null,
    };
  }

  // 此方法名应该改为 reset...
  // 释放监听话柄函数
  @action
  public init() {
    this.editingModel = null;
    this.editingModel2D = null;
    this.cameraChanging = false;
    this.dragingModel = null;
    this.rotatingModel = null;
    this.resizingModel = null;
    this.resizingHole = null;
    this.resizingPointIndex = null;
    this.selectingStatus = null;
    this.dragingLight = null;
    this.drawingWallModeState = false;
    this.drawingRoomModeState = false;
    this.dragingText2D = null;
    this.actionDrawing = '';
    this.isWallDrawing = false;
    this.isRoomDrawing = false;
    this.settingCopydrawingScale.isDrawing = false;
    this.settingCopydrawingScale.popperShow = false;
    this.replaceModelState = false;
    this.measureLengthState = false;
  }

  public setEditingModel(val) {
    let model2D = null;
    if (val instanceof ViewObject && val.model && val.model instanceof ObjectIndex) {
      model2D = val;
      val = val.model;
    }

    if (val !== this.editingModel) {
      this.clearEditingModel(this.replaceModelState ? 0 : 1);
    }

    if (val && val.on) {
      // 编辑状态，元素被删除后需要clear
      const fn = beforeDate => {
        if (!this.replaceModelState) {
          if (this.editingModel === beforeDate) {
            this.clearEditingModel();
          }
        }
      };

      val.on('destroy', () => fn(val));

      this._editingDisposeArr.push(() => {
        val.off('destroy', () => fn(val));
      });
    }

    this.editingModel2D = model2D;
    this.editingModel = val;
  }

  public setMovingTexture(textureData: any) {
    if (!textureData.textureId && !textureData.textureID) {
      return console.warn('选择的模型出错，该模型没有TextureID');
    }

    this.editingTexture = textureData;
  }

  // 设置拖动应用的样板间
  public setMovingPrototypeRoom(prototypeRoomData: any) {
    this.editingPrototypeRoom = prototypeRoomData;
  }

  public setDrawingWallModeState(state: boolean): void {
    if (this.drawingRoomModeState) {
      this.drawingRoomModeState = false;
      this.isRoomDrawing = false;
    }
    this.actionDrawing = state ? 'draw_wall' : '';
    this.drawingWallModeState = state;
  }

  @action
  public setWallDrawing(state: boolean): void {
    if (!state || (state && this.drawingWallModeState)) {
      this.isWallDrawing = state;
    }
  }

  @action
  public setRoomDrawing(state: boolean): void {
    if (!state || (state && this.drawingRoomModeState)) {
      this.isRoomDrawing = state;
    }
  }

  @action
  public setCopyDrawingState(obj: any): void {
    if (obj.isDrawing) {
      this.init();
    }
    Object.assign(this.settingCopydrawingScale, obj);
  }

  public setDrawingRoomModeState(state: boolean): void {
    if (this.drawingWallModeState) {
      this.drawingWallModeState = false;
      this.isWallDrawing = false;
    }
    this.actionDrawing = state ? 'draw_room' : '';
    this.drawingRoomModeState = state;
  }

  /**
   * 重置画墙、画房间的状态
   */
  public resetDrawingState() {
    this.drawingRoomModeState && this.setDrawingRoomModeState(false);
    this.drawingWallModeState && this.setDrawingWallModeState(false);
  }

  @action
  public setEditingModel2D(val) {
    this.editingModel2D = val;
  }

  public setRotatingModel(val) {
    this.rotatingModel = val;
  }

  @action
  public setResizingModel(val, pointIndex = null) {
    this.resizingModel = val;
    this.resizingPointIndex = pointIndex;
  }

  @action
  public setResizingHole(val) {
    this.resizingHole = val;
  }

  @action
  public clearEditingModel(status: number = 1) {
    while (this._editingDisposeArr.length) {
      this._editingDisposeArr.pop()();
    }
    this.editingModel2D = null;
    this.editingModel = null;
    !!status && this.resetReplaceModelState();
    !!status && this.setIsReplaceHoleStone(false);
  }

  @action
  public clearEditingTexture() {
    this.editingTexture = null;
  }

  @action
  public clearEditingPrototypeRoom() {
    this.editingPrototypeRoom = null;
  }

  @action
  public setCameraChanging(val) {
    this.cameraChanging = val;
  }

  @action
  public setSelectCorner(val) {
    this.clearAll();
  }

  public clearAll() {
    this.clearEditingModel();
    this.clearSelectColumn();
  }

  @action
  public clearSelectColumn() {
    this.selectColumn = null;
  }


  @computed
  get isEditing() {
    return !isEmpty(this.editingModel) || this.cameraChanging;
  }

  public setDraggingModel(val) {
    if (val) {
      this.measureLengthState = false;
    }
    this.dragingModel = val;
  }

  @action
  public setSelectingStatus(val) {
    this.selectingStatus = val;
  }

  @action
  public setDrawingOptions(type, value) {
    this.drawingOptions = { ...this.drawingOptions, [type]: value };
  }

  @computed
  get isChanging() {
    if (!isEmpty(this.dragingModel)) {
      return true;
    }
    if (!isEmpty(this.rotatingModel)) {
      return true;
    }
    if (!isEmpty(this.resizingModel)) {
      return true;
    }
    if (!isEmpty(this.dragingLight)) {
      return true;
    }

    if (!isEmpty(this.editingTexture)) {
      return true;
    }

    if (!isEmpty(this.editingPaveTexture)) {
      return true;
    }

    if (this.isWallDrawing) {
      return true;
    }
    if (this.isRoomDrawing) {
      return true;
    }

    if (this.resizingHole) {
      return true;
    }

    if (!isEmpty(this.dragingText2D)) {
      return true;
    }

    return false;
  }

  @computed
  get isShowRuler() {
    if (!isEmpty(this.dragingModel)) {
      return true;
    }
    if (!isEmpty(this.rotatingModel)) {
      return true;
    }
    if (!isEmpty(this.resizingModel)) {
      return true;
    }
    if (this.isWallDrawing) {
      return true;
    }
    if (this.isRoomDrawing) {
      return true;
    }
    if (this.resizingHole) {
      return true;
    }
    if (!isEmpty(this.dragingText2D)) {
      return true;
    }
    return false;
  }

  @action
  public setDragingText2D(val) {
    this.dragingText2D = val;
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

  @computed
  public get isDrawingMode() {
    return this.drawingWallModeState || this.drawingRoomModeState;
  }

  @action
  public setCanvasCursor(str: string) {
    this.canvasCursor = str;
  }

  public setIsReplaceHoleStone(val: boolean) {
    this.isReplaceHoleStone = val;
  }

  public setMovingPaveTexture(paveData) {
    this.editingPaveTexture = paveData;
  }

  @action
  public clearEditingPaveTexture() {
    this.editingPaveTexture = null;
  }

  @action
  setDragColumn(column: Column) {
    this.dragingColumn = column;
  }

  @action
  setSelectColumn(model: any) {
    if (this.selectColumn !== model) {
      this.clearAll();
    }
    this.selectColumn = model;
  }
}

export default new Model2DActive();
