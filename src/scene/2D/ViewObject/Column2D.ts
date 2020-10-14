import { computed, reaction } from 'mobx';
import Column from '../../../scene/Model/Home/Column';
import Model2DActive from '../../../store/Model2DActive';
import { IViewObject } from '../../Interface/IViewObject';
import ObserveVector2D from '../../Model/ObserveMath/ObserveVector2D';
import { LayerOrder, layerOrderGroups } from '../Layer/LayerOrder';
import ViewObject from './ViewObject';

// declare function require(moduleName: string): any;
const WALL_ACTIVE_COLOR = 0x10bb88;
export default class Column2D extends ViewObject implements IViewObject {
  get fillGraphics(): PIXI.Graphics {
    return this._fillGraphics;
  }

  set fillGraphics(value: PIXI.Graphics) {
    this._fillGraphics = value;
  }

  protected _lastClickPos: ObserveVector2D = new ObserveVector2D();
  protected wallEdgeGraphics: PIXI.Graphics;

  @computed
  get status() {
    if (Model2DActive.editingModel2D === this || Model2DActive.editingModel === this.column) {
      return 'active';
    }

    return 'default';
  }

  get realHover() {
    return this.isHover && !this.column.isMoving;
  }

  get column(): Column {
    return this._data;
  }

  set column(wall: Column) {
    this._data = wall;
  }

  get wallType(): number {
    return this.column.columnType;
  }

  @computed
  public get fillColor() {
    const wallType = this.wallType;

    let color = 0xff0000;

    if (this.realHover) {
      color = WALL_ACTIVE_COLOR;
    }

    if (this.status === 'active') {
      color = WALL_ACTIVE_COLOR;
    }
    return color;
  }

  @computed
  public get borderColor() {
    if (this.realHover || this.status === 'active') {
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
    return 0.5;
    if (this.status === 'active') {
      return 0.8;
    }
    if (this.realHover) {
      return 0.5;
    }
    return this.replicaOpacity;
  }

  protected _wallType: number;

  // region 标线

  private isDirty: boolean = true;
  private _visible: boolean = true;

  protected _renderCanvas(renderer: PIXI.CanvasRenderer): void {
    super._renderCanvas(renderer);
  }

  public containerRenderWebGL(renderer: PIXI.WebGLRenderer): void {
    super.containerRenderWebGL(renderer);
  }

  public renderCanvas(renderer: PIXI.CanvasRenderer): void {
    super.renderCanvas(renderer);
  }

  constructor(column: Column) {
    super(column);
    this._wallType = -1;
    this.parentGroup = layerOrderGroups[LayerOrder.Column];

    this._disposeArr.push(
      reaction(
        () => this.scaleNum,
        () => this.updateLineWidth(),
        { fireImmediately: true },
      ),
      reaction(
        () => [
          this.realHover,
        ],
        () => this.render(),
      ),
      this._data.once('destroy', this.destroy.bind(this)),
      this._data.on('render', () => this.render()),
      this._data.on('reSelect', () => {
        Model2DActive.setEditingModel(this);
      }),
    );
    this.render();
  }

  public get visible(): boolean {
    return this._visible;
  }

  public set visible(val: boolean) {
    this._visible = val;
  }

  public render() {
    this.clearChildren();

    this.fill();
    this.drawEdges();

    this.initNoteLineEvent();
    // console.log('wall render!');
  }


  public buildBakeData() {
  }

  public showBoundingBox() {
  }

  public load() {
  }

  private _fillGraphics: PIXI.Graphics;

  public fill(fillColor: number = this.fillColor):void {
    this.fillGraphics = new PIXI.Graphics();
    this.fillGraphics.beginFill(fillColor, this.opacity);
    const p0: any = this.column.boundingPoints[0];
    this.fillGraphics.moveTo(p0.x, p0.y);

    this.column.boundingPoints.forEach(point => {
      if (!point) {
        console.log('stop');
      }
      this.fillGraphics.lineTo(point.x, point.y);
    });

    this.fillGraphics.endFill();
    this.addChild(this.fillGraphics);
  }

  public updateLineWidth() {
    const graphics = this.wallEdgeGraphics;
    if (graphics) {
      // graphics.updateLineStyle({ lineWidth: this.scaleNum });
    }
  }

  public drawEdges(borderColor: number = this.borderColor) {
    const graphics = new PIXI.Graphics();
    graphics.lineStyle(this.scaleNum, borderColor, this.borderOpacity);
    const p0 = this.column.boundingPoints[0];
    graphics.moveTo(p0.x, p0.y);
    this.column.boundingPoints.forEach(item => {
      graphics.lineTo(item.x, item.y);
    });
    this.wallEdgeGraphics = graphics;
    this.addChild(graphics);
  }

  private initNoteLineEvent() {
  }

  // endregion
}
