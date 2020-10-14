import { Box2, Vector2 } from 'three';
import Polygon2D from './Polygon2D';
import Vector2D from './Vector2D';

export default class BoundingBox2D extends Box2 {
  public min: any;
  public max: any;

  constructor(min: Vector2D = null, max: Vector2D = null) {
    super(min as any, max as any);
    if (!min && !max) {
      this.invalidate();
    } else {
      this.max = max;
      this.min = min;
    }
  }

  public clamp(boundbox: BoundingBox2D): BoundingBox2D {
    const vec3: Vector2D = this.getExtent();
    const vec5: Vector2D = boundbox.getExtent();

    if (vec3.x < vec5.x || vec3.y < vec5.y) {
      return boundbox.clone();
    }
    let _loc2: Vector2D = boundbox.min.clone();
    _loc2.x = Math.max(this.min.x, _loc2.x);
    _loc2.y = Math.max(this.min.y, _loc2.y);
    const _loc4: Vector2D = _loc2.add(vec5);
    _loc2.add(vec5).x = Math.min(this.max.x, _loc4.x);
    _loc4.y = Math.min(this.max.y, _loc4.y);
    _loc2 = _loc4.subtract(vec5);

    return new BoundingBox2D(_loc2, _loc4);
  }

  public getCenter(): Vector2D {
    return this.min.add(this.max).multiplyBy(0.5);
  }

  public invalidate() {
    this.min = Vector2D.MAX_V2D.clone();
    this.max = Vector2D.MIN_V2D.clone();
    return;
  }

  public includeValue(vec: Vector2D) {
    this.min = Vector2D.min(this.min, vec);
    this.max = Vector2D.max(this.max, vec);
    return;
  }

  public includeValues(vecs: Vector2D[]) {
    for (const tVec of vecs) {
      this.includeValue(tVec);
    }
    return;
  }

  public includeBoundingBox(boundbox: BoundingBox2D) {
    this.min = Vector2D.min(this.min, boundbox.min);
    this.max = Vector2D.max(this.max, boundbox.max);
    return;
  }

  public containsValue(vec: Vector2D): boolean {
    return vec.x >= this.min.x && vec.x <= this.max.x && vec.y >= this.min.y && vec.y <= this.max.y;
  }

  public contains(boundbox: BoundingBox2D): boolean {
    return this.containsValue(boundbox.min) && this.containsValue(boundbox.max);
  }

  public isIntersected(boundbox: BoundingBox2D): boolean {
    if (boundbox.min.x > this.max.x || boundbox.max.x < this.min.x) {
      return false;
    }
    if (boundbox.min.y > this.max.y || boundbox.max.y < this.min.y) {
      return false;
    }
    return true;
  }

  public restrictInside(boundbox: BoundingBox2D): Vector2D {
    const vec: Vector2D = new Vector2D(boundbox.max.x - boundbox.min.x, boundbox.max.y - boundbox.min.y);
    if (boundbox.max.x > this.max.x) {
      boundbox.max.x = this.max.x;
      boundbox.min.x = this.max.x - vec.x;
    } else if (boundbox.min.x < this.min.x) {
      boundbox.min.x = this.min.x;
      boundbox.max.x = this.min.x + vec.x;
    }
    if (boundbox.max.y > this.max.y) {
      boundbox.max.y = this.max.y;
      boundbox.min.y = this.max.y - vec.y;
    } else if (boundbox.min.y < this.min.y) {
      boundbox.min.y = this.min.y;
      boundbox.max.y = this.min.y + vec.y;
    }
    return boundbox.getCenter();
  }

  public getIntersection(boundbox: BoundingBox2D): BoundingBox2D {
    const vec2: Vector2D = new Vector2D();
    const vec3: Vector2D = new Vector2D();
    vec2.x = Math.max(this.min.x, boundbox.min.x);
    vec2.y = Math.max(this.min.y, boundbox.min.y);
    vec3.x = Math.min(this.max.x, boundbox.max.x);
    vec3.y = Math.min(this.max.y, boundbox.max.y);
    return new BoundingBox2D(vec2, vec3);
  }

  public getExtent(): Vector2D {
    return this.max.subtract(this.min);
  }

  public getArea(): number {
    const vec: Vector2D = this.getExtent();
    return vec.x * vec.y;
  }

  public isValid(): boolean {
    return this.min.x <= this.max.x && this.min.y <= this.max.y;
  }

  public getWidth(): number {
    return Math.abs(this.max.x - this.min.x);
  }

  public getHeight(): number {
    return Math.abs(this.max.y - this.min.y);
  }

  get boundingPoints(): Vector2D[] {
    const vertices: Vector2D[] = [];
    vertices.push(new Vector2D(this.min.x, this.min.y));
    vertices.push(new Vector2D(this.max.x, this.min.y));
    vertices.push(new Vector2D(this.max.x, this.max.y));
    vertices.push(new Vector2D(this.min.x, this.max.y));

    return vertices;
  }

  public setFromCenterAndSize(center: Vector2, size: Vector2): this {
    const v1 = new Vector2();

    const halfSize = v1.copy(size).multiplyScalar(0.5);
    this.min.copy(center).sub(halfSize);
    this.max.copy(center).sum(halfSize);

    return this;
  }

  public get polygon(): Polygon2D {
    return new Polygon2D(this.boundingPoints);
  }

  public transform(vec1: Vector2D = null): BoundingBox2D {
    ([this.min, this.max] as Vector2D[]).forEach(point => point.transformBy(vec1));

    return this;
  }

  public setFromCenter(center: Vector2D): Box2 {
    this.transform(center.clone().sub(this.getCenter()));

    return this;
  }
}
