import BoundingBox2D from './BoundingBox2D';
import Line2D from './Line2D';
import Polygon2D from './Polygon2D';
import Vector2D from './Vector2D';

export default class Box2D {
  private _boolean: boolean = true;
  private _polygon2D: Polygon2D;

  // @ts-ignore
  constructor(vec: Vector2D = null) {
    this._size = new Vector2D();
    this._scale = new Vector2D(1, 1);
    this._position = new Vector2D();
    this._vertices = [];
    this._boundingPoints = [];
    this._boundingBox = new BoundingBox2D();
    // @ts-ignore
    this._polygon2D = new Polygon2D();
    if (vec) {
      this.size = vec;
      this.calculateVertices();
    }
    return;
  }

  private _size: Vector2D;

  public get size(): Vector2D {
    return this._size.clone();
  }

  public set size(vec: Vector2D) {
    if (vec && !this._size.equals(vec)) {
      this._size.copyFrom(vec);
      this.calculateVertices();
      this.calculateBoundingPoints();
    }
  }

  private _scale: Vector2D;

  public get scale(): Vector2D {
    return this._scale.clone();
  }

  public set scale(vec: Vector2D) {
    if (!vec) {
      this._scale = new Vector2D(1, 1);
      this._boolean = true;
    } else if (!this._scale.equals(vec)) {
      this._scale.copyFrom(vec);
      this._boolean = true;
    }
  }

  private _position: Vector2D;

  public get position(): Vector2D {
    return this._position.clone();
  }

  public set position(vec: Vector2D) {
    if (!vec) {
      this._position = new Vector2D();
      this._boolean = true;
    } else if (!this._position.equals(vec)) {
      this._position.copyFrom(vec);
      this._boolean = true;
    }
  }

  private _rotation: number = 0;

  public get rotation(): number {
    return this._rotation;
  }

  public set rotation(param1: number) {
    if (this._rotation !== param1) {
      this._rotation = param1;
      this._boolean = true;
    }
  }

  private _vertices: Vector2D[];

  public get vertices(): Vector2D[] {
    return this._vertices;
  }

  private _boundingPoints: Vector2D[];

  public get boundingPoints(): Vector2D[] {
    if (this._boolean) {
      this.composeTransforms();
    }
    return this._boundingPoints;
  }

  private _boundingBox: BoundingBox2D;

  public get boundingBox(): BoundingBox2D {
    if (this._boolean) {
      this.composeTransforms();
    }
    return this._boundingBox;
  }

  public get transformChanged(): boolean {
    return this._boolean;
  }

  public set transformChanged(param1: boolean) {
    this._boolean = param1;
  }

  public get x(): number {
    return this._position.x;
  }

  public set x(num: number) {
    if (this._position.x !== num) {
      this._position.x = num;
      this._boolean = true;
    }
  }

  public get y(): number {
    return this._position.y;
  }

  public set y(param1: number) {
    if (this._position.y !== param1) {
      this._position.y = param1;
      this._boolean = true;
    }
  }

  public get scaleX(): number {
    return this._scale.x;
  }

  public set scaleX(num: number) {
    if (this._scale.x !== num) {
      this._scale.x = num;
      this._boolean = true;
    }
  }

  public get scaleY(): number {
    return this._scale.y;
  }

  public set scaleY(num: number) {
    if (this._scale.y !== num) {
      this._scale.y = num;
      this._boolean = true;
    }
  }

  public static buildFromBoundingPoints(vecs: Vector2D[]): Box2D {
    if (!vecs || vecs.length !== 4) {
      // @ts-ignore
      return null;
    }
    const _loc2: any = new Box2D();
    _loc2.setBoundingPoints(vecs);
    return _loc2;
  }

  public static buildWithoutScale(vec1: Vector2D, vec2: Vector2D, num: number = 0): Box2D {
    return new Box2D(vec1).setTransform(vec2, new Vector2D(1, 1), num);
  }

  public clone(): any {
    const box: any = new Box2D(this._size);
    box.position = this._position.clone();
    box.scale = this._scale.clone();
    box.rotation = this._rotation;
    return box;
  }

  public calculateBoundingPoints(): Vector2D[] {
    let num = 0;
    this._boundingBox.invalidate();
    num = 0;
    while (num < 4) {
      this._boundingPoints[num] = this.localToGlobal(this._vertices[num]);
      this._boundingBox.includeValue(this._boundingPoints[num]);
      num++;
    }
    return this._boundingPoints;
  }

  public setBoundingPoints(vecs: Vector2D[]): Box2D {
    if (!vecs || vecs.length !== 4) {
      return this;
    }
    this._position = Polygon2D.calculateCenter(vecs);
    this._size = new Vector2D(vecs[0].distance(vecs[1]), vecs[1].distance(vecs[2]));
    this._rotation = Vector2D.angleTo(vecs[0], vecs[1]);
    this.calculateVertices();
    this.calculateBoundingPoints();
    return this;
  }

  // @ts-ignore
  public setTransform(vec1: Vector2D = null, vec2: Vector2D = null, num: number = 0): Box2D {
    if (!vec1) {
      vec1 = new Vector2D(0, 0);
    }
    if (!vec2) {
      vec2 = new Vector2D(1, 1);
    }
    this._position.copyFrom(vec1);
    this._scale.copyFrom(vec2);
    this._rotation = num;
    this._boolean = true;
    return this;
  }

  public composeTransforms(): void {
    this._boolean = false;
    this.calculateBoundingPoints();
    return;
  }

  public localToGlobal(vec: Vector2D): Vector2D {
    const _loc2: any = vec.scale(this._scale);
    _loc2.rotateBy(this._rotation);
    return _loc2.incrementBy(this._position);
  }

  public globalToLocal(vec: Vector2D): Vector2D {
    // @ts-ignore
    let _loc2: Vector2D = null;
    _loc2 = vec.subtract(this._position);
    _loc2.rotateBy(-this._rotation);
    return _loc2.divideBy(this._scale);
  }

  public getXDirection(): Vector2D {
    return this.boundingPoints[1].subtract(this.boundingPoints[0]);
  }

  public getYDirection(): Vector2D {
    return this.boundingPoints[3].subtract(this.boundingPoints[0]);
  }

  public getDirections(): Vector2D[] {
    return [this.getXDirection(), this.getYDirection()];
  }

  public getPolygon(): Vector2D[] {
    return this.boundingPoints;
  }

  public getPolygon2D(): Polygon2D {
    return new Polygon2D(this.boundingPoints);
  }

  public contains(vec: Vector2D): boolean {
    const vec4: any = this.globalToLocal(vec);
    const vec2: any = this._vertices[0];
    const vec3: any = this._vertices[2];
    return vec4.x >= vec2.x && vec4.x <= vec3.x && vec4.y >= vec2.y && vec4.y <= vec3.y;
  }

  public translateEdges(
    num1: number = 0,
    num2: number = 0,
    num3: number = 0,
    num4: number = 0,
  ): Box2D {
    const box7: any = this._size.clone();
    const vec5: any = this._position.clone();
    box7.offsetBy(num4 + num2, num1 + num3);
    box7.x = Math.abs(box7.x);
    box7.y = Math.abs(box7.y);
    if (box7.equals(Vector2D.ORIGIN_V2D)) {
      return this.clone();
    }
    vec5.offset((num2 - num4) / 2, this._rotation).copyTo(vec5);
    vec5.offset((num3 - num1) / 2, this._rotation + 3.14159 / 2).copyTo(vec5);
    const box6: any = new Box2D(box7);
    new Box2D(box7).position = vec5;
    box6.rotation = this._rotation;
    return box6;
  }

  public getEdges(): Line2D[] {
    let num: number = 0;
    if (this._boolean) {
      this.composeTransforms();
    }

    const lines = [];
    num = 0;
    while (num < 4) {
      lines[num] = new Line2D(this.boundingPoints[num], this.boundingPoints[(num + 1) % 4]);
      num++;
    }
    return lines;
  }

  private calculateVertices(): Vector2D[] {
    this._vertices[0] = new Vector2D(-this._size.x / 2, -this._size.y / 2);
    this._vertices[1] = new Vector2D(this._size.x / 2, -this._size.y / 2);
    this._vertices[2] = new Vector2D(this._size.x / 2, this._size.y / 2);
    this._vertices[3] = new Vector2D(-this._size.x / 2, this._size.y / 2);
    return this._vertices;
  }
}
