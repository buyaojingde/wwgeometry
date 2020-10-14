import { observable } from 'mobx';
import ObjectIndex from './ObjectIndex';

export default class ObjectNamed extends ObjectIndex {
  protected _name: string;

  constructor() {
    super();
  }

  get name(): string {
    return this._name;
  }

  set name(param1: string) {
    this._name = param1;
  }
}
