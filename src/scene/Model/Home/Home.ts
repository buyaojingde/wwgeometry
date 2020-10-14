import { observable } from 'mobx';
import ObjectNamed from '../BaseInterface/ObjectNamed';
import Level from './Level';


interface IAreaItem {
  area?: number;
  id?: number;
  name?: string;
  num?: number;
  type?: number;
  type2?: number;
  typeName?: string;
}

export default class Home extends ObjectNamed {

  get curLevelIndex(): number {
    this._curLevelIndex = this.levels.indexOf(this.curLevel);
    return this._curLevelIndex;
  }

  set curLevelIndex(value: number) {
    this._curLevelIndex = value;
    this.curLevel = this.levels[this._curLevelIndex];
  }

  @observable
  private _levels: Level[];

  private _cameraView: any;
  private _switches: any[];
  private _textureIDs: number[];

  @observable
  private _curLevel: Level;

  private _curLevelIndex: number = 0;

  constructor() {
    super();
    this._levels = [];
    this._switches = [];
    // this.addLevel(new Level());
    this._levels.push(new Level()); // 为什么这里要这样搞，我也想问问
    this._curLevel = null;

    this._textureIDs = [];
  }

  get levels(): Level[] {
    return this._levels;
  }

  set levels(param1: Level[]) {
    this._levels = param1;
  }

  get curLevel(): Level {
    return this._curLevel || this.levels[0];
  }

  set curLevel(level: Level) {
    if (level !== this.curLevel) {
      this._curLevel = level;
    }
  }

  get curDownLevel(): Level {
    try {
      const idx = this.levels.indexOf(this.curLevel);
      return this.levels[idx - 1];
    } catch (e) {
      return null;
    }
  }

  get cameraView(): any {
    return this._cameraView;
  }

  set cameraView(value: any) {
    this._cameraView = value;
  }

  get switches(): any[] {
    return this._switches;
  }

  set switches(value: any[]) {
    this._switches = value;
  }

  public getWallAreaTotal(): number {
    let totalWallArea: number = 0;
    return totalWallArea;
  }

  public clear() {
    if (this._levels) {
      this._levels.length = 0;
    }
    this._cameraView = null;
    // if (this._lightViews) this._lightViews.length = 0

    if (this._switches) {
      this._switches.length = 0;
    }

    this._curLevel = null;
  }

  public addLevel(level: Level) {
    if (this.levels.indexOf(level) === -1) {
      this.levels.push(level);
    }

    return this.levels.indexOf(level);
  }

  /**
   * @Description: 删除楼层
   * @author
   * @data 2019/12/25
   */
  public removeLevel(index: number) {
    // if (!this.levels[index]) {
    //   throw new Error('删除楼层不存在');
    // }
    //
    // if (index === 0 || this.levels.length <= 1) {
    //   throw new Error('不能删除当前楼层');
    // }
    //
    // if (this.levels[index] === this.curLevel) {
    //   this.curLevel.destroy();
    //   // 切换上一次或第一层
    //   this.switchLevel(index - 1);
    // }

    this.levels.splice(index, 1);
  }

  public addTextureID(val: number) {
    if (val && val !== undefined && !this.textureIDs.includes(val)) {
      this.textureIDs.push(val);
      return true;
    }
    return false;
  }

  public get textureIDs(): number[] {
    return this._textureIDs;
  }

  public clearTextureIDs() {
    this._textureIDs = [];
  }
}
