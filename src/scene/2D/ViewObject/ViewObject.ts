import { IViewObject } from "../../Interface/IViewObject";
import DragContainer from "./DragContainer";

export default abstract class ViewObject
  extends DragContainer
  implements IViewObject {
  protected _data: any;

  protected constructor(model: any) {
    super();
    this._data = model;
  }

  protected _lastClickPos: any;

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

  public get model() {
    return this._data;
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
      console.warn("destroy error", e);
    }
  }

  public load(): void {}

  public showBoundingBox(bShow: boolean): void {}

  protected clearChildren() {
    this.children.forEach((child) => child.destroy());
    this.removeChildren();
  }
}
