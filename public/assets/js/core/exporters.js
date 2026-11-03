/**
 * Track export (ES module): GPX, CSV, KML, KMZ and a browser download.
 * Files are built here and saved on the device. Nothing is uploaded.
 * KMZ is a stored zip of the KML (parsers/zip.js).
 */
import { zipStore } from '../parsers/zip.js';

function xml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** File name without extension, safe for a download. */
export function stem(name) {
  var base = String(name || 'track');
  var cut = base.lastIndexOf('.');
  if (cut > 0) {
    base = base.slice(0, cut);
  }
  base = base.replace(/[^\w.\- ]+/g, '-').replace(/\s+/g, ' ').trim();
  return base || 'track';
}

function isoTime(ms) {
  if (ms == null || !isFinite(ms) || ms < Date.UTC(2000, 0, 1)) {
    return '';
  }
  var date = new Date(ms);
  if (isNaN(date.getTime())) {
    return '';
  }
  return date.toISOString();
}

function saveBlob(filename, blob) {
  var url = URL.createObjectURL(blob);
  var link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(function () {
    URL.revokeObjectURL(url);
  }, 1500);
}

export function download(filename, mime, text) {
  saveBlob(filename, new Blob([text], { type: mime }));
}

export function downloadBytes(filename, mime, bytes) {
  saveBlob(filename, new Blob([bytes], { type: mime }));
}

function gpxHeader() {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<gpx version="1.1" creator="GPS Toolset" xmlns="http://www.topografix.com/GPX/1/1" xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v1">'
  ];
}

function appendTrack(lines, points, name) {
  lines.push('<trk><name>' + xml(name) + '</name><trkseg>');
  var i;
  for (i = 0; i < points.length; i++) {
    var point = points[i];
    lines.push('<trkpt lat="' + point.lat.toFixed(7) + '" lon="' + point.lon.toFixed(7) + '">');
    if (point.ele != null && isFinite(point.ele)) {
      lines.push('<ele>' + point.ele.toFixed(2) + '</ele>');
    }
    var when = isoTime(point.t);
    if (when) {
      lines.push('<time>' + when + '</time>');
    }
    if (point.speed != null && isFinite(point.speed)) {
      lines.push('<extensions><gpxtpx:TrackPointExtension><gpxtpx:speed>' +
        point.speed.toFixed(3) + '</gpxtpx:speed></gpxtpx:TrackPointExtension></extensions>');
    }
    lines.push('</trkpt>');
  }
  lines.push('</trkseg></trk>');
}

export function toGpx(points, name) {
  var lines = gpxHeader();
  appendTrack(lines, points, name);
  lines.push('</gpx>');
  return lines.join('');
}

/**
 * One GPX file with several tracks.
 * tracks: [{ name, points }] or an array of point arrays.
 */
export function toGpxTracks(tracks, name) {
  var lines = gpxHeader();
  var base = name || 'track';
  var i;
  for (i = 0; i < tracks.length; i++) {
    var part = tracks[i];
    var points = part && part.points ? part.points : part;
    var partName = part && part.name ? part.name : base + ' ' + (i + 1);
    if (points && points.length) {
      appendTrack(lines, points, partName);
    }
  }
  lines.push('</gpx>');
  return lines.join('');
}

export function toCsv(points) {
  var lines = ['time_utc,latitude,longitude,altitude_m,speed_mps'];
  var i;
  for (i = 0; i < points.length; i++) {
    var point = points[i];
    lines.push([
      isoTime(point.t),
      point.lat.toFixed(7),
      point.lon.toFixed(7),
      point.ele != null && isFinite(point.ele) ? point.ele.toFixed(2) : '',
      point.speed != null && isFinite(point.speed) ? point.speed.toFixed(3) : ''
    ].join(','));
  }
  return lines.join('\n') + '\n';
}

export function toKml(points, name) {
  var coords = [];
  var i;
  for (i = 0; i < points.length; i++) {
    var point = points[i];
    var alt = point.ele != null && isFinite(point.ele) ? point.ele.toFixed(2) : '0';
    coords.push(point.lon.toFixed(7) + ',' + point.lat.toFixed(7) + ',' + alt);
  }
  return '<?xml version="1.0" encoding="UTF-8"?>' +
    '<kml xmlns="http://www.opengis.net/kml/2.2"><Document><name>' + xml(name) + '</name>' +
    '<Placemark><name>' + xml(name) + '</name><LineString><altitudeMode>absolute</altitudeMode><coordinates>' +
    coords.join(' ') +
    '</coordinates></LineString></Placemark></Document></kml>';
}

function pointTime(point) {
  return isoTime(point.t);
}

/** True when at least one point has a time. A mix still uses gx:Track. */
function trackIsTimed(points) {
  var i;
  if (!points || !points.length) {
    return false;
  }
  for (i = 0; i < points.length; i++) {
    if (pointTime(points[i])) {
      return true;
    }
  }
  return false;
}

function trackHasElevation(points) {
  var i;
  for (i = 0; i < points.length; i++) {
    if (points[i].ele != null && isFinite(points[i].ele)) {
      return true;
    }
  }
  return false;
}

function partsOf(doc) {
  if (!doc) {
    return [];
  }
  return doc.segments || doc.tracks || [];
}

/**
 * GPX with several tracks and waypoints.
 * doc: { name, tracks or segments: [{ name, points }], waypoints }
 */
export function toGpxDocument(doc) {
  var name = doc && doc.name ? doc.name : 'track';
  var tracks = partsOf(doc);
  var waypoints = doc && doc.waypoints ? doc.waypoints : [];
  var lines = gpxHeader();
  lines.push('<metadata><name>' + xml(name) + '</name></metadata>');
  var i;
  for (i = 0; i < waypoints.length; i++) {
    var mark = waypoints[i];
    lines.push('<wpt lat="' + mark.lat.toFixed(7) + '" lon="' + mark.lon.toFixed(7) + '">');
    if (mark.ele != null && isFinite(mark.ele)) {
      lines.push('<ele>' + mark.ele.toFixed(2) + '</ele>');
    }
    var when = pointTime(mark);
    if (when) {
      lines.push('<time>' + when + '</time>');
    }
    lines.push('<name>' + xml(mark.name || 'Waypoint') + '</name></wpt>');
  }
  for (i = 0; i < tracks.length; i++) {
    var part = tracks[i];
    var points = part && part.points ? part.points : part;
    if (!points || !points.length) {
      continue;
    }
    var partName = part && part.name ? part.name : name;
    appendTrack(lines, points, partName);
  }
  lines.push('</gpx>');
  return lines.join('\n');
}

function kmlPoint(point, named) {
  var alt = point.ele != null && isFinite(point.ele) ? ',' + point.ele.toFixed(2) : '';
  var body = '<Point><coordinates>' + point.lon.toFixed(7) + ',' + point.lat.toFixed(7) + alt +
    '</coordinates></Point>';
  if (!named) {
    return body;
  }
  var when = pointTime(point);
  var time = when ? '<TimeStamp><when>' + when + '</when></TimeStamp>' : '';
  return '<Placemark><name>' + xml(point.name || 'Waypoint') + '</name>' + time + body + '</Placemark>';
}

function kmlTrack(points, name) {
  var lines = ['<Placemark><name>' + xml(name) + '</name>'];
  var i;
  if (trackIsTimed(points)) {
    var mode = trackHasElevation(points) ? 'absolute' : 'clampToGround';
    lines.push('<gx:Track><altitudeMode>' + mode + '</altitudeMode>');
    for (i = 0; i < points.length; i++) {
      var when = pointTime(points[i]);
      lines.push(when ? '<when>' + when + '</when>' : '<when></when>');
    }
    for (i = 0; i < points.length; i++) {
      var point = points[i];
      var alt = point.ele != null && isFinite(point.ele) ? ' ' + point.ele.toFixed(2) : '';
      lines.push('<gx:coord>' + point.lon.toFixed(7) + ' ' + point.lat.toFixed(7) + alt + '</gx:coord>');
    }
    lines.push('</gx:Track></Placemark>');
    return lines.join('');
  }
  var coords = [];
  var elevated = trackHasElevation(points);
  for (i = 0; i < points.length; i++) {
    var place = points[i];
    var height = elevated
      ? ',' + (place.ele != null && isFinite(place.ele) ? place.ele.toFixed(2) : '0')
      : '';
    coords.push(place.lon.toFixed(7) + ',' + place.lat.toFixed(7) + height);
  }
  lines.push('<LineString><altitudeMode>' + (elevated ? 'absolute' : 'clampToGround') +
    '</altitudeMode><coordinates>' + coords.join(' ') + '</coordinates></LineString></Placemark>');
  return lines.join('');
}

/**
 * KML with one placemark per track, plus a placemark per waypoint.
 * A track with any times uses gx:Track. Untimed points get an empty when.
 * A track with no times at all is a LineString.
 */
export function toKmlDocument(doc) {
  var name = doc && doc.name ? doc.name : 'track';
  var tracks = partsOf(doc);
  var waypoints = doc && doc.waypoints ? doc.waypoints : [];
  var lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2">',
    '<Document><name>' + xml(name) + '</name>'
  ];
  var i;
  for (i = 0; i < waypoints.length; i++) {
    lines.push(kmlPoint(waypoints[i], true));
  }
  for (i = 0; i < tracks.length; i++) {
    var part = tracks[i];
    var points = part && part.points ? part.points : part;
    if (!points || !points.length) {
      continue;
    }
    var partName = part && part.name ? part.name : name;
    lines.push(kmlTrack(points, partName));
  }
  lines.push('</Document></kml>');
  return lines.join('');
}

/** Save a Track as 'gpx', 'csv' or 'kml'. */
export function exportTrack(kind, track) {
  if (!track || !track.points.length) {
    return;
  }
  var name = stem(track.meta.name);
  if (kind === 'gpx') {
    download(name + '.gpx', 'application/gpx+xml', toGpx(track.points, name));
  } else if (kind === 'csv') {
    download(name + '.csv', 'text/csv', toCsv(track.points));
  } else if (kind === 'kml') {
    download(name + '.kml', 'application/vnd.google-earth.kml+xml', toKml(track.points, name));
  }
}

function modelOf(doc, label) {
  var name = stem(label || (doc && doc.name) || 'track');
  return {
    name: name,
    tracks: (doc && (doc.segments || doc.tracks)) || [],
    waypoints: (doc && doc.waypoints) || []
  };
}

/**
 * Build a download for a document. kind is gpx, kml, kmz, or csv.
 * CSV uses activePoints when those are passed, otherwise the first track.
 * Returns null when there is nothing to write. Nothing is uploaded.
 */
export function buildExport(kind, doc, label, activePoints) {
  var model = modelOf(doc, label);
  var name = model.name;
  if (kind === 'gpx') {
    return { filename: name + '.gpx', mime: 'application/gpx+xml', text: toGpxDocument(model) };
  }
  if (kind === 'kml') {
    return { filename: name + '.kml', mime: 'application/vnd.google-earth.kml+xml', text: toKmlDocument(model) };
  }
  if (kind === 'kmz') {
    return {
      filename: name + '.kmz',
      mime: 'application/vnd.google-earth.kmz',
      bytes: zipStore('doc.kml', toKmlDocument(model))
    };
  }
  if (kind === 'csv') {
    var points = activePoints;
    if (!points) {
      var parts = model.tracks;
      var i;
      points = [];
      for (i = 0; i < parts.length; i++) {
        var part = parts[i];
        var list = part && part.points ? part.points : part;
        if (list && list.length) {
          points = list;
          break;
        }
      }
    }
    if (!points || !points.length) {
      return null;
    }
    return { filename: name + '.csv', mime: 'text/csv', text: toCsv(points) };
  }
  return null;
}

/** Save the object returned by buildExport. */
export function saveBuilt(built) {
  if (!built) {
    return;
  }
  if (built.bytes) {
    downloadBytes(built.filename, built.mime, built.bytes);
    return;
  }
  download(built.filename, built.mime, built.text || '');
}
