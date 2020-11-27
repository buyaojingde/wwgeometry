export default class UniqueIndexGenerator {
  // extends Object
  private static mId: number = 0;

  public static resetIndex(): void {
    this.mId = 0;
  }

  public static setIndex(param1: number) {
    if (param1 > this.mId) {
      this.mId = param1;
    }
  }

  public static getIndex(): number {
    this.mId++;
    return this.mId;
  }

  public UniqueIndexGenerator() {
    // throw new AbstractClassError();
  }
}
