/**
 * Node checks for the UBX parser and detect magic.
 * Run: node tests/ubx.test.mjs
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseBuffer } from '../public/assets/js/parsers/ubx.js';
import { detect } from '../public/assets/js/core/detect.js';

var root = join(dirname(fileURLToPath(import.meta.url)), '..');
var FALSE_SYNC = Uint8Array.from([0xb5, 0x62, 0x01, 0x07, 0xff, 0xff, 0x00, 0x00]);
var NO_POSITIONS =
  'Couldn’t find positions in that UBX file. The receiver needs NAV-PVT output turned on.';

globalThis.window = {
  GPS_FORMATS: [
    {
      id: 'ubx',
      label: 'UBX',
      extensions: ['ubx'],
      magic: { type: 'ubx-frame' },
      landing: '/ubx-viewer',
      slug: 'ubx-viewer',
      parser: '/assets/js/parsers/ubx.js'
    }
  ]
};

function fail(msg) {
  console.error('FAIL:', msg);
  process.exitCode = 1;
}

function ok(msg) {
  console.log('ok:', msg);
}

function pointCount(doc) {
  return doc.segments.reduce(function (n, s) {
    return n + s.points.length;
  }, 0);
}

function flatten(doc) {
  var out = [];
  var i;
  var j;
  for (i = 0; i < doc.segments.length; i++) {
    for (j = 0; j < doc.segments[i].points.length; j++) {
      out.push(doc.segments[i].points[j]);
    }
  }
  return out;
}

function toArrayBuffer(u8) {
  return u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength);
}

/** Minimal File stand-in for detect() (Node 18 has Blob but not File). */
function fakeFile(bytes, name) {
  var u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  return {
    name: name,
    size: u8.length,
    slice: function (start, end) {
      var part = u8.subarray(start, end == null ? u8.length : end);
      return {
        arrayBuffer: function () {
          return Promise.resolve(toArrayBuffer(part));
        }
      };
    },
    arrayBuffer: function () {
      return Promise.resolve(toArrayBuffer(u8));
    }
  };
}

function checksum(frame, payloadLen) {
  var cka = 0;
  var ckb = 0;
  var i;
  for (i = 2; i < 6 + payloadLen; i++) {
    cka = (cka + frame[i]) & 0xff;
    ckb = (ckb + cka) & 0xff;
  }
  frame[6 + payloadLen] = cka;
  frame[6 + payloadLen + 1] = ckb;
}

/** Build one NAV-PVT (class 0x01 id 0x07, length 92) with a valid checksum. */
function makePvt(opts) {
  var payload = new Uint8Array(92);
  var view = new DataView(payload.buffer);
  view.setUint16(4, opts.year, true);
  payload[6] = opts.month;
  payload[7] = opts.day;
  payload[8] = opts.hour;
  payload[9] = opts.min;
  payload[10] = opts.sec;
  payload[11] = opts.valid != null ? opts.valid : 0x03;
  view.setInt32(16, opts.nano != null ? opts.nano : 0, true);
  payload[20] = 3;
  payload[21] = 1;
  payload[23] = 8;
  view.setInt32(24, Math.round((opts.lon != null ? opts.lon : 2.2945) / 1e-7), true);
  view.setInt32(28, Math.round((opts.lat != null ? opts.lat : 48.8584) / 1e-7), true);
  view.setInt32(36, opts.hMslMm != null ? opts.hMslMm : 0, true);
  view.setUint32(40, 1000, true);
  view.setInt32(60, 0, true);

  var frame = new Uint8Array(100);
  frame[0] = 0xb5;
  frame[1] = 0x62;
  frame[2] = 0x01;
  frame[3] = 0x07;
  frame[4] = 92;
  frame[5] = 0;
  frame.set(payload, 6);
  checksum(frame, 92);
  return frame;
}

function corruptChecksum(frame) {
  var copy = new Uint8Array(frame);
  copy[copy.length - 1] ^= 0xff;
  return copy;
}

function firstValidFrameEnd(buf) {
  var i = 0;
  while (i + 8 <= buf.length) {
    if (buf[i] !== 0xb5 || buf[i + 1] !== 0x62) {
      i += 1;
      continue;
    }
    var length = buf[i + 4] | (buf[i + 5] << 8);
    var end = i + 6 + length + 2;
    if (end > buf.length) {
      i += 1;
      continue;
    }
    var cka = 0;
    var ckb = 0;
    var j;
    for (j = i + 2; j < i + 6 + length; j++) {
      cka = (cka + buf[j]) & 0xff;
      ckb = (ckb + cka) & 0xff;
    }
    if (buf[end - 2] === cka && buf[end - 1] === ckb) {
      return end;
    }
    i += 1;
  }
  throw new Error('no valid UBX frame in sample');
}

function concat() {
  var parts = Array.prototype.slice.call(arguments);
  var total = 0;
  var i;
  for (i = 0; i < parts.length; i++) {
    total += parts[i].length;
  }
  var out = new Uint8Array(total);
  var at = 0;
  for (i = 0; i < parts.length; i++) {
    out.set(parts[i], at);
    at += parts[i].length;
  }
  return out;
}

function samePoint(a, b) {
  return a.lat === b.lat && a.lon === b.lon && a.ele === b.ele && a.t === b.t;
}

function assertTracksEqual(label, got, want) {
  var ga = flatten(got);
  var wa = flatten(want);
  if (ga.length !== wa.length) {
    fail(label + ': point count ' + ga.length + ' !== ' + wa.length);
    return false;
  }
  var i;
  for (i = 0; i < ga.length; i++) {
    if (!samePoint(ga[i], wa[i])) {
      fail(label + ': point ' + i + ' mismatch ' +
        JSON.stringify(ga[i]) + ' vs ' + JSON.stringify(wa[i]));
      return false;
    }
  }
  return true;
}

function onlyPoint(doc) {
  var pts = flatten(doc);
  return pts.length === 1 ? pts[0] : null;
}

function assertNoT(label, frame) {
  var parsed = parseBuffer(toArrayBuffer(frame));
  var p = onlyPoint(parsed);
  if (!p) {
    fail(label + ': expected exactly 1 point, got ' + pointCount(parsed));
    return;
  }
  if (p.t != null) {
    fail(label + ': expected no t, got ' + p.t);
    return;
  }
  ok(label + ' → 1 point, no t');
}

var sample = new Uint8Array(readFileSync(join(root, 'docs/example_files/ubx.ubx')));
var gpx = new Uint8Array(readFileSync(join(root, 'docs/example_files/gpx.gpx')));

async function run() {
  // a
  var clean = parseBuffer(toArrayBuffer(sample));
  if (pointCount(clean) !== 9254 || clean.segments.length !== 1) {
    fail('a: expected 9254 points in 1 segment, got ' + pointCount(clean) + ' / ' + clean.segments.length);
  } else {
    ok('a: sample → 9254 points, 1 segment');
  }

  // b — false sync prefix; parse + detect via magic (.bin so extension does not win)
  var prefixed = concat(FALSE_SYNC, sample);
  var doc = parseBuffer(toArrayBuffer(prefixed));
  if (pointCount(doc) !== 9254) {
    fail('b: prefixed parse expected 9254 points, got ' + pointCount(doc));
  } else {
    ok('b: prefixed parse → 9254 points');
  }
  var found = await detect(fakeFile(prefixed, 'log.bin'));
  if (!found || found.id !== 'ubx') {
    fail('b: detect expected ubx, got ' + (found && found.id));
  } else {
    ok('b: detect(.bin with false sync prefix) → ubx');
  }

  // c — false sync between two complete frames: every lat/lon/ele/t matches clean
  var cut = firstValidFrameEnd(sample);
  var spliced = concat(sample.subarray(0, cut), FALSE_SYNC, sample.subarray(cut));
  doc = parseBuffer(toArrayBuffer(spliced));
  if (assertTracksEqual('c: false sync between frames', doc, clean)) {
    ok('c: false sync between frames → identical lat/lon/ele/t to clean');
  }

  // c2 — bad checksum on one middle frame: drop only that frame, rest recovers
  var p1 = makePvt({
    year: 2024, month: 6, day: 1, hour: 10, min: 0, sec: 0, nano: 0,
    lat: 48.1, lon: 2.1, hMslMm: 10000
  });
  var p2 = makePvt({
    year: 2024, month: 6, day: 1, hour: 10, min: 0, sec: 1, nano: 0,
    lat: 48.2, lon: 2.2, hMslMm: 20000
  });
  var p3 = makePvt({
    year: 2024, month: 6, day: 1, hour: 10, min: 0, sec: 2, nano: 0,
    lat: 48.3, lon: 2.3, hMslMm: 30000
  });
  var withBadCk = concat(p1, corruptChecksum(p2), p3);
  var wantTwo = parseBuffer(toArrayBuffer(concat(p1, p3)));
  doc = parseBuffer(toArrayBuffer(withBadCk));
  if (assertTracksEqual('c2: bad checksum middle frame', doc, wantTwo)) {
    ok('c2: bad checksum drops only that frame (' + pointCount(doc) + ' points)');
  }

  // c3 — truncated last frame ignored cleanly
  var truncTail = Uint8Array.from([0xb5, 0x62, 0x01, 0x07, 92, 0, 1, 2, 3, 4, 5]);
  var withTrunc = concat(p1, p3, truncTail);
  doc = parseBuffer(toArrayBuffer(withTrunc));
  if (assertTracksEqual('c3: truncated last frame', doc, wantTwo)) {
    ok('c3: truncated last frame ignored; earlier points kept');
  }

  // d — exact dates / nanos
  var leapExpected = Date.UTC(2024, 1, 29, 12, 0, 0);
  doc = parseBuffer(toArrayBuffer(makePvt({
    year: 2024, month: 2, day: 29, hour: 12, min: 0, sec: 0, nano: 0
  })));
  var leapPt = onlyPoint(doc);
  if (!leapPt || leapPt.t !== leapExpected) {
    fail('d: leap day 2024-02-29 expected t=' + leapExpected + ', got ' + (leapPt && leapPt.t));
  } else {
    ok('d: leap day 2024-02-29 → t=' + leapPt.t);
  }

  assertNoT('d: non-leap 2023-02-29', makePvt({
    year: 2023, month: 2, day: 29, hour: 12, min: 0, sec: 0, nano: 0
  }));
  assertNoT('d: Apr 31', makePvt({
    year: 2023, month: 4, day: 31, hour: 12, min: 0, sec: 0, nano: 0
  }));
  assertNoT('d: month 13', makePvt({
    year: 2026, month: 13, day: 1, hour: 12, min: 0, sec: 0, nano: 0
  }));
  assertNoT('d: Feb 30', makePvt({
    year: 2026, month: 2, day: 30, hour: 12, min: 0, sec: 0, nano: 0
  }));
  assertNoT('d: nano > 1e9', makePvt({
    year: 2026, month: 7, day: 12, hour: 12, min: 0, sec: 0, nano: 2e9
  }));
  assertNoT('d: nano < -1e9', makePvt({
    year: 2026, month: 7, day: 12, hour: 12, min: 0, sec: 0, nano: -2e9
  }));

  var nanoNeg = -500000000;
  var midnightExpected = Date.UTC(2024, 6, 13, 0, 0, 0) + nanoNeg / 1e6;
  doc = parseBuffer(toArrayBuffer(makePvt({
    year: 2024, month: 7, day: 13, hour: 0, min: 0, sec: 0, nano: nanoNeg
  })));
  var midPt = onlyPoint(doc);
  if (!midPt || midPt.t !== midnightExpected) {
    fail('d: negative nano across midnight expected t=' + midnightExpected + ', got ' + (midPt && midPt.t));
  } else {
    ok('d: negative nano across midnight → t=' + midPt.t + ' (' + new Date(midPt.t).toISOString() + ')');
  }

  // e — backwards time: per-segment counts and first/last t; every point kept
  var tA = Date.UTC(2026, 6, 12, 10, 0, 0);
  var tB = Date.UTC(2026, 6, 12, 10, 1, 0);
  var tC = Date.UTC(2026, 6, 12, 9, 0, 0);
  var tD = Date.UTC(2026, 6, 12, 9, 1, 0);
  var fA = makePvt({ year: 2026, month: 7, day: 12, hour: 10, min: 0, sec: 0, nano: 0, lat: 48.1, lon: 2.1 });
  var fB = makePvt({ year: 2026, month: 7, day: 12, hour: 10, min: 1, sec: 0, nano: 0, lat: 48.2, lon: 2.2 });
  var fC = makePvt({ year: 2026, month: 7, day: 12, hour: 9, min: 0, sec: 0, nano: 0, lat: 48.3, lon: 2.3 });
  var fD = makePvt({ year: 2026, month: 7, day: 12, hour: 9, min: 1, sec: 0, nano: 0, lat: 48.4, lon: 2.4 });
  doc = parseBuffer(toArrayBuffer(concat(fA, fB, fC, fD)));
  if (doc.segments.length !== 2) {
    fail('e: expected 2 segments, got ' + doc.segments.length);
  } else if (doc.segments[0].points.length !== 2 || doc.segments[1].points.length !== 2) {
    fail('e: expected segment counts 2+2, got ' +
      doc.segments[0].points.length + '+' + doc.segments[1].points.length);
  } else if (doc.segments[0].points[0].t !== tA || doc.segments[0].points[1].t !== tB) {
    fail('e: segment 0 first/last t mismatch');
  } else if (doc.segments[1].points[0].t !== tC || doc.segments[1].points[1].t !== tD) {
    fail('e: segment 1 first/last t mismatch');
  } else if (pointCount(doc) !== 4) {
    fail('e: expected all 4 points kept, got ' + pointCount(doc));
  } else {
    ok('e: backwards split → segments [2 @ ' + tA + '..' + tB + '] [2 @ ' + tC + '..' + tD + ']');
  }

  // e2 — equal-time dedupe, including at a segment boundary
  var fEq1 = makePvt({ year: 2026, month: 7, day: 12, hour: 10, min: 0, sec: 0, nano: 0, lat: 48.5, lon: 2.5 });
  var fEq2 = makePvt({ year: 2026, month: 7, day: 12, hour: 10, min: 0, sec: 0, nano: 0, lat: 48.6, lon: 2.6 });
  var fEq3 = makePvt({ year: 2026, month: 7, day: 12, hour: 9, min: 0, sec: 0, nano: 0, lat: 48.7, lon: 2.7 });
  doc = parseBuffer(toArrayBuffer(concat(fEq1, fEq2, fEq3)));
  if (doc.segments.length !== 2) {
    fail('e2: expected 2 segments after equal-t dedupe + backwards, got ' + doc.segments.length);
  } else if (pointCount(doc) !== 2) {
    fail('e2: expected 2 points (one dup dropped), got ' + pointCount(doc));
  } else if (doc.segments[0].points.length !== 1 || doc.segments[0].points[0].t !== tA) {
    fail('e2: segment 0 should be single point at ' + tA);
  } else if (doc.segments[1].points.length !== 1 || doc.segments[1].points[0].t !== tC) {
    fail('e2: segment 1 should be single point at ' + tC);
  } else if (doc.segments[0].points[0].lat !== 48.5) {
    fail('e2: first equal-t point should be kept (lat 48.5), got ' + doc.segments[0].points[0].lat);
  } else {
    ok('e2: equal-t dedupe at segment boundary → keep first, then new segment');
  }

  // equal times after a forward pair, then backwards
  var fFwd = makePvt({ year: 2026, month: 7, day: 12, hour: 10, min: 1, sec: 0, nano: 0, lat: 48.8, lon: 2.8 });
  var fDupB = makePvt({ year: 2026, month: 7, day: 12, hour: 10, min: 1, sec: 0, nano: 0, lat: 48.9, lon: 2.9 });
  doc = parseBuffer(toArrayBuffer(concat(fEq1, fFwd, fDupB, fEq3)));
  if (doc.segments.length !== 2 ||
      doc.segments[0].points.length !== 2 ||
      doc.segments[1].points.length !== 1 ||
      doc.segments[0].points[0].t !== tA ||
      doc.segments[0].points[1].t !== tB ||
      doc.segments[1].points[0].t !== tC ||
      pointCount(doc) !== 3) {
    fail('e2b: equal-t at end of first segment before backwards split failed: ' +
      JSON.stringify(doc.segments.map(function (s) {
        return s.points.map(function (p) { return p.t; });
      })));
  } else {
    ok('e2b: equal-t at end of segment 0 deduped before backwards split');
  }

  // f — GPX bytes as UBX
  try {
    parseBuffer(toArrayBuffer(gpx));
    fail('f: expected throw for GPX-as-UBX');
  } catch (err) {
    if (!err || err.message !== NO_POSITIONS) {
      fail('f: wrong error: ' + (err && err.message));
    } else {
      ok('f: GPX-as-UBX → no-positions error');
    }
  }

  if (process.exitCode) {
    console.error('\nSome checks failed.');
  } else {
    console.log('\nAll UBX checks passed.');
  }
}

run().catch(function (err) {
  console.error(err);
  process.exitCode = 1;
});
