export interface IDataObject {
  // @ts-ignore
  buildFromData(data: object);

  buildToData(): object;
}
