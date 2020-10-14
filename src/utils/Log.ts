/**
 * 打印Log类
* * by lianbo.guo
 **/

export default class Log {
  public static enablePerformance = true;

  public static performance(label: string) {
    label = `[performance]${label}`;
    this.enablePerformance && console.time(label);
    return () => {
      this.enablePerformance && console.timeEnd(label);
    };
  }
}
