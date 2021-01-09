import { reaction } from 'mobx';
import Model2DActive from '../../../store/Model2DActive';
import BaseEvent from '../../Base/BaseEvent';
import Room from '../../Model/Home/Room';
import Structure from '../../Model/Home/Structure';
import Scene2D from '../index';

export default class SelectionAction extends BaseEvent {
  private _scene: Scene2D;
  private bim!: Room | Structure;
  public constructor(scene: Scene2D) {
    super(scene.DOMEventListener);
    this._scene = scene;
    reaction(
      () => {
        return Model2DActive.selection;
      },
      (select) => {
        this.enable = select instanceof Structure;
        if (this.enable) {
          this.bim = select;
          this.bim.isEdit = true;
        } else {
          if (this.bim) {
            this.bim.isEdit = false;
            this.bim = select;
          }
        }
      }
    );
  }
}
