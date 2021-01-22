import SceneBase from '../Base/SceneBase';

export default class Scene3D extends SceneBase {
  private static _instance: Scene3D; // 静态单例
  static getInstance() {
    if (!this._instance) {
      this._instance = new Scene3D();
      this._instance.init();
    }
    return this._instance;
  }

  public init() {
    console.log('init');
  }
}
