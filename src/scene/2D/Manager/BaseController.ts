/**
 * * by lianbo.guo
 **/
import BaseEvent from "../../2D/Events/Base";

export default abstract class BaseController extends BaseEvent {
  // protected controllerGroup: PIXI.display.Group;
  protected scene: any;

  public constructor(scene: any) {
    super(scene.DOMEventListener);

    this.scene = scene;

    this._stage = scene.getStage();
  }

  private _stage: PIXI.Container;

  get stage(): PIXI.Container {
    return this.scene.getStage();
  }
}
