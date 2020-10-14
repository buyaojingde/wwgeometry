import { getEnv, isDevEnv } from '../utils';

export default class WebData {
  public static uid: string;
  public get ID(): string {
    return this._id;
  }

  public set ID(val: string) {
    this._id = val;
  }

  public get planID(): string {
    return this._planID;
  }

  public set planID(val: string) {
    this._planID = val;
  }

  public get is_floors(): number {
    return this._isFloor;
  }

  public set is_floors(val: number) {
    this.is_floors = val;
  }

  public get cadID(): number {
    return this._cadID;
  }

  public set cadID(val: number) {
    this._cadID = val;
  }

  public get planName(): string {
    return this._planName;
  }

  public set planName(val: string) {
    this._planName = val;
  }

  public get save(): boolean {
    return this._save;
  }

  public set save(val: boolean) {
    this._save = val;
  }

  public get uid(): number {
    return this._uid;
  }

  public set uid(val: number) {
    this._uid = val;
  }

  public get auth(): string {
    return this._auth;
  }

  public set auth(val: string) {
    this._auth = val;
  }

  public get uName(): string {
    return this._uName;
  }

  public set uName(val: string) {
    this._uName = val;
  }

  public get cookie(): string {
    return this._cookie;
  }

  public set cookie(val: string) {
    this._cookie = val;
  }

  public get returnToFlashUrl(): string {
    return this._returnToFlashUrl;
  }

  public set returnToFlashUrl(val: string) {
    this._returnToFlashUrl = val;
  }

  public get role(): number {
    return this._role;
  }

  public set role(val: number) {
    this._role = val;
  }

  public get nodeKey(): string {
    return this._nodeKey;
  }

  public set nodeKey(val: string) {
    this._nodeKey = val;
  }

  public get designToken(): string {
    return this._designToken;
  }

  public set designToken(val: string) {
    this._designToken = val;
  }

  public get enterpriseCompanyLogo(): string {
    return this._enterpriseCompanyLogo;
  }

  public set enterpriseCompanyLogo(val: string) {
    this._enterpriseCompanyLogo = val;
  }

  public get enterpriseCompanyName(): string {
    return this._enterpriseCompanyName;
  }

  public set enterpriseCompanyName(val: string) {
    this._enterpriseCompanyName = val;
  }

  public get enterpriseCompanyTelephone(): string {
    return this._enterpriseCompanyTelephone;
  }

  public set enterpriseCompanyTelephone(val: string) {
    this._enterpriseCompanyTelephone = val;
  }

  public get enterpriseCompanyAddr(): string {
    return this._enterpriseCompanyAddr;
  }

  public set enterpriseCompanyAddr(val: string) {
    this._enterpriseCompanyAddr = val;
  }

  public get subUid(): string {
    return this._subUid;
  }

  public set subUid(val: string) {
    this._subUid = val;
  }

  public get designSource(): number {
    return this._designSource;
  }

  public set designSource(val: number) {
    this._designSource = val;
  }

  /*  用户id */
  private static webData: WebData;
  private _id: string; // 加密的户型ID
  private _planID: string; // 户型id
  private _isFloor: number; // 是否是空户型（用于区别常规户型和户型库户型）0：常规户型   1：户型库
  private _cadID: number; // 0时不是cad户型，不为0时为cad户型的id
  private _planName: string;
  private _uid: number;
  private _auth: string; // 授权信息
  private _uName: string; // 装修公司名称
  private _cookie: string;
  private _save: boolean = true;
  private _returnToFlashUrl: string; // 返回旧版flash的url
  private _role: number; // 用户角色
  private _nodeKey: string; // 漏斗模型标识，用于单点登录判断
  private _designToken: string; // 单点登录检测token
  private _enterpriseCompanyLogo: string = ''; // 公司logo
  private _enterpriseCompanyName: string = ''; // 装企公司名称
  private _enterpriseCompanyTelephone: string = ''; // 装企公司电话
  private _enterpriseCompanyAddr: string = ''; // 装企公司地址
  private _subUid: string = ''; // 子账号id
  private _designSource: number = 0; // 方案来源 0 自建 1 平台
  public static getInstance(): WebData {
    if (!this.webData) {
      this.webData = new WebData();
    }
    return this.webData;
  }

  constructor() {
    this._isFloor = 0;
    this._cadID = 0;
    this._planName = '';
    this._uName = '';
    this._cookie = '';
    this._role = 2;
    if (isDevEnv()) {
      const env = getEnv() as any;
      this._id = env.WEBDATA_ID;
      this._planID = env.WEBDATA_PLAN_ID;
      this._uid = Number(env.WEBDATA_UID);
      this._auth = env.WEBDATA_AUTH;
    } else {
      this._id = '';
      this._planID = '';
      this._uid = 0;
      this._auth = '';
    }
  }

  public isStartupCAD(): boolean {
    return this._cadID > 0;
  }

  private parseFlashVar(val: any) {
    if (val) {
      val.id && (this._id = val.id);
      val.planid && (this._planID = val.planid);
      val.is_floors && (this._isFloor = val.is_floors);
      val.cadID && (this._cadID = val.cadID);
      val.planname && (this._planName = val.planname);
      val.uid && (this._uid = val.uid);
      val.auth && (this._auth = val.auth);
      val.auth && (this._cookie = val.auth);
      val.uName && (this._uName = val);
      val.url && (this._returnToFlashUrl = val.url);
      this._save = val.save === 1 || val.save === '1' ? true : false;
      typeof val.role !== 'undefined' && (this._role = Number(val.role));
      !!val.node_key && (this._nodeKey = val.node_key);
      !!val.design_token && (this._designToken = val.design_token);
      !!val.avatar && (this.enterpriseCompanyLogo = val.avatar);
      !!val.shortName && (this.enterpriseCompanyName = val.shortName);
      if (!!val.telephone && val.telephone !== '-') {
        this.enterpriseCompanyTelephone = val.telephone;
      }
      !!val.shortAddr && (this._enterpriseCompanyAddr = val.shortAddr);
      !!val.sub_uid && (this.subUid = String(val.sub_uid));
      !!val.designSource && (this.designSource = Number(val.designSource));
    }
  }
}
