import { reaction } from 'mobx';
import Model2DActive from '../../../store/Model2DActive';
import { EventEnum, EventMgr } from '../../../utils/EventManager';
import Vector2 from '../../../utils/Math/geometry/Vector2';
import BaseEvent from '../../Base/BaseEvent';
import Obstacle from '../../Model/Home/Obstacle';
import Room from '../../Model/Home/Room';
import Structure from '../../Model/Home/Structure';
import Scene2D from '../index';

export default class NewStructureAction extends BaseEvent {
  private _scene: Scene2D;
  private newModel!: Structure | Room | Obstacle | null;

  public constructor(scene: Scene2D) {
    super(scene.DOMEventListener);
    this._scene = scene;

    reaction(
      () => Model2DActive.newStructure,
      (data) => {
        const isObstacle = data instanceof Obstacle;
        if (isObstacle) {
          this._once = false;
        }
        this.enable = isObstacle;
        this.newModel = data;
      }
    );
  }

  public initEvents() {
    this.on('input.move', this.moveAction.bind(this));
    this.on('win.contextmenu', this.cancel.bind(this));
    this.on('input.end', (event: any) => {
      event.type === 'touchend' && this.moveAction(event);
      this.onInputEnd(event);
    });
    this.on('win.input.end', (event: any) => {
      this.onInputEnd(event);
    });
  }

  private moveAction(event: any) {
    this.newObstacle();
    const { pageX, pageY } = event;
    const position = this._scene.pickupController.getPoint(pageX, pageY);
    if (this.newModel instanceof Obstacle) {
      this.newModel.setPosition(position);
    }
  }
  private onInputEnd(event: any) {
    if (this.newModel instanceof Obstacle) {
      this.newModel.updateBoundaryToWorld();
      this.newModel.position.set(0, 0);
      this._scene.home.curLevel.addObstacle(this.newModel);
      this._scene.home.curLevel.addObstacleTree(this.newModel);
      const rooms = this._scene.home.curLevel.quadTree
        .retrieve(this.newModel)
        .map((item) => item.data)
        .filter((item) => item instanceof Room);
      if (rooms.length > 0) {
        this.newModel.zPlane = rooms[0].height;
      }
      EventMgr.emit(EventEnum.updateTree, [
        {
          id: this.newModel.rvtId,
          checked: true,
        },
      ]);
      Model2DActive.setNewStructure(null);
    }
  }
  private cancel(event: any) {
    if (!this._once) return;
    EventMgr.emit(EventEnum.layerRemove, this.newModel);
    this.newModel?.destroy();
    Model2DActive.setNewStructure(null);
  }

  private _once = false;
  private newObstacle() {
    if (this._once) return;
    EventMgr.emit(EventEnum.layerAdd, this.newModel);
    this._once = true;
  }
}
