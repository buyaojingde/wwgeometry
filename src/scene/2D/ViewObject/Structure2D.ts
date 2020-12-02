import { computed, reaction } from "mobx";
import Model2DActive from "../../../store/Model2DActive";
import Constant from "../../../utils/Math/contanst/constant";
import { IViewObject } from "../../Interface/IViewObject";
import Structure, { StType } from "../../Model/Home/Structure";
import ObserveVector2D from "../../Model/ObserveMath/ObserveVector2D";
import { LayerOrder, layerOrderGroups } from "../Layer/LayerOrder";
import GraphicsTool from "../Utils/GraphicsTool";
import ViewObject from "./ViewObject";

// declare function require(moduleName: string): any;
const WALL_ACTIVE_COLOR = 0x10bb88;
export default class Structure2D extends ViewObject implements IViewObject {
  protected _lastClickPos: ObserveVector2D = new ObserveVector2D();
  protected edgeGraphics!: PIXI.Graphics;

  constructor(structure: Structure) {
    super(structure);
    this.visible = structure.visible;
    this.parentGroup = layerOrderGroups[LayerOrder.Structure];
    this._disposeArr.push(
      reaction(
        () => this.scaleNum,
        () => this.updateLineWidth(),
        { fireImmediately: true }
      ),
      reaction(
        () => [this.changeColor, this.active, this.isEdit, this.isVis],
        () => this.customRender()
      ),
      this._data.once("destroy", this.destroy.bind(this)),
      this._data.on("render", () => this.customRender()),
      this._data.on("drawMid", this.drawMid.bind(this))
    );
    this.customRender();
  }

  @computed
  get active(): boolean {
    return this._data === Model2DActive.selection;
  }

  @computed
  get isVis(): boolean {
    return this._data.visible;
  }

  @computed
  get isEdit(): boolean {
    return this._data.isEdit;
  }

  get changeColor() {
    return (
      this.isHover && !this.strct.isMoving && !Model2DActive.editVertexState
    );
  }

  get strct(): Structure {
    return this._data;
  }

  set strct(structure: Structure) {
    this._data = structure;
  }

  get cType(): string {
    return this.strct.stType;
  }

  @computed
  public get fillColor() {
    let color = 0x8a8a8a;
    switch (this.cType) {
      case StType.Wall:
        color = Constant.colorHexNumber("#FFD700"); // 金色 0xFFD700
        break;
      case StType.PCWall:
        color = Constant.colorHexNumber("#FF5F12"); //#FF5F12
        break;
      case StType.Framing:
        color = Constant.colorHexNumber("#2e564b"); // 灰色
        break;
      case StType.Column:
        color = Constant.colorHexNumber("#000000");
        break;
      case StType.Door:
        color = Constant.colorHexNumber("#329908");
        break;
      case StType.Window:
        color = Constant.colorHexNumber("#0f719d");
        break;
    }
    if (this.changeColor) {
      color = WALL_ACTIVE_COLOR;
    }
    if (this.active) {
      color = 0x317f31;
    }

    if (this.isEdit) {
      color = 0x00ff00;
    }

    return color;
  }

  @computed
  public get borderColor() {
    if (this.changeColor) {
      return WALL_ACTIVE_COLOR;
    }
    return 0x808b94;
  }

  public get replicaOpacity() {
    return 1;
  }

  public get borderOpacity() {
    return 0.5;
  }

  public get opacity(): number {
    if (this.changeColor) {
      return 0.5;
    }
    switch (this.cType) {
      case "OST_Walls":
        return 0.8;
      case "OST_GenericModel":
        return 0.7;
      case "OST_StructuralFraming":
        return 0.3;
      case "OST_StructuralColumns":
        return 1.0;
    }
    return this.replicaOpacity;
  }

  private _fillGraphics!: PIXI.Graphics;

  // region 标线

  get fillGraphics(): PIXI.Graphics {
    return this._fillGraphics;
  }

  set fillGraphics(value: PIXI.Graphics) {
    this._fillGraphics = value;
  }

  public containerRenderWebGL(renderer: PIXI.Renderer): void {
    super.containerRenderWebGL(renderer);
  }

  drawMid(arg: any) {
    const startSeg = this.strct.box.edges[arg[0]].center;
    const endSeg = this.strct.box.edges[arg[1]].center;
    this.edgeGraphics.moveTo(startSeg.x, startSeg.y);
    this.edgeGraphics.lineTo(endSeg.x, endSeg.y);
  }

  public customRender() {
    // this.interactive = this.isVis; // 隐藏时将interactive 置为false
    this.visible = this.isVis;
    this.clearChildren();

    this.fill();
    this.drawEdges();
  }

  public fill(fillColor: number = this.fillColor): void {
    this.fillGraphics = new PIXI.Graphics();
    this.fillGraphics.beginFill(fillColor, this.opacity);
    const p0: any = this.strct.boundingPoints[0];
    this.fillGraphics.moveTo(p0.x, p0.y);

    this.strct.boundingPoints.forEach((point) => {
      if (!point) {
        console.log("stop");
      }
      this.fillGraphics.lineTo(point.x, point.y);
    });

    this.fillGraphics.endFill();
    this.addChild(this.fillGraphics);
  }

  public updateLineWidth() {
    const graphics = this.edgeGraphics;
    if (graphics) {
      // graphics.updateLineStyle({ lineWidth: this.scaleNum });
    }
  }

  public drawEdges(borderColor: number = this.borderColor) {
    if (!this.edgeGraphics) {
      this.edgeGraphics = new PIXI.Graphics();
    }
    this.edgeGraphics.clear();
    this.edgeGraphics.lineStyle(0.5, borderColor, this.borderOpacity);
    const p0 = this.strct.boundingPoints[0];
    this.edgeGraphics.moveTo(p0.x, p0.y);
    this.strct.boundingPoints.forEach((item) => {
      this.edgeGraphics.lineTo(item.x, item.y);
    });
    if (this.strct.midSeg && this.strct.midSeg.start && this.strct.midSeg.end) {
      GraphicsTool.drawDashedLine(
        this.edgeGraphics,
        this.strct.midSeg.start,
        this.strct.midSeg.end,
        10
      );
    }
    if (!this.children.includes(this.edgeGraphics)) {
      this.addChild(this.edgeGraphics);
    }
  }

  // endregion
}
