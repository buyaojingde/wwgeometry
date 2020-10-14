export default class MathUtils {
  public static readonly Deg2Rad: number = (Math.PI / 180.0);
  public static readonly Rad2Deg: number = (180.0 / Math.PI);
  public static readonly Epsilon: number = 0.000001;

  public static equalZero(a: number, epsilon: number = MathUtils.Epsilon) {
    return a <= epsilon && a >= -epsilon;
  }

  public static equal(a: number, b: number, epsilon: number = MathUtils.Epsilon) {
    return MathUtils.equalZero(a - b, epsilon);
  }

  public static greater(a: number, b: number, epsilon: number = MathUtils.Epsilon) {
    return a - b > epsilon;
  }

  public static greaterEqual(a: number, b: number, epsilon: number = MathUtils.Epsilon) {
    return !MathUtils.less(a, b);
  }

  public static less(a: number, b: number, epsilon: number = MathUtils.Epsilon) {
    return this.greater(b, a);
  }

  public static lessEqual(a: number, b: number, epsilon: number = MathUtils.Epsilon) {
    return !MathUtils.greater(a, b);
  }
}
