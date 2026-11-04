/**
 * GPX parser (ES module). Reads the file in the browser. Nothing is uploaded.
 *
 * parse(file) → { name, segments: [{ name, points }], waypoints }
 * A point is { lat, lon, ele?, speed?, hr?, t? }. Heart rate is read from
 * a track-point extension (hr, in beats per minute) when the file has one.
 * Routes are returned as segments
 * when the file has no track. Waypoints stay separate so they are not joined
 * into a line.
 */
import { MAX_SPEED, validCoord } from '../core/track.js';

function childText(el, local) {
  var nodes = el.children;
  var i;
  for (i = 0; i < nodes.length; i++) {
    if (nodes[i].localName === local) {
      return (nodes[i].textContent || '').trim();
    }
  }
  return '';
}

function childElements(el, local) {
  var out = [];
  var nodes = el.children;
  var i;
  for (i = 0; i < nodes.length; i++) {
    if (nodes[i].localName === local) {
      out.push(nodes[i]);
    }
  }
  return out;
}

function firstDescendantText(el, local) {
  var direct = childText(el, local);
  if (direct) {
    return direct;
  }
  var nodes = el.getElementsByTagName('*');
  var i;
  for (i = 0; i < nodes.length; i++) {
    if (nodes[i].localName === local) {
      return (nodes[i].textContent || '').trim();
    }
  }
  return '';
}

var HR_NAMES = { hr: true, heartrate: true, heart_rate: true };

/** Beats per minute from a track-point extension, or null. */
function readHeartRate(node) {
  var nodes = node.getElementsByTagName('*');
  var i;
  for (i = 0; i < nodes.length; i++) {
    var local = String(nodes[i].localName || '').toLowerCase();
    if (!HR_NAMES[local]) {
      continue;
    }
    var value = parseFloat((nodes[i].textContent || '').trim());
    if (isFinite(value) && value >= 1 && value <= 250) {
      return Math.round(value);
    }
  }
  return null;
}

function readPoints(parent, tag) {
  var nodes = childElements(parent, tag);
  var points = [];
  var i;
  for (i = 0; i < nodes.length; i++) {
    var node = nodes[i];
    var lat = parseFloat(node.getAttribute('lat'));
    var lon = parseFloat(node.getAttribute('lon'));
    if (!validCoord(lat, lon)) {
      continue;
    }
    var eleText = childText(node, 'ele');
    var ele = eleText === '' ? null : parseFloat(eleText);
    if (ele != null && !isFinite(ele)) {
      ele = null;
    }
    var when = childText(node, 'time');
    var t = when ? Date.parse(when) : NaN;
    var speedText = firstDescendantText(node, 'speed');
    var speed = speedText === '' ? null : parseFloat(speedText);
    if (speed == null || !isFinite(speed) || speed < 0 || speed > MAX_SPEED) {
      speed = null;
    }
    points.push({
      lat: lat,
      lon: lon,
      ele: ele,
      speed: speed,
      hr: readHeartRate(node),
      t: isFinite(t) ? t : null
    });
  }
  return points;
}

function pushSegment(segments, name, points) {
  if (!points.length) {
    return;
  }
  segments.push({
    name: name || '',
    points: points
  });
}

function segmentsFromTrack(trk, docName) {
  var segments = [];
  var name = childText(trk, 'name') || docName || '';
  var segs = childElements(trk, 'trkseg');
  if (!segs.length) {
    pushSegment(segments, name, readPoints(trk, 'trkpt'));
    return segments;
  }
  var i;
  for (i = 0; i < segs.length; i++) {
    var partName = name;
    if (segs.length > 1 && partName) {
      partName = partName + ' ' + (i + 1);
    }
    pushSegment(segments, partName, readPoints(segs[i], 'trkpt'));
  }
  return segments;
}

function readWaypoints(root) {
  var nodes = childElements(root, 'wpt');
  var out = [];
  var i;
  for (i = 0; i < nodes.length; i++) {
    var node = nodes[i];
    var lat = parseFloat(node.getAttribute('lat'));
    var lon = parseFloat(node.getAttribute('lon'));
    if (!validCoord(lat, lon)) {
      continue;
    }
    var eleText = childText(node, 'ele');
    var ele = eleText === '' ? null : parseFloat(eleText);
    out.push({
      lat: lat,
      lon: lon,
      ele: ele != null && isFinite(ele) ? ele : null,
      name: childText(node, 'name') || 'Waypoint'
    });
  }
  return out;
}

/** Parse GPX text. Throws Error with a short message when the file is unusable. */
export function parseText(text) {
  var source = String(text || '').replace(/^\uFEFF/, '');
  if (!source.trim()) {
    throw new Error('This file is empty.');
  }
  var doc = new DOMParser().parseFromString(source, 'application/xml');
  if (!doc || !doc.documentElement || doc.getElementsByTagName('parsererror').length) {
    throw new Error('Couldn’t read that file. It is not valid XML.');
  }
  var root = doc.documentElement;
  if (root.localName !== 'gpx') {
    throw new Error('Choose a GPX file (.gpx).');
  }
  var metadata = childElements(root, 'metadata')[0];
  var docName = metadata ? childText(metadata, 'name') : '';
  var segments = [];
  var tracks = childElements(root, 'trk');
  var i;
  for (i = 0; i < tracks.length; i++) {
    var fromTrack = segmentsFromTrack(tracks[i], docName);
    var j;
    for (j = 0; j < fromTrack.length; j++) {
      segments.push(fromTrack[j]);
    }
  }
  if (!segments.length) {
    var routes = childElements(root, 'rte');
    for (i = 0; i < routes.length; i++) {
      var routeName = childText(routes[i], 'name') || docName || '';
      pushSegment(segments, routeName, readPoints(routes[i], 'rtept'));
    }
  }
  var waypoints = readWaypoints(root);
  if (!segments.length && !waypoints.length) {
    throw new Error('No track in this GPX file.');
  }
  return {
    name: docName,
    segments: segments,
    waypoints: waypoints
  };
}

/** Read a File and parse it. The file stays on this device. */
export function parse(file) {
  return file.text().then(function (text) {
    return parseText(text);
  });
}
