import { reaction } from 'mobx';
import Model2DActive from '../../../store/Model2DActive';
import BaseEvent from '../../Base/BaseEvent';
import Obstacle from '../../Model/Home/Obstacle';
import Room from '../../Model/Home/Room';
import Structure from '../../Model/Home/Structure';
import Scene2D from '../index';

export default class SelectionAction extends BaseEvent {
  private _scene: Scene2D;
  public constructor(scene: Scene2D) {
    super(scene.DOMEventListener);
    this._scene = scene;
    reaction(
      () => {
        return Model2DActive.selection;
      },
      (select) => {
        this.enable =
          select instanceof Structure ||
          select instanceof Room ||
          select instanceof Obstacle;
        if (this.enable) {
          if (Model2DActive.editStructure) {
            Model2DActive.editStructure.isEdit = false;
          }
          Model2DActive.editStructure = select;
          Model2DActive.editStructure.isEdit = true;
        } else {
          if (Model2DActive.editStructure) {
            Model2DActive.editStructure.isEdit = false;
            Model2DActive.editStructure = null;
          }
        }
      }
    );
  }
}
