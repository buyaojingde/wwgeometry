import { IViewObject } from '../../Interface/IViewObject';
import DragContainer from './DragContainer';

export default abstract class ViewObject extends DragContainer implements IViewObject {
  protected _data: any;
  protected _lastClickPos: any;

  public constructor(model: any) {
    super();
    this._data = model;
  }

  public destroy() {
    super.destroy();
    try {
      // 释放监听话柄
      // while (this._disposeArr.length) {
      //   const dispose = this._disposeArr.pop();

      //   dispose && dispose();
      // }

      if (this._data) {
        this._data = null;
      }
      // this.parent && this.parent.removeChild(this);
    } catch (e) {
      console.warn('destroy error', e);
    }
  }

  public load(): void {}

  public showBoundingBox(bShow: boolean): void {}

  public get model() {
    return this._data;
  }

  protected clearChildren() {
    this.children.forEach(child => child.destroy());
    this.removeChildren();
  }

  /**
   * 最后一次点击的位置
   * @returns {ObserveVector2D}
   */
  public get lastClickPos(): any {
    return this._lastClickPos;
  }

  public set lastClickPos(vec: any) {
    if (!this._lastClickPos) {
      this._lastClickPos = vec;
    } else {
      this._lastClickPos.copy(vec);
    }
  }
}
