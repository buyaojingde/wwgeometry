/**
 * quadtree-js
 * @version 1.2.3
 * @license MIT
 * @author Timo Hausmann
 */

/* https://github.com/timohausmann/quadtree-js.git v1.2.3 */

/**
 * @author lianbo
 * @date 2020-11-11 20:33:13
 * @Description:
 *                    .(x,y)     *
 *                       1       *     0
 *                               *
 *                 ****************************->x
 *                               *
 *                       2       *     3
 *                               *
 *                               *
 *                              ﹀ Y
 * 四叉树的位置区分
 *
 */
export default class Quadtree {
  public maxObjects: number;
  public maxLevels: number;
  public level: number;
  public bounds: any;
  public objects: any[];
  public nodes: any[];

  /**
   * Quadtree Constructor
   * @param  bounds            bounds of the node { x, y, width, height }
   * @param  maxObjects      (optional) max objects a node can hold before splitting into 4 subnodes (default: 10)
   * @param  maxLevels       (optional) total max levels inside root Quadtree (default: 4)
   * @param  level            (optional) depth level, required for subnodes (default: 0)
   */
  constructor(
    bounds: { x: number; y: number; width: number; height: number },
    maxObjects = 10,
    maxLevels = 4,
    level = 0
  ) {
    this.maxObjects = maxObjects || 10;
    this.maxLevels = maxLevels || 4;

    this.level = level || 0;
    this.bounds = bounds;

    this.objects = [];
    this.nodes = [];
  }

  /**
   * Split the node into 4 subnodes
   */
  public split(): void {
    const nextLevel = this.level + 1,
      subWidth = this.bounds.width / 2,
      subHeight = this.bounds.height / 2,
      x = this.bounds.x,
      y = this.bounds.y;

    //top right node
    this.nodes[0] = new Quadtree(
      {
        x: x + subWidth,
        y: y,
        width: subWidth,
        height: subHeight,
      },
      this.maxObjects,
      this.maxLevels,
      nextLevel
    );

    //top left node
    this.nodes[1] = new Quadtree(
      {
        x: x,
        y: y,
        width: subWidth,
        height: subHeight,
      },
      this.maxObjects,
      this.maxLevels,
      nextLevel
    );

    //bottom left node
    this.nodes[2] = new Quadtree(
      {
        x: x,
        y: y + subHeight,
        width: subWidth,
        height: subHeight,
      },
      this.maxObjects,
      this.maxLevels,
      nextLevel
    );

    //bottom right node
    this.nodes[3] = new Quadtree(
      {
        x: x + subWidth,
        y: y + subHeight,
        width: subWidth,
        height: subHeight,
      },
      this.maxObjects,
      this.maxLevels,
      nextLevel
    );
  }

  /**
   * Determine which node the object belongs to
   * @param  pRect      bounds of the area to be checked, with x, y, width, height
   * @return Array            an array of indexes of the intersecting subnodes
   *                          (0-3 = top-right, top-left, bottom-left, bottom-right / ne, nw, sw, se)
   *                          原版没有将分割线计算在内
   */
  public getIndex(pRect: any): number[] {
    const indexes = [],
      verticalMidpoint = this.bounds.x + this.bounds.width / 2,
      horizontalMidpoint = this.bounds.y + this.bounds.height / 2;

    const startIsNorth = pRect.y < horizontalMidpoint,
      startIsWest = pRect.x < verticalMidpoint,
      endIsNorth = pRect.y + pRect.height < horizontalMidpoint,
      endIsWest = pRect.x + pRect.width < verticalMidpoint,
      startIsSouth = !startIsNorth,
      startIsEast = !startIsWest;

    if (endIsWest) {
      if (endIsNorth) {
        indexes.push(1);
        return indexes;
      } else {
        if (startIsSouth) {
          indexes.push(2);
          return indexes;
        } else {
          indexes.push(1);
          indexes.push(2);
          return indexes;
        }
      }
    } else {
      if (startIsEast) {
        if (startIsSouth) {
          indexes.push(3);
          return indexes;
        } else {
          if (endIsNorth) {
            indexes.push(0);
            return indexes;
          } else {
            indexes.push(0);
            indexes.push(3);
            return indexes;
          }
        }
      } else {
        if (startIsSouth) {
          indexes.push(2);
          indexes.push(3);
          return indexes;
        } else {
          if (endIsNorth) {
            indexes.push(0);
            indexes.push(1);
            return indexes;
          } else {
            indexes.push(0);
            indexes.push(1);
            indexes.push(2);
            indexes.push(3);
            return indexes;
          }
        }
      }
    }
  }

  /**
   * Insert the object into the node. If the node
   * exceeds the capacity, it will split and add all
   * objects to their corresponding subnodes.
   * @param  pRect        bounds of the object to be added { x, y, width, height }
   */
  public insert(pRect: any): void {
    let i = 0;
    let indexes;

    //if we have subnodes, call insert on matching subnodes
    if (this.nodes.length) {
      indexes = this.getIndex(pRect);

      for (let i = 0; i < indexes.length; i++) {
        this.nodes[indexes[i]].insert(pRect);
      }
      return;
    }

    //otherwise, store object here
    this.objects.push(pRect);

    //max_objects reached
    if (this.objects.length > this.maxObjects && this.level < this.maxLevels) {
      //split if we don't already have subnodes
      if (!this.nodes.length) {
        this.split();
      }

      //add all objects to their corresponding subnode
      for (i = 0; i < this.objects.length; i++) {
        indexes = this.getIndex(this.objects[i]);
        for (let k = 0; k < indexes.length; k++) {
          this.nodes[indexes[k]].insert(this.objects[i]);
        }
      }

      //clean up this node
      this.objects = [];
    }
  }

  /**
   * Return all objects that could collide with the given object
   * @param  pRect      bounds of the object to be checked { x, y, width, height }
   * @return Array            array with all detected objects
   */
  public retrieve(pRect: any): any[] {
    const indexes = this.getIndex(pRect);
    let returnObjects = this.objects;

    //if we have subnodes, retrieve their objects
    if (this.nodes.length) {
      for (let i = 0; i < indexes.length; i++) {
        returnObjects = returnObjects.concat(
          this.nodes[indexes[i]].retrieve(pRect)
        );
      }
    }

    //remove duplicates
    returnObjects = returnObjects.filter(function (item, index) {
      return returnObjects.indexOf(item) >= index;
    });

    return returnObjects;
  }

  /**
   * Clear the quadtree
   */
  public clear() {
    this.objects = [];

    for (let i = 0; i < this.nodes.length; i++) {
      if (this.nodes.length) {
        this.nodes[i].clear();
      }
    }
    this.nodes = [];
  }
}
