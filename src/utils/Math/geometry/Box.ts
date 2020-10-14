import Point from './Point';

export default class Box {
  public min: Point;
  public max: Point;

  public constructor(min: Point, max: Point) {
    this.min = min;
    this.max = max;
  }

  get center() {
    return new Point((this.min.x + this.max.x) / 2, (this.min.y + this.max.y) / 2);
  }

  noIntersect(other_box: Box) {
    return (
      this.max.x < other_box.min.x ||
      this.min.x > other_box.max.x ||
      this.max.y < other_box.min.y ||
      this.min.y > other_box.max.y
    );
  }
}
