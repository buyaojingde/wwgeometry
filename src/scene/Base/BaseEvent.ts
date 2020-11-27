import DOMEventManager from '../2D/Utils/DOMEventManager';

export default class BaseEvent {
  public get enable() {
    return this._enable;
  }

  public set enable(val: boolean) {
    if (this._enable === val) {
      return;
    }
    this._enable = val;
    val ? this.initEvents() : this.dispose();
  }
  protected switchArr: any[] = []; // 用于装载开关监听器的容器，以便于在Destroy时销毁监听
  protected DOMEventListener: DOMEventManager;

  protected disposeArr: any[] = []; // 所有处理的事件

  protected levelArr: any[] = [];
  private _enable: boolean = false;

  // @ts-ignore
  constructor(DOMEvent) {
    this.DOMEventListener = DOMEvent;
  }

  // 初始化监听事件 , 该函数在enable设置为true时运行
  public initEvents() {}

  public on(event: string | symbol, fn: any, context?: any): this {
    this.DOMEventListener.on(event, fn);
    this.disposeArr.push({ event, fn });

    return this;
  }

  public dispose() {
    while (this.disposeArr.length) {
      const dispose = this.disposeArr.pop();

      if (typeof dispose === 'function') {
        dispose();
      } else {
        const { event, fn } = dispose;
        this.DOMEventListener.off(event, fn);
      }
    }
  }

  public destroy() {
    this.dispose();
    for (const switchAction of this.switchArr) {
      switchAction();
    }
  }
}
