export default class MathUtils {
  public static readonly Deg2Rad: number = Math.PI / 180.0;
  public static readonly Rad2Deg: number = 180.0 / Math.PI;
  public static Epsilon = 0.000001;

  public static resetAccuracy() {
    this.Epsilon = 0.000001;
  }

  public static equalV3(v: any, v1: any) {
    return (
      MathUtils.equal(v.x, v1.x) &&
      MathUtils.equal(v.y, v1.y) &&
      MathUtils.equal(v.z, v1.z)
    );
  }

  public static equalZero(a: number, epsilon: number = MathUtils.Epsilon) {
    return a <= epsilon && a >= -epsilon;
  }

  public static equal(
    a: number,
    b: number,
    epsilon: number = MathUtils.Epsilon
  ) {
    return MathUtils.equalZero(a - b, epsilon);
  }

  public static greater(
    a: number,
    b: number,
    epsilon: number = MathUtils.Epsilon
  ) {
    return a - b > epsilon;
  }

  public static greaterEqual(
    a: number,
    b: number,
    epsilon: number = MathUtils.Epsilon
  ) {
    return !MathUtils.less(a, b, epsilon);
  }

  public static less(
    a: number,
    b: number,
    epsilon: number = MathUtils.Epsilon
  ) {
    return this.greater(b, a, epsilon);
  }

  public static lessEqual(
    a: number,
    b: number,
    epsilon: number = MathUtils.Epsilon
  ) {
    return !MathUtils.greater(a, b, epsilon);
  }

  public static Sign(value: number): number {
    if (value < 0.0) {
      return -1;
    }
    if (value > 0.0) {
      return 1;
    }
    return 0;
  }

  /**
   * @Description: 取一个数组中最小的一个值
   * @param
   * @data 2019/12/25
   */
  public static getMinItem<T>(arr: T[], compare: any): T | undefined {
    if (arr.length < 1) {
      return;
    }
    let minItem = arr[0];
    for (const item of arr) {
      if (compare(item, minItem) === -1) {
        minItem = item;
      }
    }
    return minItem;
  }

  public static isNum(val: any): boolean {
    return typeof val === 'number' && !isNaN(val);
  }

  /**
   * @author lianbo
   * @date 2020-11-12 14:32:25
   * @Description: 一维坐标轴上线段的重叠计算，务必保证x1、x2和y1、y2的大小顺序
   * @x1: <x2
   * @y1: <y2
   */
  public static overlap(a: number, b: number, c: number, d: number): any {
    let x1, x2, y1, y2;
    if (a < b) {
      x1 = a;
      x2 = b;
    } else {
      x1 = b;
      x2 = a;
    }
    if (c < d) {
      y1 = c;
      y2 = d;
    } else {
      y1 = d;
      y2 = c;
    }
    if (MathUtils.greaterEqual(y1, x1) && MathUtils.lessEqual(y1, x2)) {
      if (MathUtils.lessEqual(y2, x2)) {
        return [y1, y2];
      } else {
        return [y1, x2];
      }
    } else {
      if (MathUtils.less(y1, x1)) {
        if (MathUtils.greaterEqual(y2, x1)) {
          if (MathUtils.lessEqual(y2, x2)) {
            return [x1, y2];
          } else {
            return [x1, x2];
          }
        }
      }
    }
    return null;
  }

  /**
   * @author lianbo
   * @date 2020-11-25 20:34:01
   * @Description: 得到一个两数之间的随机整数,
   * 这个值不小于 min （如果 min 不是整数，则不小于 min 的向上取整数），且小于（不等于）max。
   */
  public static getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //不含最大值，含最小值
  }

  /**
   * @author lianbo
   * @date 2020-11-25 20:34:49
   * @Description: 得到一个两数之间的随机数
   这个例子返回了一个在指定值之间的随机数。这个值不小于 min（有可能等于），并且小于（不等于）max。
   */
  public static getRandomArbitrary(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }
}
