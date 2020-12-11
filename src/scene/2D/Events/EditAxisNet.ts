import { reaction } from "mobx";
import Model2DActive from "../../../store/Model2DActive";
import BaseEvent from "../../Base/BaseEvent";
import Scene2D from "../index";

export default class EditAxisNet extends BaseEvent {
  public constructor(scene2D: Scene2D) {
    super(scene2D.DOMEventListener);
    reaction(
      () => {
        return Model2DActive.editAxisNet;
      },
      (state) => {
        this.enable = state;
        if (this.enable) {
          this.start();
        } else {
          this.end();
        }
      }
    );
  }

  public initEvents(): void {
    this.on("panstart", (event: any) => this.startMove(event));
    this.on("panmove", (event: any) => this.moving(event));
    this.on("paneup", (event: any) => this.endMove(event));
  }

  private start() {}

  private end() {}

  private startMove(event: any) {}

  private moving(event: any) {}

  private endMove(event: any) {}
}