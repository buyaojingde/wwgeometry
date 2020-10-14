import ObjectIndex from '../../scene/Model/BaseInterface/ObjectIndex';

export default class ModelContext extends ObjectIndex {
  private _renderPolicy: boolean = true;
  private _unitMode: string;
  private _wallHeight: number;
  private _wallThickness: number;
  private _holeOffThickness: number; // 30mm对应的像素
  private _plasterHeight: number;
  private _plasterThickness: number;
  private _skirtingHeight: number;
  private _skirtingThickness: number;
  private _lockBearingWall: boolean;
  private _unitDiagramScale: number;
  private _sceneWidth: number;
  private _sceneHeight: number;
  private static _modelContext: ModelContext;

  constructor() {
    super();
    this._renderPolicy = true;
    this._unitMode = 'mm';
    this._wallHeight = 280.0;
    this._wallThickness = 12.0;
    this._holeOffThickness = 3.07199; // 30mm对应的像素
    this._plasterHeight = 10.24;
    this._plasterThickness = 3.072;
    this._skirtingHeight = 8.192;
    this._skirtingThickness = 1.024;
    this._lockBearingWall = false;
    this._unitDiagramScale = 1;
    // this._sceneWidth = 7144
    this._sceneWidth = 12000;
    // this._sceneHeight = 7144
    this._sceneHeight = 12000;
  }

  public get unitMode(): string {
    return this._unitMode;
  }

  public set unitMode(param1: string) {
    this._unitMode = param1;
  }

  public get wallHeight(): number {
    return this._wallHeight;
  }

  public set wallHeight(param1: number) {
    this._wallHeight = param1;
  }

  public get holeOffThickness(): number {
    return this._holeOffThickness;
  }

  public get wallThickness(): number {
    return this._wallThickness;
  }

  public set wallThickness(param1: number) {
    this.wallThickness = param1;
  }

  public get plasterHeight(): number {
    return this._plasterHeight;
  }

  public get plasterThickness(): number {
    return this._plasterThickness;
  }

  public get skirtingHeight(): number {
    return this._skirtingHeight;
  }

  public get skirtingThickness(): number {
    return this._skirtingThickness;
  }

  public get unitDiagramScale(): number {
    return this._unitDiagramScale;
  }

  public set unitDiagramScale(param1: number) {
    this._unitDiagramScale = param1;
  }

  public get sceneWidth(): number {
    return this._sceneWidth;
  }

  public set sceneWidth(param1: number) {
    this._sceneWidth = param1;
  }

  public get sceneHeight(): number {
    return this._sceneHeight;
  }

  public set sceneHeight(param1: number) {
    this._sceneHeight = param1;
  }

  public copyFrom(param1: ModelContext) {
    if (param1) {
      this.unitMode = param1.unitMode;
      this.wallHeight = param1.wallHeight;
      this.wallThickness = param1.wallThickness;
      this.unitDiagramScale = param1.unitDiagramScale;
      this.sceneHeight = param1.sceneHeight;
      this.sceneWidth = param1.sceneWidth;
    }
  }

  public static getInstance(): ModelContext {
    if (!this._modelContext) {
      this._modelContext = new ModelContext();
    }
    return this._modelContext;
  }

  public get renderPolicy(): boolean {
    return this._renderPolicy;
  }

  public set renderPolicy(val: boolean) {
    this._renderPolicy = val;
  }
}
