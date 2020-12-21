// 数组辅助方法
export default class AH<T> {
  public static clone<T>(a: T[]): T[] {
    const t = new Array<T>();
    for (const i of a) {
      t.push(i);
    }
    return t;
  }

  public static distinct<T>(a: T[]): T[] {
    if (a.length < 2) {
      return a;
    }
    const newArr = new Array<T>();
    for (const i0 of a) {
      if (!newArr.includes(i0)) {
        newArr.push(i0);
      }
    }
    return newArr;
  }

  public static equalsPositive<T>(a: T[], b: T[]): boolean {
    if (a.length !== b.length) {
      return false;
    }
    if (a.length === 0) {
      return true;
    }
    const a0 = a[0];
    const index = b.indexOf(a0);
    if (index === -1) {
      return false;
    }
    const offset = index;
    const count = a.length;
    for (let i = 0; i < count; i++) {
      const newI = (offset + i) % count;
      if (a[i] !== b[newI]) {
        return false;
      }
    }
    return true;
  }

  public static equalsReverse<T>(a: T[], b: T[]): boolean {
    const arr = new Array<T>();
    for (const i of a) {
      arr.push(i);
    }
    const t = arr.reverse();
    return this.equalsPositive(t, b);
  }

  public static equals<T>(a: T[], b: T[]): boolean {
    return this.equalsPositive(a, b) || this.equalsReverse(a, b);
  }

  public static equalsNormal<T>(a: T[], b: T[]): boolean {
    if (a.length !== b.length) {
      return false;
    }
    if (a.length === 0) {
      return true;
    }
    for (const a0 of a) {
      if (!b.includes(a0)) {
        return false;
      }
    }
    for (const b0 of b) {
      if (!a.includes(b0)) {
        return false;
      }
    }
    return true;
  }

  public static remove<T>(a: T[], item: T): boolean {
    const i = a.indexOf(item);
    if (i === -1) {
      return false;
    }
    a.splice(i, 1);
    return true;
  }

  public static removeArray<T>(a: T[], b: T[]): boolean {
    for (const item of b) {
      if (!AH.remove(a, item)) {
        return false;
      }
    }
    return true;
  }

  public static arrayIntersection<T>(a: T[], b: T[]): boolean {
    for (const i of a) {
      if (b.includes(i)) {
        return true;
      }
    }
    return false;
  }

  /**
   * @Description:拉平多维数组
   * @param
   * @data 2019/12/25
   */
  public static flatArray<T>(a: any[]): any[] {
    return a.reduce((begin, current) => {
      Array.isArray(current)
        ? begin.push(...AH.flatArray(current))
        : begin.push(current);
      return begin;
    }, []);
  }

  /**
   * @Description: 二维数组转为一维数组
   * @param
   * @data 2019/12/25
   */
  public static twoArrToOne<T>(a: T[][]): T[] {
    return Array.prototype.concat.apply([], a);
  }

  public static contains<T>(a: T[], b: T[]): boolean {
    for (const b0 of b) {
      if (!a.includes(b0)) {
        return false;
      }
    }
    return true;
  }

  /**
   * @Description: 取一个数组中最小的一个值
   * @param
   * @data 2019/12/25
   */
  // @ts-ignore
  public static getMinItem<T>(arr: T[], compare): T {
    if (arr.length < 1) {
      // @ts-ignore
      return null;
    }
    let minItem = arr[0];
    for (const item of arr) {
      if (compare(item, minItem) === -1) {
        minItem = item;
      }
    }
    return minItem;
  }

  public static arrContact<T>(arr0: T[], arr1: T[]): T[] {
    if (!arr0) {
      if (!arr1) {
        // @ts-ignore
        return null;
      } else {
        return [...arr1];
      }
    } else {
      if (!arr1) {
        return [...arr0];
      } else {
        return [...arr0, ...arr1];
      }
    }
  }

  public static convertLevelID(levelid: string, str: string): string {
    const i = str.indexOf('#');
    if (i !== -1) {
      return levelid + str.slice(i);
    }
    return levelid + '#' + str;
  }

  /**
   * @Description: 加载贴图数据的克隆方法
   * @author
   * @data 2019/12/25
   */
  // @ts-ignore
  public static textureItemVOClone(map, id) {
    const result = map.get(id);
    if (result) {
      return result.clone();
    } else {
      console.error('贴图丢失...');
      return null;
    }
  }
}
