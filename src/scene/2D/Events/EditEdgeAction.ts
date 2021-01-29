import * as PIXI from 'pixi.js';
window.PIXI = PIXI;
import GraphicsTool from '../../../scene/2D/Utils/GraphicsTool';
import Structure from '../../../scene/Model/Home/Structure';
import ConfigStructure from '../../../utils/ConfigStructure';
import Constant from '../../../utils/Math/contanst/constant';
import Point from '../../../utils/Math/geometry/Point';
import Segment from '../../../utils/Math/geometry/Segment';
import Vector2 from '../../../utils/Math/geometry/Vector2';
import MathUtils from '../../../utils/Math/math/MathUtils';
import { AdsorptionTool } from '../../../utils/Math/tool/AdsorptionTool';
import { reaction } from 'mobx';
import Vue from 'vue';
import Model2DActive from '../../../store/Model2DActive';
import BaseEvent from '../../Base/BaseEvent';
import Scene2D from '../index';
import Container = PIXI.Container;
import Graphics = PIXI.Graphics;

interface IColumnSegment {
  seg: Segment;
  structure: Structure;
}

export default class EditEdgeAction extends BaseEvent {
  private _scene2D: Scene2D;
  // @ts-ignore
  private _readSelect: boolean;
  private _css: IColumnSegment[];
  private _vertices!: Point[];
  private currentP: any;
  private _activeLayer: Container;
  private _circleGrp!: Graphics;
  private editSt!: Structure;
  private _textRad!: PIXI.Text;
  private editSeg!: Graphics;

  public constructor(scene2D: Scene2D) {
    super(scene2D.DOMEventListener);
    this._scene2D = scene2D;
    this._activeLayer = new Container();
    this._scene2D.getStage().addChild(this._activeLayer);
    this._css = [];
    reaction(
      () => {
        return Model2DActive.editEdgeState;
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
    Vue.prototype.$message({
      type: 'info',
      message: '请选择基准点后，开始编辑',
    });
    Model2DActive.setCanvasCursor('pointer');
    this._scene2D.pickupController.enable = false;
    this.initSeg();
  }

  /**
   * @author lianbo
   * @date 2020-10-20 16:41:01
   * @Description: 初始化编辑过程中需要编辑的顶点
   */
  private initSeg() {
    const level = this._scene2D.home.curLevel;
    const structures = level.structures;
    for (const structure of structures) {
      if (structure.visible) {
        for (const seg of structure.polygon.edges) {
          const cs: IColumnSegment = { seg: seg, structure: structure };
          this._css.push(cs);
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
    this._css = [];
    this._vertices = [];
  }

  private moveHandler(event: MouseEvent) {
    const distance = (p: Point, other: IColumnSegment) => {
      return other.seg.distanceToPoint(p);
    };
    if (this._readSelect) {
      const { pageX, pageY } = event;
      const pPoint = this._scene2D.pickupController.getPoint(pageX, pageY);
      const point: Point = new Point(pPoint.x, pPoint.y);
      this.currentP = AdsorptionTool.findAdsorptionSeg(
        point,
        this._css,
        distance,
        3
      ).seg;
      if (this.currentP && this.currentP.seg) {
        this.drawHeightLine(this.currentP.seg);
      } else {
        this._circleGrp && this._circleGrp.clear();
      }
    }
  }

  private drawHeightLine(seg: Segment) {
    if (!this._circleGrp) {
      this._circleGrp = new Graphics();
    }
    this._circleGrp.clear();
    GraphicsTool.drawLine(this._circleGrp, seg.start, seg.end, {
      lineWidth: 2,
      color: Constant.colorMap.RED,
      alpha: 0.8,
    });
    if (!this._activeLayer.children.includes(this._circleGrp)) {
      this._activeLayer.addChild(this._circleGrp);
    }
  }

  private tapHandler(event: any) {
    this.editSt && this.editSt.setEdit(false);
    if (this.currentP) {
      this.drawEditLine(this.currentP.seg);
      const structure = this.currentP.structure;
      console.log(this.currentP.seg.center);
      const geoV = ConfigStructure.computeGeo(this.currentP.seg.center);
      Model2DActive.setStructureVec(geoV);
      this.activeStructure(this.currentP);
      const rad = this.currentP.seg.dir.slope;
      Model2DActive.radians = Math.abs(MathUtils.Rad2Deg * rad);
      this.drawSlopeAuxiliary(rad);
    } else {
      this.editSeg && this.editSeg.clear();
      this._textRad.visible = false;
      Vue.prototype.$message({ type: 'error', message: '请选择构建顶点' });
      return;
    }
  }

  private drawSlopeAuxiliary(rad: number) {
    if (!this._textRad) {
      this._textRad = new PIXI.Text('');
      this._textRad.style.fontSize = 13;

      this._textRad.anchor.set(0.5, 0.5);
      this._activeLayer.addChild(this._textRad);
    }
    if (this.currentP) {
      const origin =
        this.currentP.seg.start.y > this.currentP.seg.end.y
          ? this.currentP.seg.start
          : this.currentP.seg.end;
      const ray = origin.translate(new Vector2(100, 0));
      GraphicsTool.drawArrow(
        this.editSeg,
        origin,
        ray,
        5,
        Constant.colorMap.RED
      );
      this.editSeg.moveTo(origin.x + 10, origin.y);
      const drawRad = MathUtils.equal(rad, Math.PI) ? 0 : -Math.abs(rad);
      this.editSeg.lineStyle(1, Constant.colorMap.GREEN);
      this.editSeg.arc(origin.x, origin.y, 10, 0, drawRad, true);
      this._textRad.visible = true;
      this._textRad.text = `${Math.abs(MathUtils.Rad2Deg * drawRad)}°`;
      this._textRad.position.set(origin.x + 15, origin.y - 10);
    }
  }

  private drawEditLine(seg: Segment) {
    if (!this.editSeg) {
      this.editSeg = new Graphics();
    }
    this.editSeg.clear();
    GraphicsTool.drawLine(this.editSeg, seg.start, seg.end, {
      lineWidth: 2,
      color: Constant.colorMap.RED,
      alpha: 0.8,
    });
    if (!this._activeLayer.children.includes(this.editSeg)) {
      this._activeLayer.addChild(this.editSeg);
    }
  }

  /**
   * @author lianbo
   * @date 2020-10-29 16:09:55
   * @Description: 编辑顶点数据
   */
  private activeStructure(editData: any) {
    this.editSt = editData.structure;
    this.editSt.setEdit(true);
    this.editSt.editedSeg = editData.seg;
    Model2DActive.editStructure = this.editSt;
  }
}
