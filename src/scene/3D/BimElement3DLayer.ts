import { Group } from 'three';
import { EventEnum, EventMgr } from '../../utils/EventManager';
import { IDataObject } from '../Interface/IDataObject';
import Obstacle from '../Model/Home/Obstacle';
import Room from '../Model/Home/Room';
import Structure from '../Model/Home/Structure';
import BimElement3D from './BimElement3D';

export default class BimElement3DLayer {
  private _container: Group;
  private _elements: any[] = [];
  private _dataViewMap: Map<IDataObject, BimElement3D>;
  public constructor(elements: any[]) {
    this._container = new Group();
    this._elements = elements;
    this._dataViewMap = new Map<IDataObject, BimElement3D>();
    EventMgr.on(EventEnum.layerAdd, this.add.bind(this));
    EventMgr.on(EventEnum.layerRemove, this.remove.bind(this));
  }
  attachContainer(container: Group) {
    container.add(this._container);
  }

  public render(): void {
    for (const element of this._elements) {
      const b3d = new BimElement3D(element);
      b3d.renderWith(this._container);
    }
  }

  public add(dataObj: IDataObject) {
    if (
      dataObj instanceof Room ||
      dataObj instanceof Structure ||
      dataObj instanceof Obstacle
    ) {
      const b3d: BimElement3D = new BimElement3D(dataObj);
      this._container.add(b3d);
      this._dataViewMap.set(dataObj, b3d);
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
