import { reaction, when } from 'mobx';
import Model2DActive from '../../../store/Model2DActive';
import BaseEvent from '../../Base/BaseEvent';
import Scene2D from '../index';
import Column from '../../Model/Home/Column';

export default class SelectColumnAction extends BaseEvent {
  private _scene2D: Scene2D;
  private column: Column;

  public constructor(scene2D: Scene2D) {
    super(scene2D.DOMEventListener);
    this._scene2D = scene2D;

    reaction(
      () => {
        if (Model2DActive.isChanging || Model2DActive.cameraChanging) {
          return false;
        }

        return Model2DActive.selectColumn;
      },
      edit => {
        const enable = edit instanceof Column;
        if (edit instanceof Column) {
          if (this.column !== edit && this.column) {
          }
          this.column = edit;
        }
        this.enable = enable;
      },
    );
  }

  public initEvents() {
    this.debugColumn();
    this.disposeArr.push(
      when(
        () => !Model2DActive.editingModel,
        () => {
          Model2DActive.setSelectColumn(null);
        },
      ),
    );
  }

  debugColumn() {
    console.log(this.column.boundingPoints);
  }
}
