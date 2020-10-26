import { reaction, when } from "mobx";
import Model2DActive from "../../../store/Model2DActive";
import BaseEvent from "../../Base/BaseEvent";
import Scene2D from "../index";

export default class EditPositionAction extends BaseEvent {
  private _scene2D: Scene2D;
  private _readSelect: boolean;

  public constructor(scene2D: Scene2D) {
    super(scene2D.DOMEventListener);
    this._scene2D = scene2D;

    reaction(
      () => {
        return Model2DActive.editState;
      },
      (state) => {
        this.enable = state;
        this._readSelect = true;
        if (this.enable) {
          this.start();
        } else {
          this.end();
        }
      }
    );
  }

  public initEvents(): void {
    this.on("input.move", (event) => this.moveHandler(event));
  }

  private start() {
    Model2DActive.setText("move");
    Model2DActive.setCanvasCursor(Model2DActive.text);
    Model2DActive.vec3.set(3, 4, 5);
  }

  private end() {
    Model2DActive.setText("pointer");
    Model2DActive.setCanvasCursor(Model2DActive.text);
    Model2DActive.vec3.set(30, 40, 50);
  }

  private moveHandler(event: MouseEvent) {}
}
