/**
 * Track edits shared by the GPX viewer (ES module, no DOM).
 * Each function returns a new point list, or null when there is nothing to do.
 * Points keep lat, lon, ele (metres), speed (m/s) and t (UTC ms).
 */
import { median } from './track.js';

export function clonePoint(point) {
  return {
    lat: point.lat,
    lon: point.lon,
    ele: point.ele == null || !isFinite(point.ele) ? null : point.ele,
    speed: point.speed == null || !isFinite(point.speed) ? null : point.speed,
    t: point.t == null || !isFinite(point.t) ? null : point.t
  };
}

function cloneAll(points) {
  var out = [];
  var i;
  for (i = 0; i < points.length; i++) {
    out.push(clonePoint(points[i]));
  }
  return out;
}

/** Metres from point p to the straight line between a and b. */
function crossTrack(p, a, b) {
  var latScale = 111320;
  var lonScale = 111320 * Math.cos(((a.lat + b.lat) / 2) * Math.PI / 180);
  var bx = (b.lon - a.lon) * lonScale;
  var by = (b.lat - a.lat) * latScale;
  var px = (p.lon - a.lon) * lonScale;
  var py = (p.lat - a.lat) * latScale;
  var len2 = bx * bx + by * by;
  if (len2 === 0) {
    return Math.sqrt(px * px + py * py);
  }
  var t = (px * bx + py * by) / len2;
  if (t < 0) {
    t = 0;
  } else if (t > 1) {
    t = 1;
  }
  var dx = px - t * bx;
  var dy = py - t * by;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Douglas–Peucker. toleranceM is the farthest a dropped point may sit
 * from the simplified line, in metres. Endpoints stay.
 */
export function simplifyPoints(points, toleranceM) {
  var n = points.length;
  var tol = Number(toleranceM);
  if (n < 3 || !isFinite(tol) || tol <= 0) {
    return null;
  }
  var keep = new Array(n);
  keep[0] = true;
  keep[n - 1] = true;
  var stack = [[0, n - 1]];
  while (stack.length) {
    var pair = stack.pop();
    var from = pair[0];
    var to = pair[1];
    var maxDist = 0;
    var maxAt = -1;
    var i;
    for (i = from + 1; i < to; i++) {
      var dist = crossTrack(points[i], points[from], points[to]);
      if (dist > maxDist) {
        maxDist = dist;
        maxAt = i;
      }
    }
    if (maxAt !== -1 && maxDist > tol) {
      keep[maxAt] = true;
      stack.push([from, maxAt]);
      stack.push([maxAt, to]);
    }
  }
  var out = [];
  for (i = 0; i < n; i++) {
    if (keep[i]) {
      out.push(clonePoint(points[i]));
    }
  }
  if (out.length >= n) {
    return null;
  }
  return out;
}

/**
 * Keep points from start through end (inclusive indexes).
 * Null when that range is already the whole track, or shorter than two points.
 */
export function trimPoints(points, start, end) {
  var n = points.length;
  if (n < 3) {
    return null;
  }
  var a = Math.round(Number(start));
  var b = Math.round(Number(end));
  if (!isFinite(a) || !isFinite(b)) {
    return null;
  }
  if (a < 0) {
    a = 0;
  }
  if (b < 0) {
    b = 0;
  }
  if (a > n - 1) {
    a = n - 1;
  }
  if (b > n - 1) {
    b = n - 1;
  }
  if (b < a) {
    var swap = a;
    a = b;
    b = swap;
  }
  if (b - a < 1) {
    return null;
  }
  if (a === 0 && b === n - 1) {
    return null;
  }
  return cloneAll(points.slice(a, b + 1));
}

/**
 * Reverse the path. Times stay in the original order so the clock still
 * runs forward. Speed is cleared; the caller fills it from the new order.
 */
export function reversePoints(points) {
  if (points.length < 2) {
    return null;
  }
  var times = [];
  var timed = true;
  var i;
  for (i = 0; i < points.length; i++) {
    if (points[i].t == null || !isFinite(points[i].t)) {
      timed = false;
      break;
    }
    times.push(points[i].t);
  }
  var out = cloneAll(points);
  out.reverse();
  for (i = 0; i < out.length; i++) {
    out[i].speed = null;
    if (timed) {
      out[i].t = times[i];
    }
  }
  return out;
}

function fillGaps(ele) {
  var filled = 0;
  var i = 0;
  while (i < ele.length) {
    if (ele[i] != null) {
      i += 1;
      continue;
    }
    var start = i;
    while (i < ele.length && ele[i] == null) {
      i += 1;
    }
    var end = i;
    var gap = end - start;
    if (gap > 12) {
      continue;
    }
    var left = start > 0 ? ele[start - 1] : null;
    var right = end < ele.length ? ele[end] : null;
    if (left == null && right == null) {
      continue;
    }
    var j;
    for (j = start; j < end; j++) {
      if (left != null && right != null) {
        var f = (j - start + 1) / (gap + 1);
        ele[j] = left + (right - left) * f;
      } else {
        ele[j] = left != null ? left : right;
      }
      filled += 1;
    }
  }
  return filled;
}

/**
 * Replace isolated elevation spikes and fill short gaps from neighbours.
 * Does not fetch elevation. Returns new points, or null when nothing changed.
 */
export function fixElevation(points) {
  if (points.length < 3) {
    return null;
  }
  var ele = [];
  var any = false;
  var i;
  for (i = 0; i < points.length; i++) {
    var value = points[i].ele;
    if (value == null || !isFinite(value)) {
      ele.push(null);
    } else {
      ele.push(value);
      any = true;
    }
  }
  if (!any) {
    return null;
  }
  var changed = 0;
  var pass;
  for (pass = 0; pass < 4; pass++) {
    for (i = 1; i < ele.length - 1; i++) {
      if (ele[i] == null || ele[i - 1] == null || ele[i + 1] == null) {
        continue;
      }
      var prev = Math.abs(ele[i] - ele[i - 1]);
      var next = Math.abs(ele[i] - ele[i + 1]);
      var span = Math.abs(ele[i - 1] - ele[i + 1]);
      if (prev > 25 && next > 25 && span < 20) {
        ele[i] = (ele[i - 1] + ele[i + 1]) / 2;
        changed += 1;
      }
    }
  }
  var smooth = median(ele, 5);
  for (i = 0; i < ele.length; i++) {
    if (ele[i] == null || smooth[i] == null) {
      continue;
    }
    if (Math.abs(ele[i] - smooth[i]) > 15) {
      ele[i] = smooth[i];
      changed += 1;
    }
  }
  changed += fillGaps(ele);
  if (!changed) {
    return null;
  }
  var out = cloneAll(points);
  for (i = 0; i < out.length; i++) {
    out[i].ele = ele[i];
  }
  return out;
}
