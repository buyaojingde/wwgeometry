/*
 * @Author: lianbo
 * @Date: 2020-12-04 20:18:32
 * @LastEditors: lianbo
 * @LastEditTime: 2020-12-08 07:38:54
 * @Description:
 */
export default class CircularLinkedList {
  public length = 0;
  public last: any; // 人人都是头
  public get isEmpty(): boolean {
    return this.length === 0;
  }

  /**
   * @author lianbo
   * @date 2020-12-04 19:47:49
   * @Description: 从尾部添加
   */
  public add(node: any): boolean {
    if (this.isEmpty) {
      this.last = node;
      this.last.next = this.last;
      return true;
    }
    node.next = this.last.next;
    this.last.next = node;
    return true;
  }

  /**
   * @Author: lianbo
   * @Date: 2020-12-08 07:38:26
   * @LastEditors: lianbo
   * @Description: 在一个节点 后插入 某个节点
   * @param {any} node
   * @param {any} preNode
   * @return {*}
   */
  public insert(node: any, preNode: any): boolean {
    node.next = preNode.next;
    preNode.next = node;
    return true;
  }

  /**
   * @author lianbo
   * @date 2020-12-09 16:19:44
   * @Description: 按序号后面插入
   */
  public insertIndex(node: any, index: number): boolean {
    if (index > this.length - 1) return false;
    if (index === this.length - 1 || index === -1) {
      return this.add(node);
    }
    let pre = this.last;
    let i = -1;
    while (i < index) {
      pre = pre.next;
      i++;
    }
    node.next = pre.next;
    pre.next = node;
    return true;
  }

  /**
   * @author lianbo
   * @date 2020-12-04 19:48:44
   * @Description: 存在某个node
   */
  public contain(node: any): boolean {
    if (this.isEmpty || !node) {
      return false;
    }
    if (node === this.last) return true;
    let current = this.last;
    let i = 0;
    while (i < this.length) {
      if (current === node) return true;
      current = current.next;
      i++;
    }
    return false;
  }

  /**
   * @author lianbo
   * @date 2020-12-04 20:07:32
   * @Description: 上一个节点
   */
  public preNode(node: any): any {
    if (this.isEmpty || !node) {
      return false;
    }
    if (node === this.last) {
      let pre = this.last;
      for (let i = 1; i < this.length; i++) {
        pre = pre.next;
      }
      return pre;
    }
    let pre = this.last;
    let current = this.last.next;
    let i = 0;
    while (i < this.length) {
      if (current === node) {
        return pre;
      }
      pre = current;
      current = current.next;
      i++;
    }
    return null; // node 不存在
  }

  public delete(node: any): boolean {
    if (this.isEmpty || !node) {
      return false;
    }
    if (node === this.last) {
      const pre = this.preNode(this.last);
      pre.next = this.last.next;
      this.last = null;
      this.last = pre;
      this.length--;
      return true;
    }
    let pre = this.last;
    let current = this.last.next;
    let i = 1;
    while (i < this.length) {
      if (current === node) {
        pre.next = current.next;
        current = null;
        return true;
      }
      pre = current;
      current = current.next;
      i++;
    }
    return false;
  }

  /**
   * @author lianbo
   * @date 2020-12-09 16:57:31
   * @Description: 根据序号获取node
   */
  index(i: number): any {
    if (i === this.length - 1 || i === -1) {
      return this.last;
    }
    let node = this.last;
    for (let j = -1; j < i; j++) {
      node = node.next;
    }
    return node;
  }

  insertNodes(ips: any[], preNode: any): boolean {
    if (ips.length < 1) return false;
    let next = preNode.next;
    preNode.next = ips[0];
    for (let i = ips.length - 1; i > -1; i++) {
      ips[i].next = next;
      next = ips[i];
    }
    return true;
  }
}
