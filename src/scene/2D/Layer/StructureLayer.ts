import LayerBase, { LayerName } from "../../Base/LayerBase";
import { IDataObject } from "../../Interface/IDataObject";
import Structure from "../../Model/Home/Structure";
import Structure2D from "../ViewObject/Structure2D";

export default class StructureLayer extends LayerBase {
  protected _layerName = LayerName.Structure;

  public add(dataObj: IDataObject) {
    if (!!dataObj && !this.dataViewMap.has(dataObj)) {
      if (dataObj instanceof Structure) {
        const structure2D: Structure2D = new Structure2D(dataObj);
        const disposeF = (dataObj as Structure).on("destroyLayerData", () => {
          this.remove(dataObj);
        });
        this._disposeArr.push(disposeF);
        this.dataViewMap.set(dataObj, structure2D);
        // this.container.home.curLevel.addStructure(dataObj);
        const stage = this.container.getStage();
        stage.addChild(structure2D);
      }
    }
  }

  /**
   * Desc: clear all objects in this layer.
   */
  public clear(): void {
    if (this.dataViewMap.size > 0) {
      for (const value of this.dataViewMap.keys()) {
        if (value !== undefined) {
          (value as Structure).destroy();
        }
      }
      // this.destroy();
      for (const value of this.dataViewMap.values()) {
        value && (value as any).destroy();
      }
      this.dataViewMap.clear();
    }
  }

  // @ts-ignore
  protected dataViewMap: Map<IDataObject, any>;

  public destroy() {
    super.destroy();
  }

  // @ts-ignore
  public remove(dataObj) {
    if (this.dataViewMap.has(dataObj)) {
      try {
        dataObj.destroy(false);

        this.dataViewMap.delete(dataObj);
        this.container.home.curLevel.removeStructure(dataObj);
      } catch (e) {}
    }
  }

  public render(): void {
    if (!this.container.home.curLevel) {
      return;
    }
    // 对home数据做同步，对dataMap做数据清洗
    for (const dataObj of this.getDatas()) {
      if (
        this.container.home.curLevel &&
        !this.container.home.curLevel.structures.includes(dataObj)
      ) {
        this.remove(dataObj);
      }
    }

    for (const newColumn of this.container.home.curLevel.structures) {
      if (!newColumn) {
        continue;
      }
      this.add(newColumn);
    }
  }

  public constructor(scene: any) {
    super(scene);
    this.init();
    // tslint:disable-next-line:no-string-literal
    // window['Columnlayer'] = () => {
    //   console.log('Columnlayer>>' + this._layerName);
    // };
  }

  /**
   *  路由离开时检查处理数据
   * @param routeName
   */
  public checkLeaveLayerShow(routeName: string) {
    const models = this.getDatas() as Structure[];
    models.forEach((model) => {
      switch (routeName) {
        default:
      }
    });
  }

  protected init() {
    this._layerName = LayerName.Structure;
  }

  /**
   * 根据路由Name检查，当前层的显示状况
   * @param routeName
   */
  protected checkLayerShow(routeName: string) {
    const layerObjects: Structure2D[] = this.getObjects() as Structure2D[];

    layerObjects.forEach((object) => {
      const structure = object.strct;
      if (structure) {
        object.interactive = true;
        object.visible = structure.visible;
      }
    });
  }
}
