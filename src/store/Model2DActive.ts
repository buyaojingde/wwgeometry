import Obstacle from '../scene/Model/Home/Obstacle';
import Room from '../scene/Model/Home/Room';
import ObserveVector3 from '../scene/Model/ObserveMath/ObserveVector3';
import ConfigStructure from '../utils/ConfigStructure';
import { EventEnum, EventMgr } from '../utils/EventManager';
import Point from '../utils/Math/geometry/Point';
import { action, observable, when } from 'mobx';
import Structure from '../scene/Model/Home/Structure';

class Model2DActive {
  @observable
  public draggingStructure!: Structure | null; // 正在拖动构建
  @observable
  public selection!: any | null; // 正在选择构建
  // 正在选择构建
  @observable
  public cursorText = 'default'; // canvas中需要显示的光标
  @observable
  public editVertexState = false;
  @observable
  public subjectState = false;
  @observable
  public editEdgeState = false;
  @observable
  public cameraMove = false;
  @observable
  public homeTree: any[] = [];
  @observable
  public radians = 0;

  public subjectVec3: ObserveVector3 = new ObserveVector3(); // 屏幕坐标轴的位置
  public structureVec3: ObserveVector3 = new ObserveVector3(); // 构建的相对位置

  public editStructure!: any; // 当前正在编辑的构建
  @observable
  public editAxisNet = false;

  @observable
  public editGuidelines = false;

  @observable
  public isEdit = false;
  @observable
  public moveItem: any;

  @observable
  public newStructure!: Structure | Room | Obstacle | null;

  @action
  public setNewStructure(val: Structure | Room | Obstacle | null) {
    this.newStructure = val;
  }

  constructor() {}

  @action
  public setMoveItem(val: any) {
    this.moveItem = val;
  }

  @action
  public setGuidelines(val: boolean) {
    this.reset();
    this.clearAll();
    this.editGuidelines = val;
  }

  @action
  public setEditEdgeState(val: any) {
    this.clearAll();
    this.editEdgeState = val;
  }

  @action
  public setHomeTree(val: any) {
    this.homeTree = val;
  }

  @action
  public setSubjectState(val: boolean) {
    this.clearAll();
    this.subjectState = val;
  }

  @action
  public setEditState(val: boolean) {
    this.clearAll.call(this);
    setTimeout(() => {
      this.editVertexState = val;
    });
  }

  /**
   * @author lianbo
   * @date 2020-11-11 15:16:05
   * @Description: worldToLocal
   */
  @action
  public setStructureVec(geo: any) {
    const mat = ConfigStructure.subjectMat;
    const p = mat.applyInverse(new Point(geo.x, geo.y));
    // MathUtils.isNum(geo.x) && (this.structureVec3.x = (geo.x - this.subjectVec3.x));
    // MathUtils.isNum(geo.y) && (this.structureVec3.y = (geo.y - this.subjectVec3.y));
    // MathUtils.isNum(geo.z) && (this.structureVec3.z = (geo.z - this.subjectVec3.z));
    this.structureVec3.x = p.x;
    this.structureVec3.y = p.y;
  }

  // 释放监听话柄函数
  @action
  public reset() {
    this.draggingStructure = null;
    // this.selection = null;
  }

  @action
  public clearAll() {
    this.selection = null;
    this.editVertexState = false;
    this.editEdgeState = false;
  }

  @action
  public clearSelection() {
    this.selection = null;
  }

  @action
  public setCanvasCursor(str: string) {
    this.cursorText = str;
  }

  @action
  setDragStructure(structure: Structure | null) {
    this.draggingStructure = structure;
  }

  @action
  setSelection(model: any) {
    this.clearAll();
    setTimeout(() => {
      // 在clearAll执行完成之后，才会执行`this.selectStructure = model`,
      // 这样做的目的是重复点击Structure时也能触发Select
      this.selection = model;
    });
    if (model) {
      const id = model.rvtId;
      EventMgr.emit(EventEnum.selectNode, id);
    }
  }

  public async eventSequence() {
    this.setSubjectState(true);
    await when(() => !this.subjectState);
    this.setEditEdgeState(true);
  }

  @observable
  showAxis = false;
}

export default new Model2DActive();
