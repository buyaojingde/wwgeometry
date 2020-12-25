import GraphicsTool from '../../../scene/2D/Utils/GraphicsTool';
import Room from '../../../scene/Model/Home/Room';
import LianBoTest from '../../../utils/LianBoTest';
import Constant from '../../../utils/Math/contanst/constant';
import Box from '../../../utils/Math/geometry/Box';
import { reaction } from 'mobx';
import Model2DActive from '../../../store/Model2DActive';
import BaseEvent from '../../Base/BaseEvent';
import Scene2D from '../index';
import Container = PIXI.Container;

export default class SelectRoomAction extends BaseEvent {
  private _scene2D: Scene2D;
  private room!: Room;
  private _grp!: PIXI.Graphics;
  private _activeLayer: PIXI.Container;

  public constructor(scene2D: Scene2D) {
    super(scene2D.DOMEventListener);
    this._scene2D = scene2D;
    this._activeLayer = new Container();
    this._scene2D.getStage().addChild(this._activeLayer);
    this._grp = new PIXI.Graphics();
    this._activeLayer.addChild(this._grp);
    reaction(
      () => {
        return Model2DActive.selection;
      },
      (edit) => {
        const enable = edit instanceof Room;
        if (edit instanceof Room) {
          if (this.room !== edit && this.room) {
          }
          this.room = edit;
        }
        this.enable = enable;
        if (this.enable) {
          this.onStart();
        } else {
          this.onEnd();
        }
      }
    );
  }

  public initEvents() {
    // this.debugColumn();
    // this.disposeArr.push(
    //   when(
    //     () => !Model2DActive.selectStructure,
    //     () => {
    //       Model2DActive.setSelectStructure(null);
    //     },
    //   ),
    // );
  }

  private onStart() {
    // this.room.relStructures.forEach((st) => st.setEdit(true));
    // this.drawOffsetRoom();
    this.drawSeg();
  }

  private drawSeg() {
    const sts = this.room.allSts();
    for (const st of sts) {
      for (const grpElement of st.roomRels) {
        if (grpElement.room !== this.room) continue;
        const segs = grpElement.segs;
        for (const seg of segs) {
          GraphicsTool.drawLine(this._grp, seg.start, seg.end, {
            color: Constant.colorRandom(),
            lineWidth: 3,
          });
        }
      }
    }
  }

  private scale = 10000;

  private drawBox() {
    if (!this._grp) {
      this._grp = new PIXI.Graphics();
      this._activeLayer.addChild(this._grp);
    }
    const poly = this.room.polygon;
    if (!poly.similarBox()) {
      console.log('不可切房间！！！');
    } else {
      poly.optimize();
      const boxs: Box[] = poly.cutBox();
      boxs.forEach((item, index) => {
        const boxTxt = new PIXI.Text('');
        this._activeLayer.addChild(boxTxt);
        boxTxt.style.fontSize = 13;

        boxTxt.anchor.set(0.5, 0.5);
        boxTxt.position.set(item.center.x, item.center.y);
        boxTxt.text = `box${index}`;
        GraphicsTool.drawBox(this._grp, item);
      });
    }
  }

  private onEnd() {
    if (!this._grp) return;
    this._grp.clear();
    // this.room && this.room.allSts().forEach((st) => st.setEdit(false));
  }
}
