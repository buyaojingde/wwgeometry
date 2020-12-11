export default class Line2DIntersectionStatus {
  // extends Object
  public static OVERLAP = 0; // 重合
  public static CO_LINEAR = 1; // 共线
  public static LINE_CROSS = 2; // 相交
  public static PART_CROSS = 3; // 部分相交
  public static A_HALVE_B = 4; // A 包括 B
  public static B_HALVE_A = 5; // B 包括 A
  public static PARALELL = 6; // 平行
  public static A_B_HALVE = 7; // A B 户型平分

  constructor() {}
}
