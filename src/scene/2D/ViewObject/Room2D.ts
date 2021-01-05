import { computed, reaction } from 'mobx';
import Model2DActive from '../../../store/Model2DActive';
import Constant from '../../../utils/Math/contanst/constant';
import Room from '../../Model/Home/Room';
import GraphicsTool from '../Utils/GraphicsTool';
import ViewObject from './ViewObject';

export default class Room2D extends ViewObject {
  constructor(room: Room) {
    super(room);
    let i = 0;
    while (i < this.room.virtualWalls.length) {
      const wallGrp = new PIXI.Graphics();
      this.addChild(wallGrp);
      wallGrp.interactive = true;
      this._virtualWalls.push(wallGrp);
      i++;
    }
    this.visible = room.visible;
    // this.parentGroup = layerOrderGroups[LayerOrder.Room];
    this.customRender();
    reaction(
      () => [this.active, this.isVis],
      () => {
        this.customRender();
      }
    );
    reaction(
      () => this.wallVisible,
      () => {
        this.renderVirtualWall();
      }
    );
  }

  @computed
  public get wallVisible(): boolean[] {
    return this.room.virtualWalls.map((item) => item.visible);
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
  private _active = false;
  private _virtualWalls: PIXI.Graphics[] = [];

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
    this._grp.beginFill(fillColor, 0.2);
    GraphicsTool.drawPolygon(this._grp, this.room.boundary, {
      color: fillColor,
      alpha: 0.2,
    });
    this._grp.endFill();
    this._grp.lineStyle(3, Constant.colorMap.GREEN, 1);
    // GraphicsTool.drawPolygon(this._grp, this.room.boundary);
    if (!this._roomText) {
      this._roomText = new PIXI.Text('');
      this._roomText.style.fontSize = 9;

      this._roomText.anchor.set(0.5, 0.5);
      // this._roomText.parentGroup = layerOrderGroups[LayerOrder.Camera];
      this.addChild(this._roomText);
    }
    const roomCentroid = this.room.polygon.centroid();
    this._roomText.visible = true;
    this._roomText.text = `${this.room.rvtName}\n${this.room.rvtId}`;
    this._roomText.position.set(roomCentroid.x, roomCentroid.y);
    this.drawVirtualWall();
  }

  private drawVirtualWall() {
    let i = 0;
    while (i < this._virtualWalls.length) {
      const grp = this._virtualWalls[i];
      grp.visible = this.wallVisible[i];
      const wall = this.room.virtualWalls[i];
      const line = wall.wall;
      GraphicsTool.drawLine(grp, line.start, line.end, {
        lineWidth: wall.width,
        color: 0xff0000,
        alignment: 1,
      });
      // grp.on('');
      i++;
    }
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

  private renderVirtualWall() {
    for (let i = 0; i < this._virtualWalls.length; i++) {
      this._virtualWalls[i].visible = this.wallVisible[i];
    }
  }
}
