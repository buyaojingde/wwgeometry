import IBuildable from '../BaseInterface/IBuildable';
import ObjectNamed from '../BaseInterface/ObjectNamed';
import Column from './Column';

export default class Level extends ObjectNamed implements IBuildable {
  get columns(): Column[] {
    return this._columns;
  }

  set columns(value: Column[]) {
    this._columns = value;
  }
  private _columns: Column[];

  constructor() {
    super();
    this.initData();

  }

  protected initData() {
    this._columns = [];
  }

  public build() {
  }

  /**
   * 清除数据应用
   */
  public destroy() {
    this.initData();
  }

  addColumn(dataObj: Column) {
    if (!this._columns.includes(dataObj)) {
      this._columns.push(dataObj);
    }
  }

  /**
   * 是否是空楼层
   */
  public isEmptyLevel(): boolean {
    const homeData = this.getHomeDats();
    return homeData.length === 0;
  }

  public getHomeDats() {
    return [
      ...this.columns,
    ];
  }
}
