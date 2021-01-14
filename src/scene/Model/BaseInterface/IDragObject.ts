import Vector2 from '../../../utils/Math/geometry/Vector2';

export default interface IDragObject {
  beforeDrag(): void;
  beforeDispose(): void;
  dragDone(): void;
  translate(v: Vector2): void;
}
