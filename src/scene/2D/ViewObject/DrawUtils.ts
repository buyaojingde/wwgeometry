import Room from '../../Model/Home/Room';
import ObserveVector2D from '../../Model/ObserveMath/ObserveVector2D';
import Edge2D from './Edge2D';
import Spot2D from './Spot2D';

class DrawUtils {
  drawEdgeAndSpot(room: Room, container: PIXI.Graphics) {
    const polygon = room.polygon;
    const polyPs = polygon.vertices.map(
      (item) => new ObserveVector2D(item.x, item.y)
    );
    for (const p of polyPs) {
      const spot = new Spot2D([p]);
      container.addChild(spot);
    }
    const tmpEdges: any[] = [];
    const lastV = polyPs[polyPs.length - 1];
    polyPs.reduce((prev, current, index) => {
      const seg = [prev, current];
      tmpEdges.push(seg);
      return current;
    }, lastV);
    for (const edge of tmpEdges) {
      const edge2d = new Edge2D(edge);
      container.addChild(edge2d);
    }
  }
}
export default new DrawUtils();
