/**
* * by lianbo.guo
 **/
import { autorun, observable } from 'mobx';
import Scene2D from '..';
import Application = PIXI.Application;
import HookManager from '../../../utils/HookManager';
import WebGLRenderer = PIXI.WebGLRenderer;
import Layer = PIXI.display.Layer;
import BaseEvent2D from '../Events/Base';
import Stage = PIXI.Container;
import { layerOrderGroups } from '../Layer/LayerOrder';

import { EShapeViewType } from '../../../global/Enum/EnumData';
import { Renderer2D } from '../../Base/Renderer';

export default class BaseScene extends HookManager {
  @observable
  protected size: number = 750; // canvas的尺寸

  public static apps: Set<Application> = new Set(); // 所有2D场景集合
  protected name: string = 'none';
  protected app: Application;
  protected Vue: any;
  protected bindNode: HTMLElement;
  protected Scene2D: Scene2D;
  private _objectType: EShapeViewType;

  constructor(opt: {}) {
    super();

    const options = {
      width: this.size,
      height: this.size,
      forceFXAA: true,
      antialias: true,
      resolution: this.resolution,
      scene2dwall: null,
      ...opt,
    };
    this.Scene2D = Scene2D.getInstance();
    this.app = new Application(options);

    if (!(this.app.renderer instanceof WebGLRenderer)) {
      this.app.renderer.destroy();
      this.app.renderer = Renderer2D;
    }

    this.app.stage = new Stage();
    BaseScene.apps.add(this.app);
    setTimeout(() => {
      this.app.view.setAttribute('id', this.name);
      this.bindElement(this.Scene2D.rendererDom);
      this.init();
      this.resize();
    });
  }

  public get appStage(): any {
    return this.app.stage;
  }

  public get resolution() {
    return 1;
  }

  get objectType() {
    return this._objectType;
  }

  set objectType(val: EShapeViewType) {
    this._objectType = val;
  }
  protected init() {
    this.app.stage.rotation = Math.PI;

    this.app.renderer.plugins.interaction.setTargetElement(this.Scene2D.rendererDom, this.app.renderer.resolution);
    this.app.renderer.plugins.interaction.resolution = 1;

    this.initLayers();

    const fn = this.resize.bind(this);
    this.Scene2D.on('resize', fn);

    this.disposeArr.push(
      autorun(() => {
        // 同步Scene2D中的scale
        const { x, y } = this.Scene2D.scale;

        this.app.stage.scale.set(-x, -y);
      }),
      autorun(() => {
        // 同步Scene2D中的scale
        const { x, y } = this.Scene2D.position;
        this.app.stage.position.set(x, y);
      }),
      () => this.Scene2D.off('resize', fn),
    );
  }

  public bindVue(Vue) {
    this.Vue = Vue;
    this.bindElement(Vue.$refs.container);
  }

  public bindElement(bindNode: HTMLElement) {
    if (!bindNode.querySelector('#' + this.app.view.getAttribute('id'))) {
      bindNode.appendChild(this.app.view);
      this.bindNode = bindNode;
    }
  }

  public resize(width: number = 0, height: number = 0) {
    if (!width && !height) {
      if (!this.bindNode) {
        return;
      }
      const element = this.bindNode;
      width = element.clientWidth;
      height = element.clientHeight;
    }
    this.app.renderer.resize(width, height);
  }

  protected addController(contrl: BaseEvent2D) {
    this.disposeArr.push(() => contrl.destroy());
  }

  public dispose() {
    super.dispose();
    BaseScene.apps.delete(this.app);
    this.app.destroy(true);
  }

  public getStage() {
    return this.app.stage;
  }

  public get rendererDom() {
    return this.Scene2D.rendererDom;
  }

  public get DOMEventListener() {
    return this.Scene2D.DOMEventListener;
  }

  public getRenderer() {
    return this.app.renderer;
  }
  public getScene2D() {
    return this.Scene2D;
  }
  private initLayers() {
    const stage = this.getStage();
    for (const key in layerOrderGroups) {
      if (layerOrderGroups.hasOwnProperty(key)) {
        const group = layerOrderGroups[key];
        // stage.addChild(new Layer(group));
      }
    }
  }
}