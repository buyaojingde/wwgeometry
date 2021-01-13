import ConfigStructure from '../../../utils/ConfigStructure';
import { EventEnum, EventMgr } from '../../../utils/EventManager';
import Box from '../../../utils/Math/geometry/Box';
import Segment from '../../../utils/Math/geometry/Segment';
import Quadtree from '../../../utils/Math/math/Quadtree';
import IBuildable from '../BaseInterface/IBuildable';
import ObjectNamed from '../BaseInterface/ObjectNamed';
import Obstacle from './Obstacle';
import Room from './Room';
import Structure, { StType } from './Structure';

export default class Level extends ObjectNamed implements IBuildable {
  constructor() {
    super();
    this.resetData();
  }

  private _rooms: Room[] = [];

  private _obstacles: Obstacle[] = [];

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
    this._obstacles = [];
    this.initStructureTree();
    this.initRoomTree();
    this.initObstacleTree();
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
    return [...this._rooms, ...this._structures, ...this._obstacles];
  }

  public exportObstacles() {
    const obstacles: any[] = [];
    let index = 0;
    for (const obstacle of this._obstacles) {
      const data = obstacle.buildData();
      data.code = `${ConfigStructure.bimMapCode}-Obstacle-${index}`;
      data.id = index;
      index++;
      obstacles.push(data);
    }
    return obstacles;
  }

  addObstacle(newModel: Obstacle) {
    if (this._obstacles.includes(newModel)) return;
    newModel.level = this;
    this._obstacles.push(newModel);
    this._quadTree.insert(newModel.quadData);
  }

  public structuresTree: any = {};
  updateStructuresTree() {
    const dataLvl4 = (ele: any, st: Structure) => {
      const data4: any = {};
      data4.id = ele.revitId;
      data4.label = ele.revitId;
      data4.buildData = st;
      return data4;
    };

    const dataLvl3 = (ele: any) => {
      const data3: any = {};
      data3.label = ele.typeName;
      data3.children = [];
      return data3;
    };

    const dataLvl2 = (ele: any) => {
      const data2: any = {};
      data2.label = ele.categoryName;
      data2.children = [];
      return data2;
    };

    for (const st of this.structures) {
      const ele: any = st.geoEle.ele;
      const existData: any = this.structuresTree.children.find(
        (item: any) => ele.professional === item.label
      );
      if (!existData) {
        const data1: any = {};
        data1.label = ele.professional;
        data1.id = ele.professional;
        this.structuresTree.children.push(data1);
        data1.children = [];

        const data2: any = dataLvl2(ele);
        data1.children.push(data2);

        const data3: any = dataLvl3(ele);
        data2.children.push(data3);

        const data4: any = dataLvl4(ele, st);
        data3.children.push(data4);
      } else {
        const existData2 = existData.children.find(
          (item: any) => ele.categoryName === item.label
        );
        if (!existData2) {
          const data2: any = dataLvl2(ele);
          existData.children.push(data2);

          const data3: any = dataLvl3(ele);
          data2.children.push(data3);

          const data4: any = dataLvl4(ele, st);
          data3.children.push(data4);
        } else {
          const existData3 = existData2.children.find(
            (item: any) => ele.typeName === item.label
          );
          if (!existData3) {
            const data3: any = dataLvl3(ele);
            existData2.children.push(data3);

            const data4: any = dataLvl4(ele, st);
            data3.children.push(data4);
          } else {
            const data4: any = dataLvl4(ele, st);
            existData3.children.push(data4);
          }
        }
      }
    }
    return this.structuresTree;
  }
  public roomsTree: any = {};

  updateRoomsTree() {
    const rooms = this.rooms;
    for (const room of rooms) {
      const roomTree: any = {};
      // roomTree.label = room.rvtName + " " + room.rvtId;
      roomTree.label = room.rvtId;
      roomTree.id = room.rvtId;
      roomTree.buildData = room;
      this.roomsTree.children.push(roomTree);
    }
    return this.roomsTree;
  }

  public obstaclesTree: any = {};
  updateObstaclesTree() {
    const obs = this._obstacles;

    for (const ob of obs) {
      const boTree: any = {};
      boTree.label = ob.name;
      boTree.id = ob.rvtId;
      boTree.buildData = ob;
      this.obstaclesTree.children.push(boTree);
    }
    return this.obstaclesTree;
  }

  private initStructureTree() {
    this.structuresTree.label = '构建';
    this.structuresTree.id = 'structure';
    this.structuresTree.children = [];
  }

  private initRoomTree() {
    this.roomsTree.label = 'room';
    this.roomsTree.id = 'room';
    this.roomsTree.children = [];
  }

  private initObstacleTree() {
    this.obstaclesTree.label = 'obstacle';
    this.obstaclesTree.id = 'obstacle';
    this.obstaclesTree.children = [];
  }

  public addObstacleTree(ob: Obstacle) {
    const boTree: any = {};
    boTree.label = ob.name;
    boTree.id = ob.rvtId;
    boTree.buildData = ob;
    this.obstaclesTree.children.push(boTree);
  }
}
