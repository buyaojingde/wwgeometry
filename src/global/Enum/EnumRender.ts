/**
 * @description: 渲染相关枚举类
 */

/**
 * 自定义灯光视图类型
 */
export enum ELightViewType {
  TwoDView, // 2D视图
  CeilView, // 顶面视图
  ThreeDView, // 3D视图
}

/**
 * 墙体显示模式
 */
export enum WallShowType {
  HideWall = 1, // 无墙
  HalfWall = 2, // 半墙
  FullWall = 3, // 全墙
}

/**
 * 批量操作灯光 框选的类型
 */
export enum SelectLightType {
  MixtureLight = 1, // 混合灯光
  SingleLight = 2, // 单个灯光
  AreaLight = 3, // 面光源
  FocusLight = 4, // 聚光灯
}

/**
 * 相机类型
 */
export enum ECameraType {
  Perspective,
  Orthographic,
}
