import BimElement2D from '../ViewObject/BimElement2D';

export default class BimElementLayer {
  private _container: PIXI.Container;
  private _elements: any[] = [];
  public constructor(elements: any[]) {
    this._container = new PIXI.Container();
    this._elements = elements;
  }

  public render(): void {
    for (const element of this._elements) {
      const b2d = new BimElement2D(element);
      b2d.renderWith(this._container);
    }
  }

  public attachContainer(container: PIXI.Container) {
    container.addChild(this._container);
  }
}
