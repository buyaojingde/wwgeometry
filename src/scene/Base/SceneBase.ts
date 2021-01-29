import HomePlan2D from '../2D/Layer/HomePlan';
import HomePlan3D from '../3D/HomePlan3D';
import Home from '../Model/Home/Home';
import EventEmitter = PIXI.utils.EventEmitter;

export default abstract class SceneBase extends EventEmitter {
  // member variables here
  protected constructor() {
    super();
    if (!SceneBase._home) {
      SceneBase._home = new Home();
    }
  }

  protected _homePlan!: HomePlan3D | HomePlan2D;

  public get homePlan(): HomePlan3D | HomePlan2D {
    return this._homePlan;
  }

  private static _home: Home;

  public get home(): Home {
    return SceneBase._home;
  }

  public set home(value: Home) {
    SceneBase._home = value;
  }

  public abstract init(): void;

  public abstract clear(): void;

  public abstract save(): void;

  public abstract destroy(): void;

  public load() {
    if (this._homePlan) {
      this._homePlan.load();
    }
  }
}
