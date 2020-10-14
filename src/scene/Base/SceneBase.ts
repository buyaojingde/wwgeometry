import HomePlan2D from '../2D/Layer/HomePlan';
import EventEmitter = PIXI.utils.EventEmitter;
import Home from '../Model/Home/Home';

export default abstract class SceneBase extends EventEmitter {
  // member variables here
  protected _homePlan: HomePlan2D;
  private static _home: Home;

  protected constructor() {
    super();
    if (!SceneBase._home) {
      SceneBase._home = new Home();
    }
  }

  public get homePlan(): HomePlan2D {
    return this._homePlan;
  }

  public init() {}

  public clear() {}

  public save() {}

  public destroy() {}

  public load() {
    if (this._homePlan) {
      this._homePlan.load();
    }
  }

  public get home(): Home {
    return SceneBase._home;
  }

  public set home(value: Home) {
    SceneBase._home = value;
  }
}
