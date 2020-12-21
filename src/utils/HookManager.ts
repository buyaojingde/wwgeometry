import mapValues from 'lodash/mapValues';

/**
 * 用于统一处理Hook中定义的Hook函数
 * 并封装统一释放话柄
 */
export default abstract class HookManager {
  /** 所有的数据变化后控制器所响应的钩子 */
  protected Hook: any = {};
  protected disposeArr: any = []; // 释放监听事件的话柄数组

  protected dispose() {
    while (this.disposeArr.length) {
      this.disposeArr.pop()();
    }
  }

  protected getHook(name = '') {
    if (name !== '') {
      return this.Hook[name].bind(this);
    }

    return mapValues(this.Hook as any, (val) => {
      return val.bind(this);
    });
  }
}
