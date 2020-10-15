import Hammer from 'hammerjs';
import { Vector2 } from 'three';
import EventEmitter = PIXI.utils.EventEmitter;

export default class DOMEventManager extends EventEmitter {
  protected element: HTMLElement;
  protected hammer: any;
  private dollyStart: Vector2 = new Vector2(); // 缩放用的起始点
  private dollyEnd: Vector2 = new Vector2();

  constructor(element = window as any) {
    super();
    console.log('DOMEventManager');
    this.element = element;
    this.hammer = new Hammer.Manager(this.element);
    this.initPan();

    window.addEventListener('resize', this.emitEvent.bind(this), false);

    window.addEventListener('contextmenu', event => this.emitEvent(event, 'win'), false);
    this.element.addEventListener('contextmenu', event => this.emitEvent(event), false);

    window.addEventListener('keydown', event => this.emitEvent(event, 'win'), false);
    this.element.addEventListener('keydown', event => this.emitEvent(event), false);

    window.addEventListener('keyup', event => this.emitEvent(event, 'win'), false);
    this.element.addEventListener('keyup', event => this.emitEvent(event), false);

    this.element.addEventListener(
      'mousedown',
      event => {
        this.aliasEvent('input.start', event);
      },
      false,
    );

    window.addEventListener('mousedown', event => this.aliasEvent('input.start', event, 'win'), false);

    this.element.addEventListener('dblclick', event => this.aliasEvent('dblclick', event), false);
    window.addEventListener('dblclick', event => this.aliasEvent('dblclick', event, 'win'), false);

    this.element.addEventListener(
      'mouseup',
      event => {
        if (event.button === 2) {
          this.aliasEvent('input.end.right', event);
        } else {
          this.aliasEvent('input.end', event);
        }
      },
      false,
    );
    window.addEventListener(
      'mouseup',
      event => {
        if (event.button === 2) {
          this.aliasEvent('input.end.right', event, 'win');
        } else {
          this.aliasEvent('input.end', event, 'win');
        }
      },
      false,
    );

    this.element.addEventListener('mousemove', event => this.aliasEvent('input.move', event), false);
    window.addEventListener('mousemove', event => this.aliasEvent('input.move', event, 'win'), false);

    this.element.addEventListener('touchmove', event => this.onTouchmove(event), false);
    this.element.addEventListener('touchend', event => this.onTouchEnd(event), false);
    this.element.addEventListener('touchstart', event => this.onTouchStart(event), false);

    window.addEventListener('touchstart', event => this.onTouchStart(event, 'win'), false);
    window.addEventListener('touchend', event => this.onTouchEnd(event, 'win'), false);
    window.addEventListener('touchmove', event => this.onTouchmove(event, 'win'), false);

    this.element.addEventListener('wheel', event => this.onMouseWheel(event), false);

    this.hammer.on('pan', this.emitEvent.bind(this));
    this.hammer.on('panstart', this.emitEvent.bind(this));
    this.hammer.on('panmove', this.emitEvent.bind(this));
    this.hammer.on('panup', this.emitEvent.bind(this));
    this.hammer.on('tap', this.emitEvent.bind(this));
    this.hammer.on('hammer.input', this.emitEvent.bind(this));
  }

  protected initPan() {
    this.hammer.add(new Hammer.Pan({ threshold: 0, pointers: 0 }));
    this.hammer.add(new Hammer.Tap({ time: 200, posThreshold: 50 }));
  }

  /**
   * 兼容冒泡
   * @param type
   * @param event
   */
  protected aliasEvent(type, event, proxy = '') {
    proxy = proxy.length ? proxy + '.' : proxy;
    this.emit(proxy + event.type, event);
    this.emit(proxy + type, event);
  }

  protected emitEvent(event, proxy = '') {
    proxy = proxy.length ? proxy + '.' : proxy;
    this.emit(proxy + event.type, event);
  }

  /**
   * 判断当前touch事件移动点是否需要emit
   * @param event
   * @returns {boolean}
   */
  protected isTouchEventNeedEmit(event) {
    const { pageX, pageY } = event;
    const gotElement = document.elementFromPoint(pageX, pageY);

    if (this.element.contains(gotElement)) {
      const pos = this.getElementOffset(gotElement);
      const touch = event.touches[0] || event.changedTouches[0];

      event.offsetX = touch.pageX - pos.x;
      event.offsetY = touch.pageY - pos.y;
      event.pageX = touch.pageX;
      event.pageY = touch.pageY;

      return true;
    }

    return false;
  }

  /**
   * touch事件没有offsetX,pageX等信息
   * touch事件中没有srcElement,如果移动过程中移出物体还会srcElement还是之前Element
   * @param type
   * @param event
   * @param proxy
   */
  protected touchAliasEventEmit(type: string, event, proxy = '') {
    event = this.compatibleTouchAction(event);

    proxy = proxy.length ? proxy + '.' : proxy;

    if (proxy === 'win.') {
      this.emit(proxy + type, event);
    }

    if (this.isTouchEventNeedEmit(event)) {
      this.emit(type, event);
    }

    // 兼容原有事件Emit
    this.emit(proxy + event.type, event);
  }

  protected onTouchStart(event, proxy = '') {
    this.touchAliasEventEmit('input.start', event, proxy);

    // switch (event.touches.length) {
    //   case 1: // one-fingered touch: rotate
    //     this.aliasEvent('input.start', this.compatibleTouchAction(event), proxy);
    //     break;
    //
    //   case 2: // two-fingered touch: dolly
    //     const dx = event.touches[0].pageX - event.touches[1].pageX;
    //     const dy = event.touches[0].pageY - event.touches[1].pageY;
    //
    //     const distance = Math.sqrt(dx * dx + dy * dy);
    //
    //     this.dollyStart.set(0, distance);
    //     break;
    //
    //   default:
    //     break;
    // }
  }

  protected onTouchEnd(event, proxy = '') {
    this.touchAliasEventEmit('input.end', event, proxy);
  }

  /**
   * @param event
   * @param proxy
   */
  protected onTouchmove(event, proxy = '') {
    const handleTouchMoveDolly = () => {
      const dx = event.touches[0].pageX - event.touches[1].pageX;
      const dy = event.touches[0].pageY - event.touches[1].pageY;

      const distance = Math.sqrt(dx * dx + dy * dy);

      const dollyStart = this.dollyStart;
      const dollyEnd = this.dollyEnd;
      const dollyDelta = new Vector2();

      dollyEnd.set(0, distance);

      dollyDelta.subVectors(dollyEnd, dollyStart);

      const scaleSpeed = Math.pow(0.95, 1);

      event.deltaX = dollyDelta.x * scaleSpeed;
      event.deltaY = dollyDelta.y * scaleSpeed;

      if (dollyDelta.y > 0) {
        // this.aliasEvent('scale+', event);
      } else if (dollyDelta.y < 0) {
        // this.aliasEvent('scale-', event);
      }

      dollyStart.copy(dollyEnd);
    };

    switch (event.touches.length) {
      case 1: // one-fingered touch: rotate
        this.touchAliasEventEmit('input.move', event, proxy);
        break;

      case 2: // two-fingered touch: dolly
        // handleTouchMoveDolly();
        break;

      default:
        break;
    }
  }


  public getElementOffset(obj, parent = document.body) {
    var pos = {
      top: 0,
      left: 0,
    };
    if (obj.offsetParent !== parent && obj.offsetParent) {
      while (obj !== parent && obj.offsetParent) {
        pos.top += obj.offsetTop;
        pos.left += obj.offsetLeft;
        obj = obj.offsetParent;
      }
    } else if (obj.x) {
      pos.left += obj.x;
    } else if (obj.x) {
      pos.top += obj.y;
    }
    return {
      x: pos.left,
      y: pos.top,
    };
  }
  /**
   * 兼容触摸事件
   * 需要修改为新的srcElement
   * @param event
   * @return {any}
   */
  protected compatibleTouchAction(event) {
    const touch = event.touches[0] || event.changedTouches[0];
    const pos = this.getElementOffset(event.srcElement);

    event.offsetX = touch.pageX - pos.x;
    event.offsetY = touch.pageY - pos.y;

    event.pageX = touch.pageX;
    event.pageY = touch.pageY;

    return event;
  }

  protected onMouseWheel(event: WheelEvent) {
    event.deltaY < 0 ? this.aliasEvent('scale+', event) : this.aliasEvent('scale-', event);
  }

  public getElement() {
    return this.element;
  }
}
