/**
 * 鼠标键值枚举
 */
export enum EMouseButtonType {
  Left = 0,
  Right = 1,
  Middle = 2,
}

/**
 * 对象的类型
 */
export enum EShapeViewType {
  CeilingShapeView,
  WallShapeView,
  ParquetShapeView,
}

/**
 * 背景墙造型线的类型
 */
export enum EShapeStyleType {
  Corner = 9,
  Spline,
}

/**
 * 地面拼花的类型
 */
export enum EParquetType {
  Line = 0,
  Circle = 1,
  Bezier = 2,
}

/**
 * 操作类型
 */
export enum EActiveTypes {
  Editing, // 正在编辑
  Draging, // 正在拖动
  Rotating, // 正在旋转
  MovingHeight, // 正在调高
  MovingTexture, // 正在移动的Texture
  MovingPrototypeRoom, // 正在移动的单间样板间
  CameraChanging, // 摄像机正在移动
  HoleDraging,
  ReplaceHoleModel,
  MovingPaveTexture, // 正在拖动的铺贴
}

/**
 * MapBar对应当前场景类型
 */
export enum EModuleType {
  LayoutDesign, // 2D户型设计
  ThreeDDesign, // 3D设计
}

/**
 * 点和直线的关系
 */
export enum EPointLineRelation {
  On, // 在直线上
  Left, // 在左边
  Right, // 在右边
}

/**
 * 轴向名称
 */
export enum EAxisName {
  X,
  Y,
  Z,
}

/**
 * 多边形包含关系
 */
export enum EPolygonContainType {
  Split, // 相离
  Intersection, // 相交
  AContainB, // A包含B
  BContainA, // B包含A
  AEqualB, // A==B
  Error, // CAD导入的非法造型
}

/**
 * 输入框类型
 */
export enum ELoftInputType {
  Shift,
  Loft,
}

/**
 * 输入框类型
 */
export enum EDecorativeLineType {
  Spline,
  Corner,
  Boundary,
}

export enum ELineType {
  Straight = 0,
  Bezier = 1,
  Circle = 2,
  Arc = 3,
}

/**
 * 硬装造型各部件网格名字
 */
export enum EMeshName {
  meshBoundary = 'meshBoundary',
  meshFace = 'meshFace',
  meshEdge = 'meshEdge',
  meshSpline = 'meshSpline',
  meshCorner = 'meshCorner',
  meshLed = 'meshLed',
  meshWallLeft = 'leftSurMesh',
  meshWallRight = 'rightSurMesh',
  meshFloor = 'floorSurMesh',
}
export enum WallSurfaceType {
  Right = 0,
  Left = 1,
  Start = 2,
  End = 3,
}
export enum RoomSurfaceType {
  Floor = 0,
  Ceiling = 1,
}
export enum ShapeSurfaceType {
  Face = 0,
  Side = 1,
  Led = 2,
  CornerTex = 3,
  Corner = 4,
  Spline = 5,
  SplineTex = 6,
  Boundary = 7,
}
/**
 * 纹理铺排的枚举类所在的位置:
 *
 * 1----2----3
 * |    |    |
 * 4----5----6
 * |    |    |
 * 7----8----9
 *
 */

export enum UvMappingWay {
  TopLeft = 1,
  TopMiddle = 2,
  TopRight = 3,
  LeftSideMiddle = 4,
  GeometricCenter = 5,
  RightSideMiddle = 6,
  LowerLeft = 7,
  LowerMiddle = 8,
  LowerRight = 9,
}

export enum ETextureType {
  ModelTex, // 材质贴图（更换模型材质）
  FloorTex, // 地面贴图
  WallTex, // 墙面贴图
  SkirtTex, // 踢脚线
  PlasterTex, // 石膏线
  CeilingTex, // 扣板贴图
  SplineTex, // 样条线
  CornerTex, // 角线
  BoundaryTex, // 波打线
}

export enum EPaverFixedType {
  Fixed = 0,
  FixedSingle = 1,
  Free = 2,
}
export enum EPaverOffsetType {
  Config = 0,
}
export enum EPaverSizeType {
  Config = 0,
  // 大小正方形对齐
  SL_Square = 1,
  // 大小矩形对齐
  SL_Rectangle = 2,
}
/**
 * 线段重叠几个可能
 * .-------.
 *    .---------.    Cross
 *
 *   .---------.
 *   .---------.   Complete
 *
 * .--------..-------.  Connect
 *
 * .--------------------.
 *     .----------.        Include ,有两种情况;
 *
 */
export enum ESegOverlapType {
  Connect, // 头尾连接
  Cross, // 交叉重叠
  Complete, // 完全重叠，
  IncludeOther, // 包含重叠 包含别人
  OtherInclude, // 包含重叠  被别人包含
  Nothing, // 不平行
  Split, // 共线相离
}
/**
 * 贴图铺装类型
 */
export enum EPaverType {
  Common = 0, // 普通铺装，可能有缝隙
  Paver = 1, // 铺装，有单转，双转，多砖
  Boundary = 2, // 波导线,
}
/**
 * 铺贴随机类型
 */
export enum EPaverRandomType {
  All = 0, // 每一块转都随机，
  Config = 1, // 通过配置文件设置随机组
  Procedure = 2, // 运行是计算随机组,
}
/** 造型类型 */
export enum ShapeType {
  Ceiling = 0, // 顶面工具
  Floor = 1, // 地面工具
  Wall = 2, // 墙面工具
  Box = 3, // 横梁立柱地台面工具
}
/** 凹凸类型 */
export enum ConvexType {
  // 原来的静态造型，这些造型从原来的依附面生成，没有父造型，
  // 静态造型被分割出来的造型依然是静态造型
  // 总结1：静态吊顶的边如果是静态的，那类型必须直线，不可能是圆形或B曲线，
  // 总结2：静态吊顶的边如果是非静态的，那必须有重叠边，
  Fixed = 0,
  Convex = 1, // 凸起的，比父造型的深度大
  Concave = 2, // 凹陷的，比父造型的深度小
  Flat = 3, // 当和父造型深度相平的时候
}
