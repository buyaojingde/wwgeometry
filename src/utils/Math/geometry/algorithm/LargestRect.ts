import Polygon from '../Polygon';

/*
 * @Author: lianbo
 * @Date: 2021-03-23 22:42:09
 * @LastEditors: lianbo
 * @LastEditTime: 2021-03-23 23:24:21
 * @Description:
 */
export default class LargestRect {
  public static largestRectWithHole(
    poly: Polygon,
    ...args: any[]
  ): Polygon | null {
    let options = arguments.length > 0 && args[0] !== undefined ? args[0] : {};

    if (poly.length < 3) {
      if (options.verbose)
        console.error('polygon has to have at least 3 points', poly);
      return null;
    } // For visualization debugging purposes

    const events = []; // User's input normalization

    options = Object.assign(
      {
        angle: range(-90, 90 + angleStep, angleStep),
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
    var angles =
      options.angle instanceof Array
        ? options.angle
        : typeof options.angle === 'number'
        ? [options.angle]
        : typeof options.angle === 'string' && !isNaN(options.angle)
        ? [Number(options.angle)]
        : [];
    var aspectRatios =
      options.aspectRatio instanceof Array
        ? options.aspectRatio
        : typeof options.aspectRatio === 'number'
        ? [options.aspectRatio]
        : typeof options.aspectRatio === 'string' && !isNaN(options.aspectRatio)
        ? [Number(options.aspectRatio)]
        : [];
    var origins =
      options.origin && options.origin instanceof Array
        ? options.origin[0] instanceof Array
          ? options.origin
          : [options.origin]
        : [];
    var cacheString;

    if (options.cache) {
      cacheString = merge(poly).join(',');
      cacheString += '-'.concat(options.minAspectRatio);
      cacheString += '-'.concat(options.maxAspectRatio);
      cacheString += '-'.concat(options.minHeight);
      cacheString += '-'.concat(options.minWidth);
      cacheString += '-'.concat(angles.join(','));
      cacheString += '-'.concat(origins.join(','));
      if (polyCache[cacheString]) return polyCache[cacheString];
    }

    var area = Math.abs(polygonArea(poly)); // take absolute value of the signed area

    if (area === 0) {
      if (options.verbose) console.error('polygon has 0 area', poly);
      return null;
    } // get the width of the bounding box of the original polygon to determine tolerance

    var _extent = extent(poly, function (d) {
        return d[0];
      }),
      _extent2 = _slicedToArray(_extent, 2),
      minx = _extent2[0],
      maxx = _extent2[1];

    var _extent3 = extent(poly, function (d) {
        return d[1];
      }),
      _extent4 = _slicedToArray(_extent3, 2),
      miny = _extent4[0],
      maxy = _extent4[1]; // simplify polygon

    var tolerance = Math.min(maxx - minx, maxy - miny) * options.tolerance;
    if (tolerance > 0) poly = simplify(poly, tolerance);
    if (options.events)
      events.push({
        type: 'simplify',
        poly: poly,
      }); // get the width of the bounding box of the simplified polygon

    var _extent5 = extent(poly, function (d) {
      return d[0];
    });

    var _extent6 = _slicedToArray(_extent5, 2);

    minx = _extent6[0];
    maxx = _extent6[1];

    var _extent7 = extent(poly, function (d) {
      return d[1];
    });

    var _extent8 = _slicedToArray(_extent7, 2);

    miny = _extent8[0];
    maxy = _extent8[1];
    var boxWidth = maxx - minx,
      boxHeight = maxy - miny; // discretize the binary search for optimal width to a resolution of this times the polygon width

    var widthStep = Math.min(boxWidth, boxHeight) / 50; // populate possible center points with random points inside the polygon

    if (!origins.length) {
      // get the centroid of the polygon
      var centroid = polygonCentroid(poly);

      if (!isFinite(centroid[0])) {
        if (options.verbose) console.error('cannot find centroid', poly);
        return null;
      }

      if (polygonContains(poly, centroid)) origins.push(centroid);
      var nTries = options.nTries; // get few more points inside the polygon

      while (nTries) {
        var rndX = Math.random() * boxWidth + minx;
        var rndY = Math.random() * boxHeight + miny;
        var rndPoint = [rndX, rndY];

        if (polygonContains(poly, rndPoint)) {
          origins.push(rndPoint);
        }

        nTries--;
      }
    }

    if (options.events)
      events.push({
        type: 'origins',
        points: origins,
      });
    var maxArea = 0;
    var maxRect = null;

    for (var ai = 0; ai < angles.length; ai++) {
      var angle = angles[ai];
      var angleRad = (-angle * Math.PI) / 180;
      if (options.events)
        events.push({
          type: 'angle',
          angle: angle,
        });

      for (var i = 0; i < origins.length; i++) {
        var origOrigin = origins[i]; // generate improved origins

        var _polygonRayCast = polygonRayCast(poly, origOrigin, angleRad),
          _polygonRayCast2 = _slicedToArray(_polygonRayCast, 2),
          p1W = _polygonRayCast2[0],
          p2W = _polygonRayCast2[1];

        var _polygonRayCast3 = polygonRayCast(
            poly,
            origOrigin,
            angleRad + Math.PI / 2
          ),
          _polygonRayCast4 = _slicedToArray(_polygonRayCast3, 2),
          p1H = _polygonRayCast4[0],
          p2H = _polygonRayCast4[1];

        var modifOrigins = [];
        if (p1W && p2W)
          modifOrigins.push([(p1W[0] + p2W[0]) / 2, (p1W[1] + p2W[1]) / 2]); // average along with width axis

        if (p1H && p2H)
          modifOrigins.push([(p1H[0] + p2H[0]) / 2, (p1H[1] + p2H[1]) / 2]); // average along with height axis

        if (options.events)
          events.push({
            type: 'modifOrigin',
            idx: i,
            p1W: p1W,
            p2W: p2W,
            p1H: p1H,
            p2H: p2H,
            modifOrigins: modifOrigins,
          });

        for (var _i2 = 0; _i2 < modifOrigins.length; _i2++) {
          var origin = modifOrigins[_i2];
          if (options.events)
            events.push({
              type: 'origin',
              cx: origin[0],
              cy: origin[1],
            });

          var _polygonRayCast5 = polygonRayCast(poly, origin, angleRad),
            _polygonRayCast6 = _slicedToArray(_polygonRayCast5, 2),
            _p1W = _polygonRayCast6[0],
            _p2W = _polygonRayCast6[1];

          if (_p1W === null || _p2W === null) continue;
          var minSqDistW = Math.min(
            pointDistanceSquared(origin, _p1W),
            pointDistanceSquared(origin, _p2W)
          );
          var maxWidth = 2 * Math.sqrt(minSqDistW);

          var _polygonRayCast7 = polygonRayCast(
              poly,
              origin,
              angleRad + Math.PI / 2
            ),
            _polygonRayCast8 = _slicedToArray(_polygonRayCast7, 2),
            _p1H = _polygonRayCast8[0],
            _p2H = _polygonRayCast8[1];

          if (_p1H === null || _p2H === null) continue;
          var minSqDistH = Math.min(
            pointDistanceSquared(origin, _p1H),
            pointDistanceSquared(origin, _p2H)
          );
          var maxHeight = 2 * Math.sqrt(minSqDistH);
          if (maxWidth * maxHeight < maxArea) continue;
          var aRatios = aspectRatios;

          if (!aRatios.length) {
            var minAspectRatio = Math.max(
              options.minAspectRatio,
              options.minWidth / maxHeight,
              maxArea / (maxHeight * maxHeight)
            );
            var maxAspectRatio = Math.min(
              options.maxAspectRatio,
              maxWidth / options.minHeight,
              (maxWidth * maxWidth) / maxArea
            );
            aRatios = range(
              minAspectRatio,
              maxAspectRatio + aspectRatioStep,
              aspectRatioStep
            );
          }

          for (var a = 0; a < aRatios.length; a++) {
            var aRatio = aRatios[a]; // do a binary search to find the max width that works

            var left = Math.max(options.minWidth, Math.sqrt(maxArea * aRatio));
            var right = Math.min(maxWidth, maxHeight * aRatio);
            if (right * maxHeight < maxArea) continue;
            if (options.events && right - left >= widthStep)
              events.push({
                type: 'aRatio',
                aRatio: aRatio,
              });

            while (right - left >= widthStep) {
              var width = (left + right) / 2;
              var height = width / aRatio;

              var _origin = _slicedToArray(origin, 2),
                cx = _origin[0],
                cy = _origin[1];

              var rectPoly = [
                [cx - width / 2, cy - height / 2],
                [cx + width / 2, cy - height / 2],
                [cx + width / 2, cy + height / 2],
                [cx - width / 2, cy + height / 2],
              ];
              rectPoly = polygonRotate(rectPoly, angleRad, origin);
              var insidePoly = polygonInside(rectPoly, poly);

              if (insidePoly) {
                // we know that the area is already greater than the maxArea found so far
                maxArea = width * height;
                rectPoly.push(rectPoly[0]);
                maxRect = {
                  area: maxArea,
                  cx: cx,
                  cy: cy,
                  width: width,
                  height: height,
                  angle: -angle,
                  points: rectPoly,
                };
                left = width; // increase the width in the binary search
              } else {
                right = width; // decrease the width in the binary search
              }

              if (options.events)
                events.push({
                  type: 'rectangle',
                  areaFraction: (width * height) / area,
                  cx: cx,
                  cy: cy,
                  width: width,
                  height: height,
                  angle: angle,
                  insidePoly: insidePoly,
                });
            }
          }
        }
      }
    }

    if (options.cache) {
      polyCache[cacheString] = maxRect;
    }

    return options.events
      ? Object.assign(maxRect || {}, {
          events: events,
        })
      : maxRect;
  }
}
