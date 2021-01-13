import Obstacle from './Obstacle';

class ObstacleFactory {
  private _index = 0;

  public createObstacle(): Obstacle {
    const ob = new Obstacle();
    ob.name = '00' + this._index;
    ob.rvtId = ob.name;
    this._index++;
    return ob;
  }
}
export default new ObstacleFactory();
