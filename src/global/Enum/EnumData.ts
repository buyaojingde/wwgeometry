/**
 * 点和直线的关系
 */
export enum EPointLineRelation {
  On, // 在直线上
  Left, // 在左边
  Right, // 在右边
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

