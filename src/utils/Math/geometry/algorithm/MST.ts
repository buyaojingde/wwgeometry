/*
 * @Author: lianbo
 * @Date: 2021-03-20 13:29:04
 * @LastEditors: lianbo
 * @LastEditTime: 2021-03-20 13:30:19
 * @Description:
 */
/**
 * @Description: 最小生成树
 */
export class Edge {
  public to!: number;
  public from!: number;
  public cost!: number;

  public constructor(to: number, from: number, cost: number) {
    this.to = to;
    this.from = from;
    this.cost = cost;
  }
}

class UnionFind {
  public id: number[] = [];
  public sz: number[] = [];
  public constructor(n: number) {
    for (let i = 0; i < n; i++) {
      this.id[i] = i;
      this.sz[i] = 1;
    }
  }

  public find(p: number): number {
    let root = p;
    while (root != this.id[root]) root = this.id[root];
    // Do path compression
    while (p != root) {
      const next = this.id[p];
      this.id[p] = root;
      p = next;
    }
    return root;
  }

  public size(p: number): number {
    return this.sz[this.find(p)];
  }

  connected(p: number, q: number) {
    return this.find(p) === this.find(q);
  }

  union(p: number, q: number) {
    const root1 = this.find(p);
    const root2 = this.find(q);
    if (root1 === root2) return;
    if (this.sz[root1] < this.sz[root2]) {
      this.sz[root2] += this.sz[root1];
      this.id[root1] = root2;
    } else {
      this.sz[root1] += this.sz[root2];
      this.id[root2] = root1;
    }
  }
}

class MST {
  public kruskals(edges: Edge[]): number {
    edges.sort((i, j) => i.cost - j.cost);
    const n = edges.length;
    let sum = 0;

    const uf = new UnionFind(n);

    for (const edge of edges) {
      // Skip this edge to avoid creating a cycle in MST
      if (uf.connected(edge.from, edge.to)) continue;

      // Include this edge
      uf.union(edge.from, edge.to);
      sum += edge.cost;

      // Optimization to stop early if we found
      // a MST that includes all the nodes
      if (uf.size(0) === n) break;
    }

    // Make sure we have a MST that includes all the nodes
    if (uf.size(0) != n) return 0;

    return sum;
  }
}

export default new MST();
