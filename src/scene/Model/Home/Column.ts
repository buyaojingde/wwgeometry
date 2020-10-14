import { IDataObject } from '../../Interface/IDataObject';
import IBuildable from '../BaseInterface/IBuildable';
import ObjectIndex from '../BaseInterface/ObjectIndex';
import Point from '../../../utils/Math/geometry/Point';


export default class Column extends ObjectIndex implements IBuildable, IDataObject {
  get geo(): any {
    return this._geo;
  }

  set geo(value: any) {
    this._geo = value;
  }

  columnType: number;
  private _boundingPoints: Point[];
  isMoving: boolean;
  private _geo:any;

  constructor() {
    super();
  }

  get boundingPoints(): Point[] {
    return this._boundingPoints;
  }

  set boundingPoints(value: Point[]) {
    this._boundingPoints = value;
  }


  build(): void {
  }

  buildFromData(data: object) {
  }

  buildToData(): object {
    return undefined;
  }

  public destroied: boolean = false;

  public get visible() {
    return true;
  }

  public destroy(emitLayer = true) {
    if (!this.destroied) {
      this.destroied = true;

      this.emit('destroy');
      if (emitLayer) {
        this.emit('destroyLayerData');
      }
      this.removeAllListeners();
    }
  }

}
