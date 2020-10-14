import values from 'lodash/values';
import Container = PIXI.Container;
import Graphics = PIXI.Graphics;
import Sprite = PIXI.Sprite;
import { observe, reaction } from 'mobx';
import { Vector2, Vector3 } from 'three';
import CameraData from '../../../../store/CameraData';
import { IScene2D } from '../../../Interface/IScene';
import DragContainer from '../DragContainer';
import CameraViewBase from './CameraViewBase';

// declare function require(moduleName: string): any;

export default class OribitLayer extends CameraViewBase {
  protected targetView: Container;
  protected dashLine: Container;
  protected targetSize: number = 80;
  protected Hook = {
    position(change) {
      const { newValue } = change;

      this.scene2D.renderd();
    },
    rotation(change) {
      const { x, y, z } = CameraData.position;

      // 计算以TargetPosition为原点的 在X平面的投影向量
      const Vector = new Vector3(x, y, z)
        .sub(new Vector3(...values(CameraData.targetPosition)))
        .projectOnPlane(new Vector3(0, 1, 0));

      // 计算投影向量与 画布方向的夹角
      let Angle = Vector.angleTo(new Vector3(1, 0, 0));
      CameraData.position.z < CameraData.targetPosition.z && (Angle = -Angle);
      this.CameraView.rotation = Math.PI + Angle;
      this.scene2D.renderd();
    },
    targetPosition(change) {
      const { x, y, z } = change.newValue;
      this.targetView.x = x;
      this.targetView.y = z;

    },
    fov(change) {
      const { newValue } = change;
      this.CameraView.span = newValue;
    },
  };
  private lineWidth: number = 2;

  constructor(scene2d: IScene2D) {
    super(scene2d);

    this.mainContainer = new Graphics();
    this.dashLine = new Container();

    this.mainContainer.addChild(this.dashLine);

  }

  protected initData() {
    const hook = this.getHook();
    this.disposeArr = [
      observe(CameraData, 'position', hook.position),
      observe(CameraData, 'fov', hook.fov),
      observe(CameraData, 'targetPosition', hook.targetPosition),
      reaction(
        () => this.scaleStyle,
        scaleNum => {
          this.targetView.scale.set(scaleNum);
          this.lineWidth = scaleNum * 6;
        },
        {
          fireImmediately: true,
        },
      ),
    ];

    hook.position({ newValue: CameraData.position });
    hook.fov({ newValue: CameraData.fov });
    hook.targetPosition({ newValue: CameraData.targetPosition });
  }
}
