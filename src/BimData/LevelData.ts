import Level from '../scene/Model/Home/Level';

export default class LevelData {
  public constructor(lvl: Level) {
    this._lvl = lvl;
  }
  private _lvl: Level;

  public buildData() {
    const hiddenElementCodeList = this.hiddenElementCodeList();
  }

  private hiddenElementCodeList() {
    const list: string[] = [];
    for (const room of this._lvl.rooms) {
      if (!room.visible) {
        list.push(room.spaceData.space.code);
      }
    }

    for (const st of this._lvl.structures) {
      if (!st.visible) {
        list.push(st.geoEle.ele.code);
      }
    }
    return list;
  }
}
