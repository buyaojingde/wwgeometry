import ObjectIndex from './ObjectIndex';

export default class ObjectNamed extends ObjectIndex {
  constructor() {
    super();
  }

  protected _name!: string;

  get name(): string {
    return this._name;
  }

  set name(param1: string) {
    this._name = param1;
  }
}
