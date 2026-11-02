/**
 * Video clock to GPS sample (ES module, no DOM).
 *
 * Track points carry cts: milliseconds from the start of the video
 * (GPMF-relative), not the GPS wall clock. sampleAt() finds the position,
 * speed, altitude and so on at a given video time, interpolating between
 * samples. Before the first sample it reports waiting: true (no GPS fix yet).
 */

function lerp(a, b, f) {
  if (a == null || !isFinite(a)) {
    return b;
  }
  if (b == null || !isFinite(b)) {
    return a;
  }
  return a + (b - a) * f;
}

function lerpLon(a, b, f) {
  var delta = b - a;
  if (delta > 180) {
    delta -= 360;
  }
  if (delta < -180) {
    delta += 360;
  }
  var lon = a + delta * f;
  if (lon > 180) {
    lon -= 360;
  }
  if (lon < -180) {
    lon += 360;
  }
  return lon;
}

function firstAtOrAfter(samples, ms) {
  var lo = 0;
  var hi = samples.length - 1;
  while (lo <= hi) {
    var mid = (lo + hi) >> 1;
    if (samples[mid].cts < ms) {
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return lo;
}

/** Interpolated sample at video time ms, or { waiting, timed } when there is none. */
export function sampleAt(points, ms) {
  if (!points.length || points[0].cts == null) {
    return { waiting: true, timed: false };
  }
  if (ms < points[0].cts) {
    return { waiting: true, timed: true };
  }
  var last = points[points.length - 1];
  if (ms >= last.cts) {
    return {
      waiting: false,
      timed: true,
      lat: last.lat,
      lon: last.lon,
      ele: last.ele,
      speed: last.speed,
      dist: last.dist,
      vspeed: last.vspeed
    };
  }
  var idx = firstAtOrAfter(points, ms);
  var next = points[idx];
  var prev = points[idx - 1];
  if (!prev || !next) {
    var only = next || prev || last;
    return {
      waiting: false,
      timed: true,
      lat: only.lat,
      lon: only.lon,
      ele: only.ele,
      speed: only.speed,
      dist: only.dist,
      vspeed: only.vspeed
    };
  }
  var span = next.cts - prev.cts;
  var f = span > 0 ? (ms - prev.cts) / span : 0;
  return {
    waiting: false,
    timed: true,
    lat: prev.lat + (next.lat - prev.lat) * f,
    lon: lerpLon(prev.lon, next.lon, f),
    ele: lerp(prev.ele, next.ele, f),
    speed: lerp(prev.speed, next.speed, f),
    dist: lerp(prev.dist, next.dist, f),
    vspeed: lerp(prev.vspeed, next.vspeed, f)
  };
}

/** G-force at video time ms from acc [{ cts, g }], or null. */
export function gAt(acc, ms) {
  if (!acc.length || acc[0].cts == null || ms < acc[0].cts) {
    return null;
  }
  var last = acc[acc.length - 1];
  if (ms >= last.cts) {
    return last.g;
  }
  var idx = firstAtOrAfter(acc, ms);
  var next = acc[idx];
  var prev = acc[idx - 1];
  if (!prev || !next) {
    return next ? next.g : null;
  }
  var span = next.cts - prev.cts;
  var f = span > 0 ? (ms - prev.cts) / span : 0;
  return lerp(prev.g, next.g, f);
}

/** Logs to the console if the maths above is broken. Runs once at start. */
export function selfCheckSync() {
  var pts = [
    { cts: 2000, lat: 0, lon: 0, ele: 0, speed: 0, dist: 0, vspeed: 0 },
    { cts: 4000, lat: 2, lon: 4, ele: 10, speed: 8, dist: 100, vspeed: 2 }
  ];
  var early = sampleAt(pts, 1000);
  var mid = sampleAt(pts, 3000);
  var at = sampleAt(pts, 2000);
  var end = sampleAt(pts, 9000);
  var bad = !early.waiting || !early.timed || mid.waiting ||
    Math.abs(mid.lat - 1) > 1e-9 || Math.abs(mid.lon - 2) > 1e-9 ||
    Math.abs(mid.ele - 5) > 1e-9 || at.waiting || Math.abs(at.lat) > 1e-9 ||
    end.waiting || Math.abs(end.lat - 2) > 1e-9;
  if (bad && window.console) {
    window.console.error('GPS sync check failed', early, mid, at, end);
  }
}
