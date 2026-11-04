/**
 * FIT activity parser (ES module). Reads the file in the browser.
 * Nothing is uploaded.
 *
 * parse(file) → { name, segments: [{ name, points }], waypoints }
 * A point is { lat, lon, ele?, speed?, hr?, t? }. Only GPS record messages
 * are kept. Heart rate (beats per minute) is kept when the record has it.
 * Cadence and power are left out.
 *
 * FIT timestamps are seconds since 1989-12-31 UTC.
 * Lat/lon are semicircles: degrees = semicircles × 180 / 2^31.
 */
import { validCoord } from '../core/track.js';

var FIT_EPOCH = Date.UTC(1989, 11, 31);
var SEMICIRCLE = 180 / 2147483648;
var DAMAGED = 'Couldn’t read that FIT file. The file looks damaged.';

var CRC_TABLE = [
  0x0000, 0xCC01, 0xD801, 0x1400, 0xF001, 0x3C00, 0x2800, 0xE401,
  0xA001, 0x6C00, 0x7800, 0xB401, 0x5000, 0x9C01, 0x8801, 0x4400
];

var TYPE_SIZE = {
  0: 1, 1: 1, 2: 1, 3: 2, 4: 2, 5: 4, 6: 4, 7: 1,
  8: 4, 9: 8, 10: 1, 11: 2, 12: 4, 13: 1, 14: 8, 15: 8, 16: 8
};

var SPORT = {
  0: 'Activity',
  1: 'Run',
  2: 'Ride',
  3: 'Transition',
  4: 'Workout',
  5: 'Swim',
  10: 'Training',
  11: 'Walk',
  15: 'Row',
  16: 'Climb',
  17: 'Hike',
  18: 'Multisport',
  19: 'Paddle',
  20: 'Flight',
  21: 'E-bike',
  22: 'Motorcycle',
  23: 'Boat',
  24: 'Drive',
  25: 'Golf',
  34: 'Skydive'
};

function crcByte(crc, byte) {
  var tmp = CRC_TABLE[crc & 0x0f];
  crc = (crc >> 4) & 0x0fff;
  crc = crc ^ tmp ^ CRC_TABLE[byte & 0x0f];
  tmp = CRC_TABLE[crc & 0x0f];
  crc = (crc >> 4) & 0x0fff;
  crc = crc ^ tmp ^ CRC_TABLE[(byte >> 4) & 0x0f];
  return crc & 0xffff;
}

function crcRange(view, start, length) {
  var crc = 0;
  var i;
  for (i = 0; i < length; i++) {
    crc = crcByte(crc, view.getUint8(start + i));
  }
  return crc;
}

function fitToMs(seconds) {
  return FIT_EPOCH + (seconds >>> 0) * 1000;
}

function sportName(code) {
  if (code == null || !SPORT.hasOwnProperty(code)) {
    return 'Activity';
  }
  return SPORT[code];
}

function readValue(view, offset, type, little) {
  var value;
  switch (type) {
    case 0:
    case 2:
    case 13:
      value = view.getUint8(offset);
      return value === 0xff ? null : value;
    case 10:
      value = view.getUint8(offset);
      return value === 0 ? null : value;
    case 1:
      value = view.getInt8(offset);
      return value === 0x7f ? null : value;
    case 3:
      value = view.getInt16(offset, little);
      return value === 0x7fff ? null : value;
    case 4:
      value = view.getUint16(offset, little);
      return value === 0xffff ? null : value;
    case 11:
      value = view.getUint16(offset, little);
      return value === 0 ? null : value;
    case 5:
      value = view.getInt32(offset, little);
      return value === 0x7fffffff ? null : value;
    case 6:
      value = view.getUint32(offset, little);
      return value === 0xffffffff ? null : value;
    case 12:
      value = view.getUint32(offset, little);
      return value === 0 ? null : value;
    case 8:
      value = view.getFloat32(offset, little);
      return isFinite(value) ? value : null;
    case 9:
      value = view.getFloat64(offset, little);
      return isFinite(value) ? value : null;
    default:
      return null;
  }
}

function isFitSignature(view, offset) {
  return view.getUint8(offset) === 0x2e &&
    view.getUint8(offset + 1) === 0x46 &&
    view.getUint8(offset + 2) === 0x49 &&
    view.getUint8(offset + 3) === 0x54;
}

function looksLikeHeader(view, offset) {
  if (offset + 12 > view.byteLength) {
    return false;
  }
  var size = view.getUint8(offset);
  if (size !== 12 && size !== 14) {
    return false;
  }
  return isFitSignature(view, offset + 8);
}

function readDef(view, offset, header, dataEnd) {
  if (offset + 5 > dataEnd) {
    throw new Error(DAMAGED);
  }
  var little = view.getUint8(offset + 1) === 0;
  var globalNum = view.getUint16(offset + 2, little);
  var count = view.getUint8(offset + 4);
  var cursor = offset + 5;
  var fields = [];
  var i;
  for (i = 0; i < count; i++) {
    if (cursor + 3 > dataEnd) {
      throw new Error(DAMAGED);
    }
    fields.push({
      num: view.getUint8(cursor),
      size: view.getUint8(cursor + 1),
      base: view.getUint8(cursor + 2)
    });
    cursor += 3;
  }
  var devSizes = [];
  if (header & 0x20) {
    if (cursor + 1 > dataEnd) {
      throw new Error(DAMAGED);
    }
    var devCount = view.getUint8(cursor);
    cursor += 1;
    for (i = 0; i < devCount; i++) {
      if (cursor + 3 > dataEnd) {
        throw new Error(DAMAGED);
      }
      devSizes.push(view.getUint8(cursor + 1));
      cursor += 3;
    }
  }
  return {
    offset: cursor,
    def: {
      global: globalNum,
      little: little,
      fields: fields,
      devSizes: devSizes
    }
  };
}

/** Beats per minute from a FIT heart_rate field, or null. */
function heartRate(raw) {
  if (raw == null || !isFinite(raw) || raw < 1 || raw > 250) {
    return null;
  }
  return Math.round(raw);
}

function degrees(raw, type) {
  if (type === 8 || type === 9) {
    return raw;
  }
  return raw * SEMICIRCLE;
}

function pushRecord(state, raw, types, timeMs) {
  if (raw[0] == null || raw[1] == null) {
    return;
  }
  var lat = degrees(raw[0], types[0]);
  var lon = degrees(raw[1], types[1]);
  if (!validCoord(lat, lon)) {
    return;
  }
  var ele = null;
  if (raw[78] != null) {
    ele = raw[78] / 5 - 500;
  } else if (raw[2] != null) {
    ele = raw[2] / 5 - 500;
  }
  if (ele != null && (!isFinite(ele) || ele < -1000 || ele > 20000)) {
    ele = null;
  }
  var speed = null;
  if (raw[73] != null) {
    speed = raw[73] / 1000;
  } else if (raw[6] != null) {
    speed = raw[6] / 1000;
  }
  if (speed != null && (!isFinite(speed) || speed < 0 || speed > 1000)) {
    speed = null;
  }
  state.points.push({
    lat: lat,
    lon: lon,
    ele: ele,
    speed: speed,
    hr: heartRate(raw[3]),
    t: timeMs
  });
}

function readData(view, offset, def, dataEnd, state, compressedTime) {
  if (!def) {
    throw new Error(DAMAGED);
  }
  var cursor = offset;
  var raw = {};
  var types = {};
  var i;
  for (i = 0; i < def.fields.length; i++) {
    var field = def.fields[i];
    if (cursor + field.size > dataEnd) {
      throw new Error(DAMAGED);
    }
    var type = field.base & 0x1f;
    var size = TYPE_SIZE[type] || 0;
    if (size && type !== 7 && field.size >= size && field.size % size === 0) {
      var value = readValue(view, cursor, type, def.little);
      if (value != null) {
        raw[field.num] = value;
        types[field.num] = type;
      }
    }
    cursor += field.size;
  }
  for (i = 0; i < def.devSizes.length; i++) {
    if (cursor + def.devSizes[i] > dataEnd) {
      throw new Error(DAMAGED);
    }
    cursor += def.devSizes[i];
  }
  var timeMs = null;
  if (raw[253] != null) {
    state.lastTime = raw[253] >>> 0;
    timeMs = fitToMs(state.lastTime);
  } else if (compressedTime != null) {
    state.lastTime = compressedTime >>> 0;
    timeMs = fitToMs(state.lastTime);
  }
  if (def.global === 20) {
    pushRecord(state, raw, types, timeMs);
  } else if (def.global === 18) {
    state.sessions.push({
      sport: raw.hasOwnProperty(5) ? raw[5] : null,
      start: raw[2] != null ? fitToMs(raw[2]) : null
    });
  }
  return cursor;
}

function parseFile(view, start, state) {
  var headerSize = view.getUint8(start);
  if ((headerSize !== 12 && headerSize !== 14) || start + headerSize > view.byteLength) {
    throw new Error(DAMAGED);
  }
  if (!isFitSignature(view, start + 8)) {
    throw new Error('Choose a FIT file (.fit).');
  }
  var dataSize = view.getUint32(start + 4, true);
  var fileEnd = start + headerSize + dataSize;
  if (fileEnd + 2 > view.byteLength) {
    throw new Error(DAMAGED);
  }
  if (headerSize === 14) {
    var headerCrc = view.getUint16(start + 12, true);
    if (headerCrc !== 0 && headerCrc !== crcRange(view, start, 12)) {
      throw new Error(DAMAGED);
    }
  }
  var fileCrc = view.getUint16(fileEnd, true);
  if (fileCrc !== 0 && fileCrc !== crcRange(view, start, headerSize + dataSize)) {
    throw new Error(DAMAGED);
  }

  var offset = start + headerSize;
  var defs = new Array(16);
  while (offset < fileEnd) {
    var header = view.getUint8(offset);
    offset += 1;
    if (header & 0x80) {
      var local = (header >> 5) & 0x03;
      var off = header & 0x1f;
      var stamp = ((state.lastTime & ~0x1f) + off) >>> 0;
      if (stamp < state.lastTime) {
        stamp = (stamp + 0x20) >>> 0;
      }
      offset = readData(view, offset, defs[local], fileEnd, state, stamp);
    } else if (header & 0x40) {
      var defined = readDef(view, offset, header, fileEnd);
      defs[header & 0x0f] = defined.def;
      offset = defined.offset;
    } else {
      offset = readData(view, offset, defs[header & 0x0f], fileEnd, state, null);
    }
  }
  if (offset !== fileEnd) {
    throw new Error(DAMAGED);
  }
  return fileEnd + 2;
}

function uniqueNames(segments) {
  var seen = {};
  var i;
  for (i = 0; i < segments.length; i++) {
    var base = segments[i].name || 'Activity';
    var count = seen[base] || 0;
    seen[base] = count + 1;
    segments[i].name = count ? base + ' ' + (count + 1) : base;
  }
  return segments;
}

function group(points, sessions) {
  var usable = [];
  var i;
  for (i = 0; i < sessions.length; i++) {
    if (sessions[i].start != null) {
      usable.push(sessions[i]);
    }
  }
  if (usable.length < 2) {
    var only = sessions.length ? sportName(sessions[0].sport) : 'Activity';
    return [{ name: only, points: points }];
  }
  usable.sort(function (a, b) {
    return a.start - b.start;
  });
  var buckets = [];
  for (i = 0; i < usable.length; i++) {
    buckets.push({
      name: sportName(usable[i].sport),
      start: usable[i].start,
      points: []
    });
  }
  var last = 0;
  for (i = 0; i < points.length; i++) {
    var t = points[i].t;
    var idx = last;
    if (t != null) {
      idx = 0;
      var j;
      for (j = 0; j < buckets.length; j++) {
        if (t >= buckets[j].start) {
          idx = j;
        }
      }
      last = idx;
    }
    buckets[idx].points.push(points[i]);
  }
  var out = [];
  for (i = 0; i < buckets.length; i++) {
    if (buckets[i].points.length) {
      out.push({ name: buckets[i].name, points: buckets[i].points });
    }
  }
  return out.length ? out : [{ name: 'Activity', points: points }];
}

function build(state) {
  if (!state.points.length) {
    throw new Error('No GPS track in this FIT file.');
  }
  var segments = uniqueNames(group(state.points, state.sessions));
  return {
    name: segments.length === 1 ? segments[0].name : '',
    segments: segments,
    waypoints: []
  };
}

/** Parse a FIT ArrayBuffer. Throws Error with a short message when the file is unusable. */
export function parseBuffer(buffer) {
  var view = new DataView(buffer);
  var state = { lastTime: 0, points: [], sessions: [] };
  var offset = 0;
  var files = 0;
  while (offset + 12 <= view.byteLength && looksLikeHeader(view, offset)) {
    offset = parseFile(view, offset, state);
    files += 1;
    if (files > 64) {
      break;
    }
  }
  if (!files) {
    throw new Error('Choose a FIT file (.fit).');
  }
  return build(state);
}

/** Read a File and parse it. The file stays on this device. */
export function parse(file) {
  return file.arrayBuffer().then(parseBuffer);
}
