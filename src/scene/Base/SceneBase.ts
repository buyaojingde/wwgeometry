import * as PIXI from 'pixi.js';
window.PIXI = PIXI;
import HomePlan2D from '../2D/Layer/HomePlan';
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

  // @ts-ignore
  protected _homePlan: HomePlan2D;

  public get homePlan(): HomePlan2D {
    return this._homePlan;
  }

  private static _home: Home;

  public get home(): Home {
    return SceneBase._home;
  }

  public set home(value: Home) {
    SceneBase._home = value;
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
}
