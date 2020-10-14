export interface IViewObject {
  load(): void;

  destroy(): void;

  showBoundingBox(bShow: boolean): void;
}
