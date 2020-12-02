import LayerBase, { LayerName } from "../../Base/LayerBase";
import { IDataObject } from "../../Interface/IDataObject";
import Room from "../../Model/Home/Room";
import Room2D from "../ViewObject/Room2D";

export default class RoomLayer extends LayerBase {
  protected _layerName = LayerName.Room;

  public add(dataObj: IDataObject) {
    if (!!dataObj && !this.dataViewMap.has(dataObj)) {
      if (dataObj instanceof Room) {
        const room2D: Room2D = new Room2D(dataObj);
        const disposeF = (dataObj as Room).on("destroyLayerData", () => {
          this.remove(dataObj);
        });
        this._disposeArr.push(disposeF);
        this.dataViewMap.set(dataObj, room2D);
        this.container.home.curLevel.addRoom(dataObj);
        const stage = this.container.getStage();
        stage.addChild(room2D);
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
          (value as Room).destroy();
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
        this.container.home.curLevel.removeRoom(dataObj);
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
        !this.container.home.curLevel.rooms.includes(dataObj)
      ) {
        this.remove(dataObj);
      }
    }

    for (const room of this.container.home.curLevel.rooms) {
      if (!room) {
        continue;
      }
      this.add(room);
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
    const models = this.getDatas() as Room[];
    models.forEach((model) => {
      switch (routeName) {
        default:
      }
    });
  }

  protected init() {
    this._layerName = LayerName.Room;
  }

  /**
   * 根据路由Name检查，当前层的显示状况
   * @param routeName
   */
  protected checkLayerShow(routeName: string) {
    const layerObjects: Room2D[] = this.getObjects() as Room2D[];

    layerObjects.forEach((object) => {
      const room = object.room;
      if (!!room) {
        object.interactive = true;
        object.visible = room.visible;
      }
    });
  }
}
