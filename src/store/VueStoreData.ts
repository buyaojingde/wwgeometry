/**
* * by lianbo.guo
 **/
import { action, computed, observable } from 'mobx';
import { ELightViewType, WallShowType } from '../global/Enum/EnumRender';

class VueStoreData {
  @observable
  public isSideBarShow = true; // 是否显示侧边栏
  @observable
  public _designTabShow = '2DStage'; // Design页的显示Tab
  @observable
  public previewTabShow = 'normal'; // Preview页的显示Tab

  @observable
  public panoramaViewing = false;
  @observable
  public isOpen = true;
  @observable
  public loadingPercent = '0%'; //

  /** 墙体隐藏专用 */
  @observable
  public isWallShow = false; // 是否开启墙体显示（默认不显示墙体）
  @observable
  public _wallVisibleMode = 'transparent'; // 墙体隐藏模式 {经典墙体:classic} {透明墙体:transparent(默认)}

  // 渲染使用
  @observable
  public isColorDark = false; // 背景颜色是否开启为黑色
  @observable
  private _wallShowType; // 是否为有墙模式

  get wallShowType(): WallShowType {
    return this._wallShowType;
  }

  set wallShowType(val: WallShowType) {
    this._wallShowType = val;
  }

  public showRenderConfirm = true; // 是否显示点击渲染时的弹窗
  // @observable
  // public isCeilingShow = true; // 是否开启吊顶隐藏

  @observable
  public isCameraInRoom = true; // 相机是否在墙内
  /** 墙体隐藏专用 */

  @observable
  public onDraw2D = false; // 是否正在画2D
  @observable
  public caseImgParams = {
    name: '',
    paperType: '平面布置图',
    paperShow: ['尺寸线', '房间名', '房间面积', '家具'],
    designer: '', // 设计师姓名
    tel: '',
    background: '精美背景',
    size: 'A4',
    auditor: '', // 审核人姓名
    caseDesc: '', // 方案说明
  }; // 导出方案图参数

  @observable
  public displayTexture: boolean = false; // 是否编辑背景墙贴图
  @observable
  public unitScale = 10; // 全局单位 相对于cm 的放大倍数
  @observable
  public allRoomArea = 0; // 整个户型所有房间的套内面积
  @observable
  public isHomeRender = false; // 户型是否渲染完成
  @observable
  public enableStage3D = false; // 3D场景在画布中存在
  @observable
  public inputEditing = false; // 判断全局是否有input框正在输入
  @observable
  public usingPrototypeRoom = false; // 是否正在应用样板间
  @observable
  public miniVeiwSize = { width: '220px', height: '220px' }; // 渲染小窗口size

  @observable
  public enableHardDesign3D = false; // 当前是否处于硬装3D界面
  @observable
  public startRender = false; // 是否开始渲染
  @observable
  public multiLogin = false; // 当前是否处于多点登录状态

  @observable
  public loginAbnormal = false; // 当前是否处于登录异常状态，包括多点登录和方案冲突

  @observable
  public hotKeyHelp = ''; // 显示快捷键帮助对话框ctrl+alt+d

  @observable
  public isShowCeilFurniture = false; // 是否显示顶面家具

  @observable
  public isShowCeilModel = true; // 是否显示顶面下的天花模型

  @observable
  public isShowFloorFurniture = true; // 是否显示地面家具

  @observable
  public hasRooms = undefined; // 就否存在封闭的房间

  @observable
  public homeIsEmpty = undefined; // 当前场景是否为空

  @observable
  public loadHomeDataTimes = 0; // 请求homeData次数，只记录第一次和第二次，用于入口弹框判断

  @observable
  public allStepPosition: any = {}; // 新手指引所有高亮元素的position属性
  @observable.ref
  public guideStep: any = {}; // 新手指引当前执行到的步骤状态
  @observable
  public change3DBackground: boolean;
  @observable
  public showPrototypeRoomGuide: boolean = false;
  @observable
  public enableStage2D: boolean = false; // 开启2D场景
  public firstRenderVisitor: boolean = true; // 是否第一弹出渲染6k
  @observable
  public firstEffectVisitor: boolean = true; // 是否第一次点效果优先
  @observable
  public isShowCircle: boolean = true; // 是否效果图删上显示小圆点
  // 是否显示应用样板间指引

  @observable
  public textureStraw: boolean = false; // 材质吸管状态

  @observable
  public lightView: ELightViewType = ELightViewType.TwoDView;

  @observable
  public holeStoneMaterialUrl: string = ''; // 属性面板上显示的窗台石/门槛石材质图

  @observable
  public userType: number = null; // 用户类型  0-免费用户  1-付费用户
  @observable
  public paverReplaceIndex: number = 0;
  @observable
  public pbr: boolean = false; // 是否显示pbr效果

  @observable
  public renderCameraType = 'Perspective';

  @computed
  public get unit() {
    switch (this.unitScale) {
      case 10:
        return 'mm';
      case 1:
        return 'cm';
      case 0.01:
        return 'm';

      default:
        return '';
    }
  }

  @computed
  public get designTabShow() {
    return this._designTabShow;
  }

  /**
   * 设置全景预览状态
   * 为了停在2D 3D场景避免预览时卡顿
   * @param {boolean} status
   */
  public setPanoramaViewStatus(status: boolean) {
    this.panoramaViewing = status;
  }

  public setIsOpen(val) {
    this.isOpen = val;
  }
  public setInputEditing(val) {
    this.inputEditing = val;
  }
  public setWallShow(val) {
    this.isWallShow = val;
  }

  public get wallVisibleMode() {
    if (!!localStorage.getItem('wallVisibleMode')) {
      this._wallVisibleMode = localStorage.getItem('wallVisibleMode');
    }
    return this._wallVisibleMode;
  }

  public setWallVisibleMode(val) {
    this._wallVisibleMode = val;
    localStorage.setItem('wallVisibleMode', val);
  }

  public setOnDraw2D(val) {
    this.onDraw2D = val;
  }

  public setCameraInRoom(val) {
    this.isCameraInRoom = val;
  }

  public setSideBarShow(val) {
    this.isSideBarShow = val;
  }

  public setDesignTabShow(val) {
    this._designTabShow = val;
  }

  public setHotKeyHelp(val) {
    this.hotKeyHelp = val;
  }

  public setPreviewTabShow(val) {
    this.previewTabShow = val;
  }

  public setLoadingPercent(val) {
    this.loadingPercent = val;
  }

  public setCaseImgOptions(key, val) {
    this.caseImgParams = { ...this.caseImgParams, [key]: val };
  }

  public setAllRoomArea(val) {
    this.allRoomArea = val;
  }

  public setDisplayTexture(val) {
    this.displayTexture = val;
  }

  // 设置当前正在应用样板间的状态
  public setUsingPrototypeRoom(val) {
    this.usingPrototypeRoom = val;
  }

  // 设置当前材质吸管状态
  public setTextureStraw(val: boolean) {
    this.textureStraw = val;
  }

  // 设置用户状态
  public setUserType(val: number) {
    this.userType = val;
  }

  /**
   * 该属性只能被对应组件mounted的时候修改
   * @param val
   */
  @action
  public setEnableStage3D(val: boolean) {
    this.enableStage3D = val;
  }

  @action
  public setShowCeilFurniture(val: boolean) {
    this.isShowCeilFurniture = val;
  }

  @action
  public setIsShowCeilModel(val: boolean) {
    this.isShowCeilModel = val;
  }

  @action
  public setShowFloorFurniture(val: boolean) {
    this.isShowFloorFurniture = val;
  }

  public setHasRooms(val: boolean) {
    this.hasRooms = val;
  }

  public setHomeEmpty(val) {
    this.homeIsEmpty = val;
  }

  public setLoadHomeDataTimes(val) {
    this.loadHomeDataTimes = val;
  }

  public setElementPosition(page, step, positionInfo) {
    !this.allStepPosition[page] && (this.allStepPosition = { ...this.allStepPosition, [page]: [] });
    this.allStepPosition[page].push({ step: step - 1, position: positionInfo });
    if (page === '3DStage' && step === 1) {
      this.allStepPosition[page].push({ step, position: positionInfo });
    }
  }

  public setGuideStep(page, step) {
    if (page) {
      this.guideStep = { ...this.guideStep, page, step };
    } else {
      this.guideStep = {};
    }
  }
  public setShowPrototypeRoomGuide(val) {
    this.showPrototypeRoomGuide = val;
  }
  public setFirstRenderVisitor(val) {
    this.firstRenderVisitor = val;
  }

  public setFirstEffectVisitor(val) {
    this.firstEffectVisitor = val;
    window.localStorage.firstEffectVisitor = val;
  }

  public setIsShowCircle(val) {
    this.isShowCircle = val;
    window.localStorage.isShowCircle = val;
  }

  public setEnableStage2D(b: boolean) {
    this.enableStage2D = b;
  }
  public setStartRender(b: boolean) {
    this.startRender = b;
  }

  public setMultiLogin(val: boolean) {
    this.multiLogin = val;
  }

  public setLoginAbnormal(val: boolean) {
    this.loginAbnormal = val;
  }

  public setLightView(val: ELightViewType) {
    this.lightView = val;
  }

  public setHoleStoneMaterialUrl(val: string) {
    this.holeStoneMaterialUrl = val;
  }

  public setPaverReplaceIndex(index: number) {
    this.paverReplaceIndex = index;
  }

  public setPbr(index: boolean) {
    this.pbr = index;
  }

  public setRenderCameraType(val: string) {
    this.renderCameraType = val;
  }
}

export default new VueStoreData();
