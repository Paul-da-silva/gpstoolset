/**
 * KML and KMZ parser (ES module). Reads the file in the browser.
 * Nothing is uploaded.
 *
 * parse(file) → { name, segments: [{ name, points }], waypoints }
 * A point is { lat, lon, ele?, speed?, t? }. Lines become segments.
 * Placemark points become waypoints.
 */
import { validCoord } from '../core/track.js';
import { readKmlText } from './zip.js';

function childText(el, local) {
  var nodes = el.children;
  var i;
  if (!nodes) {
    return '';
  }
  for (i = 0; i < nodes.length; i++) {
    if (nodes[i].localName === local) {
      return (nodes[i].textContent || '').trim();
    }
  }
  return '';
}

function allElements(root) {
  return root.getElementsByTagName('*');
}

function nearest(el, local) {
  var node = el.parentElement;
  while (node) {
    if (node.localName === local) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
}

function ancestorNamed(el, local) {
  var node = el.parentElement;
  while (node) {
    if (node.localName === local) {
      return true;
    }
    node = node.parentElement;
  }
  return false;
}

function geometryName(el) {
  var placemark = nearest(el, 'Placemark');
  var folder = nearest(el, 'Folder');
  var doc = nearest(el, 'Document');
  var name = '';
  if (placemark) {
    name = childText(placemark, 'name');
  }
  if (!name && folder) {
    name = childText(folder, 'name');
  }
  if (!name && doc) {
    name = childText(doc, 'name');
  }
  return name;
}

function documentName(root) {
  if (root.localName === 'Document') {
    return childText(root, 'name');
  }
  var nodes = root.children;
  var i;
  for (i = 0; i < nodes.length; i++) {
    if (nodes[i].localName === 'Document') {
      return childText(nodes[i], 'name');
    }
  }
  return childText(root, 'name');
}

var TUPLE = /(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?)\s*,\s*(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?)(?:\s*,\s*(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?))?/gi;

function readCoordinateText(text) {
  var points = [];
  var match;
  var source = String(text || '');
  TUPLE.lastIndex = 0;
  while ((match = TUPLE.exec(source))) {
    var lon = parseFloat(match[1]);
    var lat = parseFloat(match[2]);
    var ele = match[3] == null ? null : parseFloat(match[3]);
    if (!validCoord(lat, lon)) {
      continue;
    }
    points.push({
      lat: lat,
      lon: lon,
      ele: ele != null && isFinite(ele) ? ele : null,
      speed: null,
      t: null
    });
  }
  return points;
}

function readGxTrack(el) {
  var whens = [];
  var coords = [];
  var nodes = el.children;
  var i;
  for (i = 0; i < nodes.length; i++) {
    if (nodes[i].localName === 'when') {
      whens.push(Date.parse((nodes[i].textContent || '').trim()));
    } else if (nodes[i].localName === 'coord') {
      coords.push((nodes[i].textContent || '').trim());
    }
  }
  var points = [];
  for (i = 0; i < coords.length; i++) {
    var bits = coords[i].split(/\s+/);
    var lon = parseFloat(bits[0]);
    var lat = parseFloat(bits[1]);
    var ele = bits.length > 2 ? parseFloat(bits[2]) : null;
    var t = whens[i];
    if (!validCoord(lat, lon)) {
      var parsed = readCoordinateText(coords[i]);
      if (parsed.length) {
        parsed[0].t = isFinite(t) ? t : null;
        points.push(parsed[0]);
      }
      continue;
    }
    points.push({
      lat: lat,
      lon: lon,
      ele: ele != null && isFinite(ele) ? ele : null,
      speed: null,
      t: isFinite(t) ? t : null
    });
  }
  return points;
}

function pushNamed(list, name, item) {
  var label = name || item.fallback;
  var count = 0;
  var i;
  for (i = 0; i < list.length; i++) {
    if (list[i].name === label || list[i].name.indexOf(label + ' ') === 0) {
      count += 1;
    }
  }
  list.push({
    name: count ? label + ' ' + (count + 1) : label,
    points: item.points,
    point: item.point
  });
}

/** Parse KML text. Throws Error with a short message when the file is unusable. */
export function parseText(text) {
  var source = String(text || '').replace(/^\uFEFF/, '').trim();
  if (!source) {
    throw new Error('This file is empty.');
  }
  var doc = new DOMParser().parseFromString(source, 'application/xml');
  if (!doc || !doc.documentElement || doc.getElementsByTagName('parsererror').length) {
    throw new Error('Couldn’t read that file. It is not valid KML.');
  }
  var root = doc.documentElement;
  if (root.localName !== 'kml' && root.localName !== 'Document' &&
      root.localName !== 'Folder' && root.localName !== 'Placemark') {
    throw new Error('Choose a KML or KMZ file (.kml or .kmz).');
  }

  var nodes = allElements(root);
  var trackPlacemarks = [];
  var i;
  for (i = 0; i < nodes.length; i++) {
    if (nodes[i].localName !== 'Track') {
      continue;
    }
    var owner = nearest(nodes[i], 'Placemark');
    if (owner && trackPlacemarks.indexOf(owner) === -1) {
      trackPlacemarks.push(owner);
    }
  }

  var segments = [];
  var waypoints = [];
  for (i = 0; i < nodes.length; i++) {
    var el = nodes[i];
    var local = el.localName;
    if (ancestorNamed(el, 'innerBoundaryIs')) {
      continue;
    }
    if (local === 'Track') {
      var fromTrack = readGxTrack(el);
      if (fromTrack.length) {
        pushNamed(segments, geometryName(el), { fallback: 'Track', points: fromTrack });
      }
      continue;
    }
    if (local === 'LineString' || local === 'LinearRing') {
      var placemark = nearest(el, 'Placemark');
      if (placemark && trackPlacemarks.indexOf(placemark) !== -1) {
        continue;
      }
      var fromLine = readCoordinateText(childText(el, 'coordinates'));
      if (fromLine.length) {
        pushNamed(segments, geometryName(el), { fallback: 'Track', points: fromLine });
      }
      continue;
    }
    if (local === 'Point') {
      var fromPoint = readCoordinateText(childText(el, 'coordinates'));
      if (!fromPoint.length) {
        continue;
      }
      var point = fromPoint[0];
      point.name = geometryName(el) || 'Waypoint';
      pushNamed(waypoints, point.name, { fallback: 'Waypoint', point: point });
    }
  }

  var namedWaypoints = [];
  for (i = 0; i < waypoints.length; i++) {
    var mark = waypoints[i].point;
    mark.name = waypoints[i].name || mark.name || 'Waypoint';
    namedWaypoints.push(mark);
  }

  if (!segments.length && !namedWaypoints.length) {
    throw new Error('No track or placemark in this KML file.');
  }
  return {
    name: documentName(root),
    segments: segments,
    waypoints: namedWaypoints
  };
}

function isZip(bytes) {
  return bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b &&
    (bytes[2] === 0x03 || bytes[2] === 0x05 || bytes[2] === 0x07) &&
    (bytes[3] === 0x04 || bytes[3] === 0x06 || bytes[3] === 0x08);
}

/** Read a File and parse it. A KMZ is unzipped in the browser. The file stays on this device. */
export function parse(file) {
  return file.arrayBuffer().then(function (buf) {
    var bytes = new Uint8Array(buf);
    if (isZip(bytes)) {
      return readKmlText(bytes).then(parseText);
    }
    var text = new TextDecoder('utf-8').decode(bytes);
    return parseText(text);
  });
}
