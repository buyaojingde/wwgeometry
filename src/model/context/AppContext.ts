
export default class AppContext {
  /** 默认墙高/层高 */
  private _wallHeight: number;
  private _clientVersion: string;

  private static _appContext: AppContext;

  constructor() {
    this._wallHeight = 280;
  }

  public static getInstance(): AppContext {
    if (!this._appContext) {
      this._appContext = new AppContext();
    }

    return this._appContext;
  }

  get version() {
    return this._clientVersion;
  }

  set version(ver: string) {
    this._clientVersion = ver;
  }
}
