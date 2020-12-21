import { reaction } from 'mobx';
import Vue from 'vue';
import Model2DActive from '../../../store/Model2DActive';
import Constant from '../../../utils/Math/contanst/constant';
import Point from '../../../utils/Math/geometry/Point';
import { AdsorptionTool } from '../../../utils/Math/tool/AdsorptionTool';
import BaseEvent from '../../Base/BaseEvent';
import Structure from '../../Model/Home/Structure';
import Scene2D from '../index';
import Container = PIXI.Container;
import Graphics = PIXI.Graphics;

interface IColumnVertices {
  vertex: Point;
  structure: Structure;
}

export default class EditVerticesAction extends BaseEvent {
  private _scene2D: Scene2D;
  // @ts-ignore
  private _readSelect: boolean;
  private _vertices: IColumnVertices[];
  // @ts-ignore
  private currentP: IColumnVertices;
  private _activeLayer: Container;
  // @ts-ignore
  private _circleGrp: Graphics;
  // @ts-ignore
  private editSt: Structure;

  public constructor(scene2D: Scene2D) {
    super(scene2D.DOMEventListener);
    this._scene2D = scene2D;
    this._activeLayer = new Container();
    this._scene2D.getStage().addChild(this._activeLayer);
    this._vertices = [];
    reaction(
      () => {
        return Model2DActive.editVertexState;
      },
      (state) => {
        this.enable = state;
        this._readSelect = true;
        if (this.enable) {
          this.start();
        } else {
          this.end();
        }
      }
    );
  }

  public initEvents(): void {
    // @ts-ignore
    this.on('input.move', (event) => this.moveHandler(event));
    // @ts-ignore
    this.on('tap', (event) => this.tapHandler(event));
  }

  private start() {
    Model2DActive.setCanvasCursor('pointer');
    this._scene2D.pickupController.enable = false;
    this.initVertices();
  }

  /**
   * @author lianbo
   * @date 2020-10-20 16:41:01
   * @Description: 初始化编辑过程中需要编辑的顶点
   */
  private initVertices() {
    const level = this._scene2D.home.curLevel;
    const structures = level.structures;
    for (const structure of structures) {
      if (structure.visible) {
        for (const v of structure.boundary) {
          const vc: IColumnVertices = { vertex: v, structure: structure };
          this._vertices.push(vc);
        }
      }
    }
  }

  private end() {
    this._activeLayer.removeChildren();
    this.editSt && this.editSt.setEdit(false);
    Model2DActive.setCanvasCursor('default');
    this._scene2D.pickupController.enable = true;
    this._scene2D.editStructure.structure = null;
    this._scene2D.editStructure.index = null;
    this._vertices = [];
  }

  private moveHandler(event: MouseEvent) {
    const distance = (p: Point, other: IColumnVertices) => {
      return p.distanceToPointSquared(other.vertex);
    };
    if (this._readSelect) {
      const { pageX, pageY } = event;
      const pPoint = this._scene2D.pickupController.getPoint(pageX, pageY);
      const point: Point = new Point(pPoint.x, pPoint.y);
      this.currentP = AdsorptionTool.findAdsorptionPoint(
        point,
        this._vertices,
        distance
      );
      if (this.currentP) {
        this.drawCircle(this.currentP.vertex);
      } else {
        this._circleGrp && this._circleGrp.clear();
      }
    }
  }

  private drawCircle(p: Point) {
    if (!this._circleGrp) {
      this._circleGrp = new Graphics();
    }
    this._circleGrp.clear();
    this._circleGrp.beginFill(Constant.colorMap.BLUE, 0.8);
    this._circleGrp.drawCircle(p.x, p.y, 5);
    this._circleGrp.endFill();
    this._activeLayer.addChild(this._circleGrp);
  }

  private tapHandler(event: any) {
    let geoV;
    this.editSt && this.editSt.setEdit(false);
    if (this.currentP) {
      const structure = this.currentP.structure;
      const idx = structure.boundary.indexOf(this.currentP.vertex);
      if (idx !== -1) {
        geoV = structure.topFaceGeo[idx];
        Model2DActive.setStructureVec(geoV);
        this.activeStructure(structure, idx);
      } else {
        console.error('why?');
      }
    } else {
      Vue.prototype.$message({ type: 'error', message: '请选择构建顶点' });
      return;
    }
  }

  /**
   * @author lianbo
   * @date 2020-10-29 16:09:55
   * @Description: 编辑顶点数据
   */
  private activeStructure(st: Structure, index: number) {
    this.editSt = st;
    this._scene2D.editStructure.structure = st;
    this._scene2D.editStructure.index = index;
    this._scene2D.editStructure.structure.setEdit(true);
  }
}
