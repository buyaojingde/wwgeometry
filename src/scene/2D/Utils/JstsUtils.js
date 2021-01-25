const jsts = require('jsts');
const factory = new jsts.geom.GeometryFactory();
export function createMultiPolygon(polygons){
  return factory.createMultiPolygon(polygons);
}

export function createPolgyon()
