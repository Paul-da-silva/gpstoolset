/**
 * Track export (ES module): GPX, CSV, KML text and a browser download.
 * Files are built here and saved on the device. Nothing is uploaded.
 */

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

export function download(filename, mime, text) {
  var blob = new Blob([text], { type: mime });
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
