import ArrayUtils from '../../tool/ArrayUtils';
import SimplifyTool from '../../tool/SimplifyTool';
import Point from '../Point';
import Polygon from '../Polygon';

/*
 * @Author: lianbo
 * @Date: 2021-03-23 22:42:09
 * @LastEditors: lianbo
 * @LastEditTime: 2021-03-24 23:09:52
 * @Description:
 */
export default class LargestRect {
  public static angleStep = 5; // step size for angles (in degrees); has linear impact on running time
  public static aspectRatioStep = 0.5; // step size for the aspect ratio
  public static largestRectWithHole(
    poly: Polygon,
    holes: Polygon[],
    options?: any
  ): Polygon | null {
    options = Object.assign(
      {
        angle: ArrayUtils.range(
          -90,
          90 + LargestRect.angleStep,
          LargestRect.angleStep
        ),
        cache: true,
        maxAspectRatio: 15,
        minAspectRatio: 1,
        minHeight: 0,
        minWidth: 0,
        nTries: 20,
        tolerance: 0.02,
        verbose: false,
      },
      options
    );
    const angles =
      options.angle instanceof Array
        ? options.angle
        : typeof options.angle === 'number'
        ? [options.angle]
        : typeof options.angle === 'string' && !isNaN(options.angle)
        ? [Number(options.angle)]
        : [];
    const aspectRatios =
      options.aspectRatio instanceof Array
        ? options.aspectRatio
        : typeof options.aspectRatio === 'number'
        ? [options.aspectRatio]
        : typeof options.aspectRatio === 'string' && !isNaN(options.aspectRatio)
        ? [Number(options.aspectRatio)]
        : [];
    const origins =
      options.origin && options.origin instanceof Array
        ? options.origin[0] instanceof Array
          ? options.origin
          : [options.origin]
        : [];

    const area = Math.abs(poly.area()); // take absolute value of the signed area

    if (area === 0) {
      if (options.verbose) console.error('polygon has 0 area', poly);
      return null;
    } // get the width of the bounding box of the original polygon to determine tolerance

    const _extent = ArrayUtils.extent(poly.vertices, function (d: any) {
      return d.x;
    });
    let minx = _extent[0],
      maxx = _extent[1];

    const _extent3 = ArrayUtils.extent(poly.vertices, function (d: any) {
      return d.y;
    });
    let miny = _extent3[0],
      maxy = _extent3[1]; // simplify polygon

    const tolerance = Math.min(maxx - minx, maxy - miny) * options.tolerance;
    if (tolerance > 0) poly = SimplifyTool.simplify(poly, tolerance);

    const _extent5 = ArrayUtils.extent(poly.vertices, function (d: any) {
      return d.x;
    });

    minx = _extent5[0];
    maxx = _extent5[1];

    const _extent7 = ArrayUtils.extent(poly.vertices, function (d: any) {
      return d.y;
    });

    miny = _extent7[0];
    maxy = _extent7[1];
    const boxWidth = maxx - minx,
      boxHeight = maxy - miny; // discretize the binary search for optimal width to a resolution of this times the polygon width

    const widthStep = Math.min(boxWidth, boxHeight) / 50; // populate possible center points with random points inside the polygon

    if (!origins.length) {
      // get the centroid of the polygon
      const centroid = poly.centroid();

      if (!isFinite(centroid.x)) {
        if (options.verbose) console.error('cannot find centroid', poly);
        return null;
      }

      if (poly.inside(centroid)) origins.push(centroid);
      let nTries = options.nTries; // get few more points inside the polygon

      while (nTries) {
        const rndX = Math.random() * boxWidth + minx;
        const rndY = Math.random() * boxHeight + miny;
        const rndPoint = new Point(rndX, rndY);

        if (poly.inside(rndPoint)) {
          origins.push(rndPoint);
        }

        nTries--;
      }
    }

    let maxArea = 0;
    let maxRect: any;

    for (let ai = 0; ai < angles.length; ai++) {
      const angle = angles[ai];
      const angleRad = (-angle * Math.PI) / 180;

      for (let i = 0; i < origins.length; i++) {
        const origOrigin = origins[i]; // generate improved origins

        const _polygonRayCast = poly.polygonRayCast(
            origOrigin,
            holes,
            angleRad
          ),
          p1W = _polygonRayCast[0],
          p2W = _polygonRayCast[1];

        const _polygonRayCast3 = poly.polygonRayCast(
            origOrigin,
            holes,
            angleRad + Math.PI / 2
          ),
          p1H = _polygonRayCast3[0],
          p2H = _polygonRayCast3[1];

        const modifOrigins = [];
        if (p1W && p2W)
          modifOrigins.push(
            new Point((p1W[0] + p2W[0]) / 2, (p1W[1] + p2W[1]) / 2)
          ); // average along with width axis

        if (p1H && p2H)
          modifOrigins.push(
            new Point((p1H[0] + p2H[0]) / 2, (p1H[1] + p2H[1]) / 2)
          ); // average along with height axis

        for (let _i2 = 0; _i2 < modifOrigins.length; _i2++) {
          const origin = modifOrigins[_i2];

          const _polygonRayCast5 = poly.polygonRayCast(origin, holes, angleRad),
            _p1W = _polygonRayCast5[0],
            _p2W = _polygonRayCast5[1];

          if (_p1W === null || _p2W === null) continue;
          const minSqDistW = Math.min(
            origin.distanceToPointSquared(_p1W),
            origin.distanceToPointSquared(_p2W)
          );
          const maxWidth = 2 * Math.sqrt(minSqDistW);

          const _polygonRayCast7 = poly.polygonRayCast(
              origin,
              holes,
              angleRad + Math.PI / 2
            ),
            _p1H = _polygonRayCast7[0],
            _p2H = _polygonRayCast7[1];

          if (_p1H === null || _p2H === null) continue;
          const minSqDistH = Math.min(
            origin.distanceToPointSquared(_p1H),
            origin.distanceToPointSquared(_p2H)
          );
          const maxHeight = 2 * Math.sqrt(minSqDistH);
          if (maxWidth * maxHeight < maxArea) continue;
          let aRatios = aspectRatios;

          if (!aRatios.length) {
            const minAspectRatio = Math.max(
              options.minAspectRatio,
              options.minWidth / maxHeight,
              maxArea / (maxHeight * maxHeight)
            );
            const maxAspectRatio = Math.min(
              options.maxAspectRatio,
              maxWidth / options.minHeight,
              (maxWidth * maxWidth) / maxArea
            );
            aRatios = ArrayUtils.range(
              minAspectRatio,
              maxAspectRatio + LargestRect.aspectRatioStep,
              LargestRect.aspectRatioStep
            );
          }

          for (let a = 0; a < aRatios.length; a++) {
            const aRatio = aRatios[a]; // do a binary search to find the max width that works

            let left = Math.max(options.minWidth, Math.sqrt(maxArea * aRatio));
            let right = Math.min(maxWidth, maxHeight * aRatio);
            if (right * maxHeight < maxArea) continue;

            while (right - left >= widthStep) {
              const width = (left + right) / 2;
              const height = width / aRatio;

              const cx = origin.x,
                cy = origin.y;

              let rectPoly = new Polygon([
                [cx - width / 2, cy - height / 2],
                [cx + width / 2, cy - height / 2],
                [cx + width / 2, cy + height / 2],
                [cx - width / 2, cy + height / 2],
              ]);
              const vs = rectPoly.polygonRotate(angleRad, origin);
              rectPoly = new Polygon(vs);
              const insidePoly = poly.insidePolygon(rectPoly);

              if (insidePoly) {
                // we know that the area is already greater than the maxArea found so far
                maxArea = width * height;
                rectPoly.vertices.push(rectPoly.vertices[0]);
                maxRect = rectPoly;
                left = width; // increase the width in the binary search
              } else {
                right = width; // decrease the width in the binary search
              }
            }
          }
        }
      }
    }
    return maxRect;
  }
}
