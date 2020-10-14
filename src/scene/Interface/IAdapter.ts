/**
* * by lianbo.guo
 **/

export interface IAdapter {
  // 转换为系统可用数据
  in(data: any, ...args): void;
  // 转换为接口可用数据
  out(data: any, ...args): void;
}
