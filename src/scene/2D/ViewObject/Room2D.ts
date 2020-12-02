import { computed, reaction } from "mobx";
import Model2DActive from "../../../store/Model2DActive";
import Constant from "../../../utils/Math/contanst/constant";
import Room from "../../Model/Home/Room";
import { LayerOrder, layerOrderGroups } from "../Layer/LayerOrder";
import GraphicsTool from "../Utils/GraphicsTool";
import ViewObject from "./ViewObject";

export default class Room2D extends ViewObject {
  constructor(room: Room) {
    super(room);
    this.visible = room.visible;
    this.parentGroup = layerOrderGroups[LayerOrder.Room];
    this.customRender();
    reaction(
      () => [this.active, this.isVis],
      () => {
        this.customRender();
      }
    );
  }
  @computed
  public get active(): boolean {
    return this._data === Model2DActive.selection;
  }
  @computed
  get isVis(): boolean {
    return this._data.visible;
  }

  public get room(): Room {
    return this._data;
  }
  private _grp!: PIXI.Graphics;
  private _roomText!: PIXI.Text;
  private _active: boolean = false;

  public customRender() {
    this.visible = this.isVis;
    if (!this.visible) return;
    if (!this._grp) {
      this._grp = new PIXI.Graphics();
      this.addChild(this._grp);
    }
    this._grp.clear();
    const fillColor = this.active
      ? Constant.colorMap.BLUE
      : Constant.colorMap.GRAY;
    this._grp.beginFill(fillColor, 0.1);
    GraphicsTool.drawPolygon(this._grp, this.room.boundary);
    this._grp.endFill();
    this._grp.lineStyle(3, Constant.colorMap.GREEN, 1);
    GraphicsTool.drawPolygon(this._grp, this.room.boundary);
    if (!this._roomText) {
      this._roomText = new PIXI.Text("");
      this._roomText.style.fontSize = 9;

      this._roomText.anchor.set(0.5, 0.5);
      // this._roomText.parentGroup = layerOrderGroups[LayerOrder.Camera];
      this.addChild(this._roomText);
    }
    const roomCentroid = this.room.polygon.centroid();
    this._roomText.visible = true;
    this._roomText.text = `${this.room.rvtName}\n${this.room.rvtId}`;
    this._roomText.position.set(roomCentroid.x, roomCentroid.y);
  }

  private drawEdge() {
    if (!this._grp) {
      this._grp = new PIXI.Graphics();
      this.addChild(this._grp);
    }
    this._grp.lineStyle(2, Constant.colorMap.Yellow, 1);
    GraphicsTool.drawPolygon(this._grp, this.room.boundary);
  }

  public destroy() {
    super.destroy();
  }
}
