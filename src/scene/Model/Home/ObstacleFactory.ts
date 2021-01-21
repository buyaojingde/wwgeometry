import ConfigStructure from '../../../utils/ConfigStructure';
import Obstacle from './Obstacle';

class ObstacleFactory {
  public createObstacle(): Obstacle {
    const ob = new Obstacle();
    ob.setParams(ConfigStructure.obstacleData);
    ob.name = ob.id;
    ob.rvtId = ob.id;
    return ob;
  }

  public createObstacleFrom(obj: any): Obstacle {
    const ob = new Obstacle();
    ob.name = obj.id || ob.id;
    ob.rvtId = obj.id || ob.id;
    return ob;
  }
}
export default new ObstacleFactory();
