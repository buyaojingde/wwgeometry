import Vector3D from '../Model/Geometry/Vector3D';

export interface IDataObject {
  buildFromData(data: object);

  buildToData(): object;
}

// 可观察的Model类型
export interface IObserveModel {
  width: number;
  height: number;
  length: number;
  rotYAngle: number;
  position: Vector3D;
}

export interface IHomeAllData {
  Models;
  Textures;
  homeDesign: IHomeDataObject;
  metadata;
}

// 传输的原始户型数据
export interface IHomeDataObject {
  levels: [
    {
      id: string;
      name: string;
      height: number;
      isMirror: boolean;
      offset: { x: number; y: number };
      pictureId: string;
      pictureType: number;
      totalClearArea: number;
      uesGuideline: boolean;
      useComstomLighting: boolean;
      useIESLight: boolean;
      compassRotation: number;
      index: number;
      areaIds: any;
      switchIds: any;
      scale: number;
      cornerIds;
      wallIds;
      roomIds;
      pillarIds;
      layoutModelIds;
      layoutGroupIds;
      curvedwallIds;
      lightVIewIds;
      parquetIds;
      // parquets;
      ceilingIds;
      // ceilings;
      bgWallIds;
      // bgWalls;
      bkShapeTexturesIds;
    }
  ];
  pillars;
  corners;
  holes;
  layoutGroups;
  layoutModelsNew;
  rooms;
  walls;
  ceilings;
  parquets;
  bgWalls;
  lightViews;
  curvedwalls?: any;
  curvedWallsNew;
  holeTexturesID;
  floorTextureIDs;
  wallTexturesID;
  pillarTexturesID;
  ceilingTexturesID;
  bkShapeTexturesID;
  floorTextures?: any;
  // ceilingTextures;
  // wallTextures;
  // pillarTextures;
}

// 输出的Level数据
export interface ILevelDataObject {
  id: string;
  name: string;
  height: number;
  isMirror: boolean;
  offset: { x: number; y: number };
  pictureId: string;
  pictureType: number;
  totalClearArea: number;
  uesGuideline: boolean;
  useComstomLighting: boolean;
  useIESLight: boolean;
  compassRotation: number;
  index: number;
  areaIds: any;
  switchIds: any;
  scale: number;
  walls;
  curvedWalls;
  rooms;
  holes;
  corners;
  pillars;
  ceilings;
  parquets;
  bgWalls;
  lightViews;
  layoutGroups;
  layoutModels;
  holeTextureIDs;
  floorTextureIDs;
  ceilingTextureIDs;
  wallTextureIDs;
  pillarTextureIDs;
  bkShapeTexturesIDs;

  // 应用样本间的数据
  floorTextures?: any;
  // ceilingTextures;
  // wallTextures;
  // pillarTextures;
}
