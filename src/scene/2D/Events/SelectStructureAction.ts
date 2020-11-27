import Room from "@/scene/Model/Home/Room";
import ConfigStructure from "@/utils/ConfigStructure";
import LianBoTest from "@/utils/LianBoTest";
import Vector2 from "@/utils/Math/geometry/Vector2";
import { polygon } from "@turf/helpers";
import { reaction } from "mobx";
import Model2DActive from "../../../store/Model2DActive";
import BaseEvent from "../../Base/BaseEvent";
import Structure from "../../Model/Home/Structure";
import Scene2D from "../index";

export default class SelectStructureAction extends BaseEvent {
  private _scene2D: Scene2D;
  private structure!: Structure;
  private _throttle: boolean = true;

  public constructor(scene2D: Scene2D) {
    super(scene2D.DOMEventListener);
    this._scene2D = scene2D;

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
          // LianBoTest.testStructures.push(this.structure);
          // const sts = this._scene2D.home.curLevel.quadTree
          //   .retrieve(this.structure.quadData)
          //   .map((item) => item.data)
          //   .filter((item) => !(item instanceof Room));
          // LianBoTest.testTurfUnion(sts);
        }
      }
    );
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
    console.log(this.structure.boundingPoints);
  }

  private initHotKeyEvents() {
    this.on("keyup", (event: any) => {
      this.structure.doRender();
    });
    this.on("keydown", (event: any) => {
      if (!this.structure) return;
      if (this._throttle) {
        const key = event.key;
        const offset = new Vector2();
        const offsetLength = 1;
        switch (key) {
          case "ArrowUp":
            offset.setY(-offsetLength);
            break;
          case "ArrowDown":
            offset.setY(offsetLength);
            break;
          case "ArrowLeft":
            offset.setX(-offsetLength);
            break;
          case "ArrowRight":
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
}
