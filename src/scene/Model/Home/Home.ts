import ObjectNamed from '../BaseInterface/ObjectNamed';
import Level from './Level';

export default class Home extends ObjectNamed {
  private _levelIdx: number;
  private _cameraView: any;
  private _textureIDs: number[];

  constructor() {
    super();
    this._levels = [];
    this._textureIDs = [];
    this._levelIdx = 0;
  }

  private _levels: Level[];

  get levels(): Level[] {
    return this._levels;
  }

  set levels(param1: Level[]) {
    this._levels = param1;
  }

  get curLevel(): Level {
    return this.levels[this._levelIdx];
  }

  public clear() {
    if (this._levels) {
      this._levels.length = 0;
    }
    this._cameraView = null;
  }
}
