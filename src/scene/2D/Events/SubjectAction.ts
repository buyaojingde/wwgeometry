import { reaction } from 'mobx';
import Vue from 'vue';
import Model2DActive from '../../../store/Model2DActive';
import ConfigStructure from '../../../utils/ConfigStructure';
import Constant from '../../../utils/Math/contanst/constant';
import Point from '../../../utils/Math/geometry/Point';
import { AdsorptionTool } from '../../../utils/Math/tool/AdsorptionTool';
import BaseEvent from '../../Base/BaseEvent';
import Scene2D from '../index';
import Container = PIXI.Container;
import Graphics = PIXI.Graphics;

export default class SubjectAction extends BaseEvent {
  private _scene2D: Scene2D;
  private _readSelect = false;
  private _vertices: any[];
  private _adsorbP!: Point | null;
  private _activeLayer: Container;
  private _circleGrp!: Graphics;

  public constructor(scene2D: Scene2D) {
    super(scene2D.DOMEventListener);
    this._scene2D = scene2D;
    this._activeLayer = new Container();
    this._scene2D.getStage().addChild(this._activeLayer);
    this._vertices = [];
    reaction(
      () => {
        return Model2DActive.subjectState;
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
    this.on('input.move', (event: any) => this.moveHandler(event));
    this.on('tap', (event: any) => this.tapHandler(event));
  }

  private start() {
    Vue.prototype.$message({ type: 'info', message: '请选择基准点' });
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
      for (const v of structure.boundary) {
        const vs: any = {};
        vs.point = v;
        vs.structure = structure;
        this._vertices.push(vs);
      }
    }
  }

  private end() {
    // this._activeLayer.removeChildren();
    // Model2DActive.subject = null;
    Model2DActive.setCanvasCursor('default');
    this._scene2D.pickupController.enable = true;
    this._vertices = [];
  }

  private moveHandler(event: MouseEvent) {
    const distance = (p: Point, other: any) => {
      return p.distanceToPointSquared(other.point);
    };
    if (this._readSelect) {
      const { pageX, pageY } = event;
      const pPoint = this._scene2D.pickupController.getPoint(pageX, pageY);
      const point: Point = new Point(pPoint.x, pPoint.y);
      const result = AdsorptionTool.findAdsorptionPoint(
        point,
        this._vertices,
        distance
      );
      if (result) {
        this._adsorbP = result.point;
        if (this._adsorbP) {
          this.drawCircle(this._adsorbP);
        }
      } else {
        this._adsorbP = null;
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
    if (this._adsorbP) {
      this._circleGrp.clear();
      const geoP = ConfigStructure.computeGeo(this._adsorbP);
      Model2DActive.subjectVec3.copy(geoP);
      // this._scene2D.updateCoordinate();
    } else {
      Vue.prototype.$message({ type: 'error', message: '请选择基准点' });
      return;
    }
  }
}
