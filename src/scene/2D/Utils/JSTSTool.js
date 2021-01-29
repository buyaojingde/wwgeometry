const jsts = require('jsts');
const PrecisionModel = jsts.geom.PrecisionModel;
const factory = new jsts.geom.GeometryFactory(new PrecisionModel(100), 0);
const Polygon = jsts.geom.Polygon;
const MultiPolygon = jsts.geom.MultiPolygon;
const bufferParams = new jsts.operation.buffer.BufferParameters(8, 2, 2, 5.0);
const BufferOp = jsts.operation.buffer.BufferOp;
const Coordinate = jsts.geom.Coordinate;
const UnaryUnionOp = jsts.operation.union.UnaryUnionOp;
const Polygonizer = jsts.operation.polygonize.Polygonizer;
const LinearRing = jsts.geom.LinearRing;
const bufferRoundParams = new jsts.operation.buffer.BufferParameters(
  8,
  1,
  1,
  5.0
);

export function coordinate(point) {
  return new Coordinate(point.x, point.y);
}

export function convertCoordinates(points, isClosed) {
  const coords = [];
  for (let i = 0; i < points.length; ++i) {
    coords.push(coordinate(points[i]));
  }
  if (isClosed) {
    coords.push(coordinate(points[0]));
  }
  return coords;
}

export function createLinearRing(point2DList) {
  return factory.createLinearRing(convertCoordinates(point2DList, true));
}

export function createPolygon(point2DList) {
  return factory.createPolygon(createLinearRing(point2DList));
}

export function buffer(g, distance) {
  const bufOp = new BufferOp(g, bufferParams);
  return bufOp.getResultGeometry(distance);
}

export function createMultiPolygon(polygons) {
  return factory.createMultiPolygon(polygons);
}

/**
 * 内缩/外扩时使用圆弧
 */
export function bufferRound(g, distance) {
  const bufOp = new BufferOp(g, bufferRoundParams);
  return bufOp.getResultGeometry(distance);
}

/**
 * 组合生成 带孔多边
 *
 * @param data 需要合并的多边形数组
 * @return 带孔多边形列表
 */
export function union(geometries) {
  const col = [];
  for (const geometry of geometries) {
    col.push(buffer(geometry, 1));
  }
  const geo = buffer(UnaryUnionOp.union(col), -1);
  return geo;
}

/**
 * Get a geometry from a collection of polygons.
 *
 * @param polygons collection
 * @param factory  factory to generate MultiPolygon if required
 * @return null if there were no polygons, the polygon if there was only one, or a MultiPolygon containing all polygons otherwise
 */
export function toPolygonGeometry(polygons, factory) {
  switch (polygons.length) {
    case 0:
      return null; // No valid polygons!
    case 1:
      return polygons[0]; // single polygon - no need to wrap
    default:
      return factory.createMultiPolygon(polygons); // multiple polygons - wrap them
  }
}

/**
 * Add the linestring given to the polygonizer
 *
 * @param lineString  line string
 * @param polygonizer polygonizer
 */
export function addLineString(lineString, polygonizer) {
  if (lineString instanceof LinearRing) {
    // LinearRings are treated differently to line strings : we need a LineString NOT a LinearRing
    lineString = lineString
      .getFactory()
      .createLineString(lineString.getCoordinateSequence());
  }

  // unioning the linestring with the point makes any self intersections explicit.
  const point = lineString
    .getFactory()
    .createPoint(lineString.getCoordinateN(0));
  const toAdd = lineString.union(point);

  //Add result to polygonizer
  polygonizer.add(toAdd);
}

/**
 * Add all line strings from the polygon given to the polygonizer given
 *
 * @param polygon     polygon from which to extract line strings
 * @param polygonizer polygonizer
 */
export function addPolygon(polygon, polygonizer) {
  addLineString(polygon.getExteriorRing(), polygonizer);
  for (let n = polygon.getNumInteriorRing() - 1; n > -1; n--) {
    addLineString(polygon.getInteriorRingN(n), polygonizer);
  }
}

/**
 * 处理自交多边形，转换为MultiPolygon
 * Get / create a valid version of the geometry given. If the geometry is a polygon or multi polygon, self intersections /
 * inconsistencies are fixed. Otherwise the geometry is returned.
 *
 * @param geom
 * @return a geometry
 */
export function validate(geom) {
  if (geom instanceof Polygon) {
    if (geom.isValid()) {
      geom.normalize(); // validate does not pick up rings in the wrong order - this will fix that
      return geom; // If the polygon is valid just return it
    }
    const polygonizer = new Polygonizer();
    addPolygon(geom, polygonizer);
    return toPolygonGeometry(polygonizer.getPolygons(), geom.getFactory());
  } else if (geom instanceof MultiPolygon) {
    if (geom.isValid()) {
      geom.normalize(); // validate does not pick up rings in the wrong order - this will fix that
      return geom; // If the multipolygon is valid just return it
    }
    const polygonizer = new Polygonizer();
    for (let n = geom.getNumGeometries() - 1; n > -1; n--) {
      addPolygon(geom.getGeometryN(n), polygonizer);
    }
    return toPolygonGeometry(polygonizer.getPolygons(), geom.getFactory());
  } else {
    return geom; // In my case, I only care about polygon / multipolygon geometries
  }
}
