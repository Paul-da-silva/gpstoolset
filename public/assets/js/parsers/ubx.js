/**
 * UBX (u-blox binary) log parser (ES module). Reads the file in the browser.
 * Nothing is uploaded.
 *
 * parse(file) → { name, segments: [{ name, points }], waypoints }
 * A point is { lat, lon, ele?, speed?, t? }. NAV-PVT is preferred;
 * NAV-POSLLH is a fallback when there is no NAV-PVT. Other messages
 * (including RXM raw measurements) are ignored.
 *
 * Frame: B5 62 · class · id · length (u16 LE) · payload · CK_A CK_B.
 * Checksum is the 8-bit Fletcher over class through end of payload.
 */
import { validCoord } from '../core/track.js';

var SYNC1 = 0xb5;
var SYNC2 = 0x62;
var CLS_NAV = 0x01;
var ID_POSLLH = 0x02;
var ID_PVT = 0x07;
var PVT_LEN_NEW = 92;
var PVT_LEN_OLD = 84;
var POSLLH_LEN = 28;
var HACC_MAX_MM = 50000;
var GAP_MS = 5 * 60 * 1000;
var SCALE_DEG = 1e-7;
var DAMAGED = 'Couldn’t read that UBX file. The file looks damaged.';
var NO_POSITIONS =
  'Couldn’t find positions in that UBX file. The receiver needs NAV-PVT output turned on.';

function checksumOk(view, start, length) {
  var cka = 0;
  var ckb = 0;
  var end = start + 4 + length;
  var i;
  for (i = start; i < end; i++) {
    cka = (cka + view.getUint8(i)) & 0xff;
    ckb = (ckb + cka) & 0xff;
  }
  return view.getUint8(end) === cka && view.getUint8(end + 1) === ckb;
}

function pointTime(view, base, valid) {
  if ((valid & 0x03) !== 0x03) {
    return null;
  }
  var year = view.getUint16(base + 4, true);
  var month = view.getUint8(base + 6);
  var day = view.getUint8(base + 7);
  var hour = view.getUint8(base + 8);
  var minute = view.getUint8(base + 9);
  var sec = view.getUint8(base + 10);
  var nano = view.getInt32(base + 16, true);
  if (year < 1990 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31 ||
      hour > 23 || minute > 59 || sec > 60 || nano < -1e9 || nano > 1e9) {
    return null;
  }
  var ms = Date.UTC(year, month - 1, day, hour, minute, sec);
  if (!isFinite(ms)) {
    return null;
  }
  // Reject impossible calendar dates (e.g. Feb 30). Leap-second sec=60 may roll.
  var check = new Date(ms);
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 ||
      check.getUTCDate() !== day) {
    return null;
  }
  return ms + nano / 1e6;
}

function readPvt(view, base, length, out) {
  if (length !== PVT_LEN_NEW && length !== PVT_LEN_OLD) {
    return;
  }
  var fixType = view.getUint8(base + 20);
  var flags = view.getUint8(base + 21);
  var hAcc = view.getUint32(base + 40, true);
  if (!(flags & 0x01) || (fixType !== 2 && fixType !== 3 && fixType !== 4) || hAcc > HACC_MAX_MM) {
    return;
  }
  var lon = view.getInt32(base + 24, true) * SCALE_DEG;
  var lat = view.getInt32(base + 28, true) * SCALE_DEG;
  if (!validCoord(lat, lon)) {
    return;
  }
  var ele = view.getInt32(base + 36, true) / 1000;
  var speed = view.getInt32(base + 60, true) / 1000;
  var valid = view.getUint8(base + 11);
  var t = pointTime(view, base, valid);
  var point = {
    lat: lat,
    lon: lon,
    ele: isFinite(ele) ? ele : null,
    speed: isFinite(speed) && speed >= 0 ? speed : null
  };
  if (t != null && isFinite(t)) {
    point.t = t;
  }
  out.push(point);
}

function readPosllh(view, base, length, out) {
  if (length !== POSLLH_LEN) {
    return;
  }
  var hAcc = view.getUint32(base + 20, true);
  if (hAcc > HACC_MAX_MM) {
    return;
  }
  var lon = view.getInt32(base + 4, true) * SCALE_DEG;
  var lat = view.getInt32(base + 8, true) * SCALE_DEG;
  if (!validCoord(lat, lon)) {
    return;
  }
  var ele = view.getInt32(base + 16, true) / 1000;
  out.push({
    lat: lat,
    lon: lon,
    ele: isFinite(ele) ? ele : null,
    speed: null
  });
}

function dedupeAndSegment(points) {
  var cleaned = [];
  var i;
  var lastT = null;
  for (i = 0; i < points.length; i++) {
    var point = points[i];
    if (point.t != null && lastT != null && point.t === lastT) {
      continue;
    }
    if (point.t != null) {
      lastT = point.t;
    }
    cleaned.push(point);
  }
  if (!cleaned.length) {
    return [];
  }
  var segments = [];
  var current = { name: 'Track', points: [cleaned[0]] };
  for (i = 1; i < cleaned.length; i++) {
    var prev = cleaned[i - 1];
    var next = cleaned[i];
    if (prev.t != null && next.t != null && (next.t < prev.t || next.t - prev.t > GAP_MS)) {
      segments.push(current);
      current = { name: 'Track', points: [next] };
    } else {
      current.points.push(next);
    }
  }
  segments.push(current);
  if (segments.length === 1) {
    return segments;
  }
  for (i = 0; i < segments.length; i++) {
    segments[i].name = 'Track ' + (i + 1);
  }
  return segments;
}

/** Parse a UBX ArrayBuffer. Throws Error with a short message when the file is unusable. */
export function parseBuffer(buffer) {
  if (!buffer || buffer.byteLength === 0) {
    throw new Error(DAMAGED);
  }
  var view = new DataView(buffer);
  var end = view.byteLength;
  var pvt = [];
  var posllh = [];
  var offset = 0;

  while (offset + 8 <= end) {
    if (view.getUint8(offset) !== SYNC1 || view.getUint8(offset + 1) !== SYNC2) {
      offset += 1;
      continue;
    }
    if (offset + 6 > end) {
      break;
    }
    var cls = view.getUint8(offset + 2);
    var id = view.getUint8(offset + 3);
    var length = view.getUint16(offset + 4, true);
    var frameEnd = offset + 6 + length + 2;
    if (frameEnd > end) {
      offset += 1;
      continue;
    }
    if (!checksumOk(view, offset + 2, length)) {
      offset += 1;
      continue;
    }
    var payload = offset + 6;
    if (cls === CLS_NAV && id === ID_PVT) {
      readPvt(view, payload, length, pvt);
    } else if (cls === CLS_NAV && id === ID_POSLLH) {
      readPosllh(view, payload, length, posllh);
    }
    offset = frameEnd;
  }

  var points = pvt.length ? pvt : posllh;
  var segments = dedupeAndSegment(points);
  if (!segments.length) {
    throw new Error(NO_POSITIONS);
  }
  return {
    name: segments.length === 1 ? segments[0].name : '',
    segments: segments,
    waypoints: []
  };
}

/** Read a File and parse it. The file stays on this device. */
export function parse(file) {
  return file.arrayBuffer().then(parseBuffer);
}
