import { reaction } from 'mobx';
import Model2DActive from '../../../store/Model2DActive';
import ConfigStructure from '../../../utils/ConfigStructure';
import Constant from '../../../utils/Math/contanst/constant';
import Vector2 from '../../../utils/Math/geometry/Vector2';
import BaseEvent from '../../Base/BaseEvent';
import Structure from '../../Model/Home/Structure';
import Scene2D from '../index';
import GraphicsTool from '../Utils/GraphicsTool';

export default class SelectStructureAction extends BaseEvent {
  private _scene2D: Scene2D;
  private structure!: Structure;
  private _throttle = true;
  private _grp: PIXI.Graphics;
  private _activeLayer: PIXI.Container;

  public constructor(scene2D: Scene2D) {
    super(scene2D.DOMEventListener);
    this._scene2D = scene2D;
    this._activeLayer = new PIXI.Container();
    scene2D.getStage().addChild(this._activeLayer);
    this._grp = new PIXI.Graphics();
    this._activeLayer.addChild(this._grp);

    reaction(
      () => {
        return Model2DActive.selection;
      },
      (edit) => {
        const enable = edit instanceof Structure;
        if (edit instanceof Structure) {
          if (this.structure !== edit && this.structure) {
          }
          this.structure = edit;
        }
        this.enable = enable;
        if (this.enable) {
          const position = this.structure.position;
          const geoPos = ConfigStructure.computeGeo(position);
          Model2DActive.setStructureVec(geoPos);
          Model2DActive.editStructure = this.structure;
          // this.drawRoomEdge();
          // LianBoTest.testStructures.push(this.structure);
          // const sts = this._scene2D.home.curLevel.quadTree
          //   .retrieve(this.structure.quadData)
          //   .map((item) => item.data)
          //   .filter((item) => !(item instanceof Room));
          // LianBoTest.testTurfUnion(sts);
        } else {
          this.onEnd();
        }
      }
    );
  }

  private drawRoomEdge() {
    const roomDatas = this.structure.roomRels;
    for (const roomData of roomDatas) {
      GraphicsTool.drawLines(this._grp, roomData.segs, {
        color: Constant.colorRandom(),
        lineWidth: 3,
      });
    }
  }

  public initEvents() {
    // this.debugColumn();
    this.initHotKeyEvents();
    // this.disposeArr.push(
    //   when(
    //     () => !Model2DActive.selectStructure,
    //     () => {
    //       Model2DActive.setSelectStructure(null);
    //     },
    //   ),
    // );
  }

  debugColumn() {
    console.log(this.structure.boundary);
  }

  private initHotKeyEvents() {
    this.on('keyup', (event: any) => {
      this.structure.doRender();
    });
    this.on('keydown', (event: any) => {
      if (!this.structure) return;
      if (this._throttle) {
        const key = event.key;
        const offset = new Vector2();
        const offsetLength = 1;
        switch (key) {
          case 'ArrowUp':
            offset.setY(-offsetLength);
            break;
          case 'ArrowDown':
            offset.setY(offsetLength);
            break;
          case 'ArrowLeft':
            offset.setX(-offsetLength);
            break;
          case 'ArrowRight':
            offset.setX(offsetLength);
            break;
        }

        this.structure.move(offset);
        this._throttle = false;
        setTimeout(() => {
          this._throttle = true;
        }, 0.1);
      }
      console.log(event);
    });
  }

  private onEnd() {
    this._grp.clear();
  }
}
