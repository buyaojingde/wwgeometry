import EventEmitter = PIXI.utils.EventEmitter;
import AH from "../2D/Utils/AH";
import { IDataObject } from "../Interface/IDataObject";
import { IViewObject } from "../Interface/IViewObject";

const layerEventEmit = new EventEmitter();

export const LayerEvent = layerEventEmit;

export enum LayerName {
  Structure = "column",
  Room = "room",
}

export default abstract class LayerBase extends EventEmitter {
  protected _disposeArr: Array<() => void> = [];
  public container: any;
  protected dataViewMap: Map<IDataObject, IViewObject>;
  protected _loadComplete = false;
  // @ts-ignore
  private disposeFn: () => void;

  public constructor(scene: any) {
    super();
    this.container = scene;
    this.dataViewMap = new Map();

    // 异步执行初始化事件
    setTimeout(() => {
      this.initSyncEvent();
    });
  }

  // @ts-ignore
  protected _layerName: string;

  public get layerName(): string {
    return this._layerName;
  }

  public set layerName(val: string) {
    this._layerName = val;
  }

  public get mapSize(): number {
    return this.dataViewMap.size;
  }

  // @ts-ignore
  public emitEvent(method, ...model) {
    layerEventEmit.emit(this._layerName, { type: method, model });
  }

  public render(): void {}

  public get(key: IDataObject): IViewObject {
    // @ts-ignore
    return this.dataViewMap.get(key);
  }

  public isEmptyMap() {
    return this.dataViewMap.size === 0;
  }

  public add(dataObj: IDataObject) {}

  public remove(dataObj: IDataObject) {}

  public load(): void {}

  public clear(): void {}

  public getDatas(): IDataObject[] {
    return Array.from(this.dataViewMap.keys());
  }

  public getObjects3D(): IViewObject[] {
    return Array.from(this.dataViewMap.values());
  }

  public getMeshListObjects(): IViewObject[] {
    return this.getObjects3D();
  }

  public getObjects(): IViewObject[] {
    return Array.from(this.dataViewMap.values());
  }

  public dispose() {
    this.disposeFn && this.disposeFn();
    this.disposeArr();
  }

  public disposeArr() {
    this._disposeArr.forEach((dispose) => dispose());
    this._disposeArr = [];
  }

  public destroy() {
    // @ts-ignore
    for (const value of this.dataViewMap.values()) {
      value && (value as any).destroy();
    }
    this.container = null;
    this.dispose();
  }

  public clearMap() {
    this.dataViewMap.clear();
  }

  // @ts-ignore
  public removeChild(children, child) {
    AH.remove(children, child);
  }

  /**
   * 响应同步Layer事件
   */
  protected initSyncEvent() {
    // @ts-ignore
    const syncFn = (args) => {
      const { type, model } = args;
      // @ts-ignore
      this[type](...model);
    };
    if (this.container) {
      layerEventEmit.on(this._layerName, syncFn);
      this.disposeFn = () => {
        layerEventEmit.off(this._layerName, syncFn);
      };
    }
  }
}
