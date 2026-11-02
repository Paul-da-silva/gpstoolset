/**
 * Track model and maths shared by every tool (ES module, no DOM).
 *
 * A Track is what every parser hands to the map shell:
 *   {
 *     points: [{ lat, lon, ele?, speed?, t?, cts?, dist?, vspeed? }],
 *     acc:    [{ cts, g }],            // optional extra series (may be empty)
 *     smooth: [speed m/s, median-5],   // one per point
 *     idx:    [point indexes for charts],
 *     meta:   { name, timed, hasVspeed, hasG }
 *   }
 * Point fields: lat/lon degrees, ele metres, speed m/s, t UTC ms (GPS clock),
 * cts ms from video start, dist metres from the first point, vspeed m/s.
 * Parsers return raw points (lat, lon and whatever else they know);
 * buildTrack() fills in dist, vspeed, smooth, idx and meta.
 */

export var MAX_SPEED = 139;
export var CHART_POINTS = 2500;
export var LINE_POINTS = 10000;

export function haversine(a, b) {
  var earth = 6371000;
  var dLat = (b.lat - a.lat) * Math.PI / 180;
  var dLon = (b.lon - a.lon) * Math.PI / 180;
  var lat1 = a.lat * Math.PI / 180;
  var lat2 = b.lat * Math.PI / 180;
  var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return 2 * earth * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function validCoord(lat, lon) {
  return isFinite(lat) && isFinite(lon) &&
    Math.abs(lat) <= 90 && Math.abs(lon) <= 180 &&
    !(lat === 0 && lon === 0);
}

export function fillMissingSpeed(points) {
  var i;
  for (i = 1; i < points.length; i++) {
    if (points[i].speed != null) {
      continue;
    }
    if (points[i].t == null || points[i - 1].t == null) {
      continue;
    }
    var dt = (points[i].t - points[i - 1].t) / 1000;
    if (dt <= 0) {
      continue;
    }
    var speed = haversine(points[i - 1], points[i]) / dt;
    if (speed >= 0 && speed <= MAX_SPEED) {
      points[i].speed = speed;
    }
  }
  if (points.length > 1 && points[0].speed == null && points[1].speed != null) {
    points[0].speed = points[1].speed;
  }
}

export function median(values, win) {
  var half = Math.floor(win / 2);
  var out = new Array(values.length);
  var i;
  for (i = 0; i < values.length; i++) {
    if (values[i] == null || !isFinite(values[i])) {
      out[i] = null;
      continue;
    }
    var bucket = [];
    var start = i - half;
    var end = i + half + 1;
    var j;
    if (start < 0) {
      start = 0;
    }
    if (end > values.length) {
      end = values.length;
    }
    for (j = start; j < end; j++) {
      if (values[j] != null && isFinite(values[j])) {
        bucket.push(values[j]);
      }
    }
    if (!bucket.length) {
      out[i] = null;
      continue;
    }
    bucket.sort(function (a, b) {
      return a - b;
    });
    var mid = Math.floor(bucket.length / 2);
    out[i] = bucket.length % 2 ? bucket[mid] : (bucket[mid - 1] + bucket[mid]) / 2;
  }
  return out;
}

export function thinIndices(count, max) {
  var out = [];
  if (count <= 0) {
    return out;
  }
  if (count <= max) {
    var n;
    for (n = 0; n < count; n++) {
      out.push(n);
    }
    return out;
  }
  var last = count - 1;
  var step = last / (max - 1);
  var prev = -1;
  var k;
  for (k = 0; k < max; k++) {
    var at = Math.round(k * step);
    if (at !== prev) {
      out.push(at);
    }
    prev = at;
  }
  if (out[out.length - 1] !== last) {
    out.push(last);
  }
  return out;
}

/** [lat, lon] pairs for a polyline, thinned to LINE_POINTS. */
export function displayLatLngs(points) {
  var idx = thinIndices(points.length, LINE_POINTS);
  var out = [];
  var i;
  for (i = 0; i < idx.length; i++) {
    var p = points[idx[i]];
    out.push([p.lat, p.lon]);
  }
  return out;
}

export function totalDistance(points) {
  var meters = 0;
  var i;
  for (i = 1; i < points.length; i++) {
    meters += haversine(points[i - 1], points[i]);
  }
  return meters;
}

export function durationMs(points) {
  if (points.length < 2) {
    return null;
  }
  var a = points[0].t;
  var b = points[points.length - 1].t;
  if (a == null || b == null || b < a) {
    return null;
  }
  return b - a;
}

export function hasTimes(points) {
  var i;
  for (i = 0; i < points.length; i++) {
    if (points[i].t == null) {
      return false;
    }
  }
  return points.length > 0;
}

export function anyNumber(values) {
  var i;
  for (i = 0; i < values.length; i++) {
    if (values[i] != null && isFinite(values[i])) {
      return true;
    }
  }
  return false;
}

export function maxOf(values) {
  var max = null;
  var i;
  for (i = 0; i < values.length; i++) {
    if (values[i] == null || !isFinite(values[i])) {
      continue;
    }
    if (max == null || values[i] > max) {
      max = values[i];
    }
  }
  return max;
}

export function minOf(values) {
  var min = null;
  var i;
  for (i = 0; i < values.length; i++) {
    if (values[i] == null || !isFinite(values[i])) {
      continue;
    }
    if (min == null || values[i] < min) {
      min = values[i];
    }
  }
  return min;
}

/** Seconds from the first point (video clock if known, else GPS clock, else index). */
export function elapsedSec(points, point, index) {
  var first = points[0];
  if (!first) {
    return index;
  }
  if (point.cts != null && first.cts != null) {
    return (point.cts - first.cts) / 1000;
  }
  if (point.t != null && first.t != null) {
    return (point.t - first.t) / 1000;
  }
  return index;
}

/** Index of the point whose cts is closest to the given cts (points sorted by cts). */
export function nearestPointIndex(points, cts) {
  if (!points.length || points[0].cts == null || cts == null) {
    return 0;
  }
  var lo = 0;
  var hi = points.length - 1;
  while (lo < hi) {
    var mid = (lo + hi) >> 1;
    if (points[mid].cts < cts) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }
  if (lo > 0 && Math.abs(points[lo - 1].cts - cts) < Math.abs(points[lo].cts - cts)) {
    return lo - 1;
  }
  return lo;
}

/**
 * Add dist (metres from the start) and vspeed (m/s) to each point, in place.
 * Returns true if at least one vertical speed was found.
 */
export function annotatePoints(points) {
  var hasVspeed = false;
  var i;
  if (!points.length) {
    return hasVspeed;
  }
  points[0].dist = 0;
  points[0].vspeed = null;
  for (i = 1; i < points.length; i++) {
    points[i].dist = points[i - 1].dist + haversine(points[i - 1], points[i]);
    points[i].vspeed = null;
    var dtMs = null;
    if (points[i].cts != null && points[i - 1].cts != null) {
      dtMs = points[i].cts - points[i - 1].cts;
    } else if (points[i].t != null && points[i - 1].t != null) {
      dtMs = points[i].t - points[i - 1].t;
    }
    if (dtMs == null) {
      continue;
    }
    var dt = dtMs / 1000;
    if (dt <= 0.02 || points[i].ele == null || points[i - 1].ele == null) {
      continue;
    }
    var vs = (points[i].ele - points[i - 1].ele) / dt;
    if (Math.abs(vs) <= MAX_SPEED) {
      points[i].vspeed = vs;
      hasVspeed = true;
    }
  }
  if (points.length > 1 && points[0].vspeed == null) {
    points[0].vspeed = points[1].vspeed;
  }
  return hasVspeed;
}

/**
 * Turn parser output into a Track (see the file header).
 * options: { name: string, acc: [{ cts, g }] }
 */
export function buildTrack(points, options) {
  var opts = options || {};
  var acc = opts.acc || [];
  var hasVspeed = annotatePoints(points);
  return {
    points: points,
    acc: acc,
    smooth: median(points.map(function (point) {
      return point.speed;
    }), 5),
    idx: thinIndices(points.length, CHART_POINTS),
    meta: {
      name: opts.name || 'track',
      timed: hasTimes(points),
      hasVspeed: hasVspeed,
      hasG: acc.length > 0
    }
  };
}
