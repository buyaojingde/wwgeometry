import ConfigStructure from '../../../utils/ConfigStructure';
import Box from '../../../utils/Math/geometry/Box';
import Segment from '../../../utils/Math/geometry/Segment';
import Quadtree from '../../../utils/Math/math/Quadtree';
import IBuildable from '../BaseInterface/IBuildable';
import ObjectNamed from '../BaseInterface/ObjectNamed';
import Room from './Room';
import Structure, { StType } from './Structure';

export default class Level extends ObjectNamed implements IBuildable {
  constructor() {
    super();
    this.resetData();
  }

  private _rooms: Room[] = [];

  get rooms(): Room[] {
    return this._rooms;
  }

  private _structures!: Structure[];

  get structures(): Structure[] {
    return this._structures;
  }

  set structures(value: Structure[]) {
    this._structures = value;
  }

  private _quadTree!: Quadtree;

  get quadTree(): Quadtree {
    return this._quadTree;
  }

  public build(): void {}

  /**
   * 清除数据应用
   */
  public destroy(): void {
    this.resetData();
  }

  addStructure(dataObj: Structure): void {
    if (!this._structures.includes(dataObj)) {
      dataObj.level = this;
      this._structures.push(dataObj);
      this._quadTree.insert(dataObj.quadData);
    }
  }

  /**
   * 是否是空楼层
   */
  public isEmptyLevel(): boolean {
    const homeData = this.getHomeData();
    return homeData.length === 0;
  }

  public getHomeData(): Structure[] {
    return [...this.structures];
  }

  /**
   * @author lianbo
   * @date 2020-11-13 16:30:42
   * @Description: 初始化四叉树
   */
  public initQuadTree(): void {
    const minCanvas = ConfigStructure.computePoint(ConfigStructure.minGeoV3);
    const maxCanvas = ConfigStructure.computePoint(ConfigStructure.maxGeoV3);
    ConfigStructure.minCanvasV3 = minCanvas;
    ConfigStructure.maxCanvasV3 = maxCanvas;
    const width = maxCanvas.x - minCanvas.x;
    const height = maxCanvas.y - minCanvas.y;
    // 初始化四叉树
    this._quadTree = new Quadtree({
      x: minCanvas.x,
      y: minCanvas.y,
      width: width,
      height: height,
    });
  }

  /**
   * @author lianbo
   * @date 2020-11-20 17:37:17
   * @Description: 处理房间和构建的关系
   */
  public preprocessRooms(): void {
    for (const room of this.rooms) {
      this.preprocessRoom(room);
    }
  }

  public preprocessRoom(room: Room) {
    const others = this._quadTree
      .retrieve(room.quadData)
      .filter((item) => {
        return item.data instanceof Structure;
      })
      .map((item) => item.data);
    const boxes = room.polygon.cutBox();
    for (const box of boxes) {
      for (const stData of others) {
        const res: Segment[] = [];
        let otherBoxes: Box[] = [];
        if (stData.stType === StType.Column) {
          otherBoxes = stData.polygon.cutBox();
        } else {
          otherBoxes = [stData.box];
        }
        for (const otherB of otherBoxes) {
          const result: { seg: Segment; index: number }[] = box.outsideTouch(
            otherB
          ); // 一些柱不是规则的box，所以要想取得柱的关系先分解成Box
          if (result.length > 0) {
            const tangentEdge: Segment = result[0].seg;
            res.push(tangentEdge);
            room.addStructure(tangentEdge, stData);
          }
        }
        if (res.length > 0) {
          stData.addRoomRel(room, res);
        }
      }
    }
  }
  /**
   * @author lianbo
   * @date 2020-11-13 16:25:46
   * @Description: 处理识别构建的中线问题
   */
  public preprocess(): void {
    for (const st of this.structures) {
      // 计算墙中线
      if (st.stType === StType.Wall) {
        const selectBox = st.box;
        const selectEdges = selectBox.edges;
        const res: any[] = [];
        const others = this._quadTree.retrieve(st.quadData).filter((item) => {
          return !(item.data instanceof Room) && item.data !== st;
        });
        for (const other of others) {
          const result = selectBox.outsideTouch(other.data.box);
          if (result && result.length > 0) {
            res.push(...result);
          }
        }
        const item0 = res.find((item) => item.index === 0);
        const item1 = res.find((item) => item.index === 1);
        const item2 = res.find((item) => item.index === 2);
        const item3 = res.find((item) => item.index === 3);
        if (
          (item0 && item0.seg.equalTo(selectEdges[0])) ||
          (item2 && item2.seg.equalTo(selectEdges[2]))
        ) {
          st.setMidLine(0, 2);
        }

        if (
          (item1 && item1.seg.equalTo(selectEdges[1])) ||
          (item3 && item3.seg.equalTo(selectEdges[3]))
        ) {
          st.setMidLine(1, 3);
        }
      }
    }
  }

  addRoom(item: Room): void {
    if (this._rooms.includes(item)) return;
    item.level = this;
    this._rooms.push(item);
    this._quadTree.insert(item.quadData);
  }

  protected resetData(): void {
    this._structures = [];
    this._rooms = [];
  }

  /**
   * @author lianbo
   * @date 2020-11-25 15:34:14
   * @Description: 根据rvtId找到组件
   */
  public findByRvtId(rvtId: string): any {
    const result = [...this.structures, ...this.rooms].find(
      (item: any) => item.rvtId === rvtId
    );
    return result;
  }

  public get allElements(): any[] {
    return [...this._rooms, ...this._structures];
  }
}
