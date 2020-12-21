import Container = PIXI.Container;
import { reaction } from 'mobx';
import Model2DActive from '../../../store/Model2DActive';
import Vector2 from '../../../utils/Math/geometry/Vector2';
import BaseEvent from '../../Base/BaseEvent';
import Structure from '../../Model/Home/Structure';
import Scene2D from '../index';
import PickupController from '../Manager/PickupController';

/**
 * 构建移动动作
 * * by lianbo.guo
 **/
export default class StructureMoveAction extends BaseEvent {
  // @ts-ignore
  public view: Container; // 移动时所需要显示的一些内容
  // @ts-ignore
  private structure: Structure;
  private pickupCtrl: PickupController;
  private _scene2D: Scene2D;
  private offsetPos!: Vector2;

  private _stage: Container;

  /**墙体是否移动，用于区分单纯的墙体点击事件 */
  private isMoved = false;

  private startPos!: Vector2 | null;

  public constructor(scene2D: Scene2D) {
    super(scene2D.DOMEventListener);
    this._scene2D = scene2D;
    this.pickupCtrl = scene2D.pickupController;

    this._stage = scene2D.getStage();

    this.initControllerView();

    reaction(
      () => Model2DActive.draggingStructure,
      (strct: any) => {
        const enable = strct instanceof Structure;
        if (enable) {
          this.structure = strct;
          console.log('got you');
        }
        this.enable = enable;
      }
    );
  }

  public dispose() {
    super.dispose();
    this.view.visible = false;
    // @ts-ignore
    this.offsetPos = null;
    // this.startWall = null;
    this.isMoved = false;
  }

  public initEvents() {
    this.view.visible = true;

    // @ts-ignore
    this.on('input.move', (event) => this.moveAction(event));
    // @ts-ignore
    this.on('win.input.end', (event) => {
      this.moveDone(event);
      Model2DActive.setDragStructure(null);
    });
  }

  // @ts-ignore
  public moveDone(event) {
    // console.profile('move done');
    this.structure.isMoving = false;
    if (!this.isMoved) {
      return;
    }
    this.startPos = null;
    // console.profileEnd();
  }

  // public moveWall(pos: Vector2D, allowance: number = 10): void {}

  /**
   * 移动动作
   * @param event
   */
  // @ts-ignore
  protected moveAction(event) {
    // 只要接收到moveAction事件，是否移动标识就置为false
    // console.profile('moveWall');
    this.structure.isMoving = true;
    const { pageX, pageY } = event;
    const position = Scene2D.getInstance().pickupController.getPoint(
      pageX,
      pageY
    );
    const enableAbsorb = !event.ctrlKey && !event.metaKey;

    const v = new Vector2(position.x, position.y);
    if (!this.startPos) {
      this.startPos = v;
    }
    this.moveStructure(v);
  }

  /**
   * 初始化ControllerView
   */
  private initControllerView() {
    this.view = new Container();

    this._scene2D.getStage().addChild(this.view);

    this.view.visible = false;
  }

  private moveStructure(v: Vector2) {
    // const distance:number = v.subtract(this.startPos);
  }
}
