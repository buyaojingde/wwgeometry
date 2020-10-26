/**
 * * by lianbo.guo
 **/

import "pixi-layers";

// export class Group {
//   private _index: number;
//   private _isShow: boolean;
//   constructor(i: number, b: boolean) {
//     this._index = i;
//     this._isShow = b;
//   }
// }
export enum LayerOrder {
  Column = 0,
  Controller,
  Camera,
}

const Groups: any = {};
let i = 0;
while (LayerOrder[i]) {
  // LayerOrder[i] = group;
  Groups[i] = new PIXI.display.Group(i, true);
  Groups[i].name = LayerOrder[i];
  i++;
}

export let layerOrderGroups = Groups;
