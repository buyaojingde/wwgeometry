import Room from '@/views/map/spaceInformation/mapEditor/scene/Model/Home/Room';
import Structure from '@/views/map/spaceInformation/mapEditor/scene/Model/Home/Structure';
import Level from '../scene/Model/Home/Level';

export default class LevelData {
  public constructor(lvl: Level) {
    this._lvl = lvl;
  }
  private _lvl: Level;

  public buildData() {
    const hiddenElementCodeList = this.hiddenElementCodeList();
    const editedGeometries = this.editedGeometries();
    const obstacles = this._lvl.exportObstacles();
    return {
      geometries: editedGeometries[0],
      hiddenElementCodeList: hiddenElementCodeList,
      obstacles: obstacles,
      spaces: editedGeometries[1],
    };
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

  private editedGeometries() {
    const list: any[] = [];
    const list1: any[] = [];
    for (const edit of this._lvl.editGeometries) {
      if (edit instanceof Structure) list.push(edit.geoEle.geo);
      if (edit instanceof Room) list1.push(edit.spaceData.space);
    }
    return [list, list1];
  }
}
