import LayerBase, { LayerName } from '../../Base/LayerBase';
import { IDataObject } from '../../Interface/IDataObject';
import Column from '../../Model/Home/Column';
import Column2D from '../ViewObject/Column2D';

export default class ColumnLayer extends LayerBase {
  protected _layerName = LayerName.Column;
  protected dataViewMap: Map<IDataObject, any>;

  public constructor(scene: any) {
    super(scene);
    this.init();
    // tslint:disable-next-line:no-string-literal
    // window['Columnlayer'] = () => {
    //   console.log('Columnlayer>>' + this._layerName);
    // };
  }

  public render(): void {
    // 对home数据做同步，对dataMap做数据清洗
    for (const dataObj of this.getDatas()) {
      if (!this.container.home.curLevel.columns.includes(dataObj)) {
        this.remove(dataObj);
      }
    }

    for (const newColumn of this.container.home.curLevel.columns) {
      if (!newColumn) {
        continue;
      }
      this.add(newColumn);
    }
  }

  public add(dataObj: IDataObject) {
    if (!!dataObj && !this.dataViewMap.has(dataObj)) {
      if (dataObj instanceof Column) {
        const Column2d: Column2D = new Column2D(dataObj);
        const disposeF = (dataObj as Column).on('destroyLayerData', () => {
          this.remove(dataObj);
        });
        this._disposeArr.push(disposeF);
        this.dataViewMap.set(dataObj, Column2d);
        this.container.home.curLevel.addColumn(dataObj);
        const stage = this.container.getStage();
        stage.addChild(Column2d);
      }
    }
  }

  public remove(dataObj) {
    if (this.dataViewMap.has(dataObj)) {
      try {
        dataObj.destroy(false);

        this.dataViewMap.delete(dataObj);
        this.container.home.curLevel.removeColumn(dataObj);
      } catch (e) {}
    }
  }

  /**
   * Desc: clear all objects in this layer.
   */
  public clear(): void {
    if (this.dataViewMap.size > 0) {
      for (const value of this.dataViewMap.keys()) {
        if (value !== undefined) {
          (value as Column).destroy();
        }
      }
      // this.destroy();
      for (const value of this.dataViewMap.values()) {
        value && (value as any).destroy();
      }
      this.dataViewMap.clear();
    }
  }

  protected init() {
    this._layerName = LayerName.Column;
  }

  /**
   *  路由离开时检查处理数据
   * @param routeName
   */
  public checkLeaveLayerShow(routeName: string) {
    const models = this.getDatas() as Column[];
    models.forEach(model => {
      switch (routeName) {
        default:
      }
    });
  }

/**
 * 根据路由Name检查，当前层的显示状况
 * @param routeName
 */
protected checkLayerShow(routeName: string) {
  const layerObjects: Column2D[] = this.getObjects() as Column2D[];

  layerObjects.forEach(object => {
    const column = object.column;
    if (!!column) {
      switch (routeName) {
        case 'wallStage':
        case 'cubeBoxStage':
          object.visible = false;
          break;
        case '2DStage':
          object.interactive = true;
          break;
        default:
      }

      object.visible = column.visible;
    }
  });
}

  public destroy() {
    super.destroy();
  }
}
