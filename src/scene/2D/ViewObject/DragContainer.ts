import Container = PIXI.Container;
import { computed, observable } from "mobx";
import View2DData from "../../../store/View2DData";
import { IScene2D } from "../../Interface/IScene";

const onDrag: any = {
  // @ts-ignore
  start(event) {
    this.data = event.data;
    this.startPosition = this.data.getLocalPosition(onDrag.getParent(this));
    this.dragging = true;
    event.localPoint = this.startPosition;
    this.emit("input.start", event);
  },
  // @ts-ignore
  end(event) {
    this.dragging = false;
    this.startPosition = null;
    this.data = null;
    this.emit("drag.end", event);
    this.emit("input.end");
  },
  // @ts-ignore
  getParent(self) {
    if (self.parentReal || !self.parent) {
      return self;
    }

    return this.getParent(self.parent);
  },
  // @ts-ignore
  move(callback) {
    // tslint:disable-next-line:space-before-function-paren
    return function () {
      // @ts-ignore
      if (this.dragging) {
        // @ts-ignore
        const parent = onDrag.getParent(this);
        // @ts-ignore
        const newPosition = this.data.getLocalPosition(parent);

        // @ts-ignore
        const startPosition = this.startPosition;

        // @ts-ignore
        this.emit("input.move", newPosition);

        callback(newPosition, startPosition);
      }
    };
  },
};
export default class DragContainer extends PIXI.Graphics {
  public cursor = "pointer";

  // @ts-ignore
  public destroy(...args) {
    super.destroy(...args);
    this._disposeArr.forEach((dispose) => dispose());
    this._disposeArr = [];
    // @ts-ignore
    this._parentSelf = null;
  }

  public interactive = true;
  @observable
  // @ts-ignore
  public _parentSelf: Container = null; // 用于事件响应的parent,不能与原有parent重叠，会出现问题

  @observable
  public isHover = false;
  protected _disposeArr: Array<() => void> = [];

  public constructor() {
    super();

    this.on("added", () => {
      setTimeout(() => {
        this._parentSelf = this.parent;
      });
    });
    this.on("removed", () => {
      setTimeout(() => {
        this._parentSelf = this.parent;
        !this.parent && this.destroy();
      });
    });

    this.on("mouseover", () => {
      this.isHover = true;
    })
      .on("mouseout", () => (this.isHover = false))
      .on("mousedown", onDrag.start)
      .on("touchstart", onDrag.start)
      .on("mouseup", onDrag.end)
      .on("mouseupoutside", onDrag.end)
      .on("touchend", onDrag.end)
      .on("touchendoutside", onDrag.end)
      .on(
        "mousemove",
        // @ts-ignore
        onDrag.move((...args) => {
          this.emit("drag", ...args);
        })
      )
      .on(
        "touchmove",
        // @ts-ignore
        onDrag.move((...args) => {
          this.emit("drag", ...args);
        })
      );
  }

  public get scene2D(): IScene2D {
    // @ts-ignore
    const getScene = (instance) => {
      if (!instance) {
        return null;
      }
      return instance.name === "scene2D"
        ? instance
        : getScene(instance._parentSelf || instance.parent);
    };

    return getScene(this._parentSelf);
  }
}
