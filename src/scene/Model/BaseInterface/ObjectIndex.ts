import { utils } from "pixi.js";
import { IDataObject } from "../../Interface/IDataObject";
import UniqueIndexGenerator from "../Util/UniqueIndexGenerator";

const { EventEmitter } = utils;
export default class ObjectIndex extends EventEmitter implements IDataObject {
  get rvtId(): string {
    return this._rvtId;
  }

  set rvtId(value: string) {
    this._rvtId = value;
  }
  constructor() {
    super();
    this._id = ObjectIndex.assignUniqueId();
  }

  protected _id: string;

  private _rvtId!: string;

  get id(): string {
    return this._id;
  }

  set id(param1: string) {
    this._id = param1;
    const locId: number = parseInt(param1, 10);

    UniqueIndexGenerator.setIndex(locId);
  }

  public static assignUniqueId(): string {
    const iUniqueIndex: number = UniqueIndexGenerator.getIndex();
    const strUniqueIndex: string = iUniqueIndex.toString();

    return strUniqueIndex;
  }

  public clone(): object {
    return {};
  }

  public buildFromData(data: any) {}

  public buildToData(): object {
    return {};
  }

  public on(event: string, fn: any, context?: any): any {
    super.on(event, fn, context);

    return () => super.off(event, fn);
  }

  public once(event: string, fn: any, context?: any): any {
    super.once(event, fn, context);

    return () => super.off(event, fn);
  }
}
