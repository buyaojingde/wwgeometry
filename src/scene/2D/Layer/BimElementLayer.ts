import { EventEnum, EventMgr } from '../../../utils/EventManager';
import { IDataObject } from '../../Interface/IDataObject';
import Obstacle from '../../Model/Home/Obstacle';
import Room from '../../Model/Home/Room';
import Structure from '../../Model/Home/Structure';
import BimElement2D from '../ViewObject/BimElement2D';

export default class BimElementLayer {
  private _container: PIXI.Container;
  private _elements: any[] = [];
  private _dataViewMap: Map<IDataObject, BimElement2D>;
  public constructor(elements: any[]) {
    this._container = new PIXI.Container();
    this._elements = elements;
    this._dataViewMap = new Map<IDataObject, BimElement2D>();
    EventMgr.on(EventEnum.layerAdd, this.add.bind(this));
    EventMgr.on(EventEnum.layerRemove, this.remove.bind(this));
  }

  public render(): void {
    for (const element of this._elements) {
      const b2d = new BimElement2D(element);
      b2d.renderWith(this._container);
    }
  }

  public attachContainer(container: PIXI.Container) {
    container.addChild(this._container);
  }

  public add(dataObj: IDataObject) {
    if (
      dataObj instanceof Room ||
      dataObj instanceof Structure ||
      dataObj instanceof Obstacle
    ) {
      const b2d: BimElement2D = new BimElement2D(dataObj);
      this._container.addChild(b2d);
      this._dataViewMap.set(dataObj, b2d);
    }
  }

  public remove(dataObj: IDataObject) {
    if (
      dataObj instanceof Room ||
      dataObj instanceof Structure ||
      dataObj instanceof Obstacle
    ) {
      const view = this._dataViewMap.get(dataObj);
      if (view) view.destroy();
      this._dataViewMap.delete(dataObj);
    }
  }
}
