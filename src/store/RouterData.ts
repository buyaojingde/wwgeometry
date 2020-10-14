/**
 **/
import { observable } from 'mobx';
import { EModuleType } from '../global/Enum/EnumData';

class RouterData {
  @observable.ref
  public routeNow: any = {};

  /* 上个路由，防止出现三级路由死循环 */
  @observable
  public fromPath: string = '/';

  /* 当前属于哪个大模块 户型设计/3D设计/硬装设计 */
  @observable
  public currModuleType: EModuleType = EModuleType.LayoutDesign;

  /*上一个路由信息 */
  @observable.ref
  public fromRoute: any = {};

  /** 上一个进入效果图册的路由 */
  private _fromGallery: string = '';
  /** 上一个进入效果图册详情页的路由 */
  private _fromImgInfo: string = '';

  public set fromGallery(val: string) {
    this._fromGallery = val;
  }

  public get fromGallery(): string {
    return this._fromGallery;
  }

  public set fromImgInfo(val: string) {
    this._fromImgInfo = val;
  }

  public get fromImgInfo(): string {
    return this._fromImgInfo;
  }

  public get routerNow() {
    return this.routeNow;
  }

  public setRoute(val) {
    // debugger;
    this.routeNow = val;
  }

  public setFromPath(val) {
    this.fromPath = val;
  }

  public setModuleType(val: EModuleType) {
    this.currModuleType = val;
  }

  public setFromRoute(val) {
    this.fromRoute = val;
  }
}

export default new RouterData();
