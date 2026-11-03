/**
 * Track on the main map (ES module): halo + line, start/end markers, and the
 * scrub dot that follows a hover on a graph. Uses the shared map shell.
 */
import * as mapShell from './map-shell.js';
import { displayLatLngs } from '../core/track.js';

var layers = { halo: null, line: null, start: null, end: null, scrub: null };
var preview = { line: null, dots: null };
var markLayer = null;

function restoreLine() {
  if (layers.line) {
    layers.line.setStyle({ color: '#0369a1', opacity: 0.95, weight: 4 });
  }
  if (layers.halo) {
    layers.halo.setStyle({ opacity: 0.95 });
  }
}

/** Remove the edit preview and put the saved track line back. */
export function clearPreview() {
  var map = mapShell.getMap();
  if (preview.line && map) {
    map.removeLayer(preview.line);
  }
  if (preview.dots && map) {
    map.removeLayer(preview.dots);
  }
  preview.line = null;
  preview.dots = null;
  restoreLine();
}

/**
 * Draw what an edit would keep, on top of a faded copy of the current line.
 * keepPoints is the preview. Dots mark the points that would remain.
 * The map is not refitted.
 */
export function showPreview(keepPoints) {
  var map = mapShell.getMap();
  if (!map || !window.L || !keepPoints || keepPoints.length < 2) {
    clearPreview();
    return;
  }
  clearPreview();
  if (layers.line) {
    layers.line.setStyle({ color: '#94a3b8', opacity: 0.55, weight: 3 });
  }
  if (layers.halo) {
    layers.halo.setStyle({ opacity: 0.2 });
  }
  preview.line = window.L.polyline(displayLatLngs(keepPoints), {
    color: '#c2410c',
    weight: 5,
    opacity: 0.95,
    lineJoin: 'round',
    lineCap: 'round',
    interactive: false
  }).addTo(map);
  if (layers.start) {
    layers.start.bringToFront();
  }
  if (layers.end) {
    layers.end.bringToFront();
  }
}

export function removeLayers() {
  clearPreview();
  clearMarks();
  var map = mapShell.getMap();
  var keys = ['halo', 'line', 'start', 'end', 'scrub'];
  var i;
  for (i = 0; i < keys.length; i++) {
    if (layers[keys[i]] && map) {
      map.removeLayer(layers[keys[i]]);
    }
    layers[keys[i]] = null;
  }
}

export function hideScrub() {
  var map = mapShell.getMap();
  if (layers.scrub && map) {
    map.removeLayer(layers.scrub);
  }
  layers.scrub = null;
}

function markerStyle(fill) {
  return {
    radius: 7,
    color: '#ffffff',
    weight: 2,
    fillColor: fill,
    fillOpacity: 1
  };
}

/** Move the scrub dot to points[index]. */
export function showScrub(points, index) {
  var map = mapShell.getMap();
  var point = points[index];
  if (!map || !point || !window.L) {
    return;
  }
  var latlng = [point.lat, point.lon];
  if (!layers.scrub) {
    layers.scrub = window.L.circleMarker(latlng, {
      radius: 7,
      color: '#ffffff',
      weight: 3,
      fillColor: '#c2410c',
      fillOpacity: 1,
      interactive: false
    }).addTo(map);
  } else {
    layers.scrub.setLatLng(latlng);
  }
}

/** Draw the Track and fit the map to it. options.fit === false skips the fit. */
export function drawTrack(track, options) {
  var points = track && track.points;
  var map = mapShell.getMap();
  if (!map || !window.L || !points || !points.length) {
    return;
  }
  removeLayers();
  var latlngs = displayLatLngs(points);
  var first = points[0];
  var last = points[points.length - 1];
  if (latlngs.length >= 2) {
    layers.halo = window.L.polyline(latlngs, {
      color: '#ffffff',
      weight: 8,
      opacity: 0.95,
      lineJoin: 'round',
      lineCap: 'round',
      interactive: false
    }).addTo(map);
    layers.line = window.L.polyline(latlngs, {
      color: '#0369a1',
      weight: 4,
      opacity: 0.95,
      lineJoin: 'round',
      lineCap: 'round'
    }).addTo(map);
  }
  layers.start = window.L.circleMarker([first.lat, first.lon], markerStyle('#115e59'))
    .addTo(map)
    .bindTooltip('Start', { direction: 'top' });
  if (points.length > 1) {
    layers.end = window.L.circleMarker([last.lat, last.lon], markerStyle('#b91c1c'))
      .addTo(map)
      .bindTooltip('End', { direction: 'top' });
  }
  if (options && options.fit === false) {
    return;
  }
  if (layers.line) {
    mapShell.fitBounds(layers.line.getBounds(), {
      paddingTopLeft: [40, 64],
      paddingBottomRight: [40, 88]
    });
  } else {
    map.setView([first.lat, first.lon], 16);
  }
}

function tooltipText(value) {
  return String(value || 'Waypoint')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function clearMarks() {
  var map = mapShell.getMap();
  if (markLayer && map) {
    map.removeLayer(markLayer);
  }
  markLayer = null;
}

/** Waypoints as points. Does not remove the track line. */
export function drawMarks(waypoints) {
  clearMarks();
  var map = mapShell.getMap();
  if (!map || !window.L || !waypoints || !waypoints.length) {
    return;
  }
  markLayer = window.L.layerGroup();
  var i;
  for (i = 0; i < waypoints.length; i++) {
    var mark = waypoints[i];
    window.L.circleMarker([mark.lat, mark.lon], {
      radius: 5,
      color: '#115e59',
      weight: 2,
      fillColor: '#2dd4a0',
      fillOpacity: 1
    }).bindTooltip(tooltipText(mark.name), { direction: 'top' }).addTo(markLayer);
  }
  markLayer.addTo(map);
}

/** Fit the map to track points and waypoints together. */
export function fitPoints(points, waypoints) {
  if (!window.L) {
    return;
  }
  var bounds = null;
  function extend(lat, lon) {
    if (lat == null || lon == null || !isFinite(lat) || !isFinite(lon)) {
      return;
    }
    if (!bounds) {
      bounds = window.L.latLngBounds([[lat, lon], [lat, lon]]);
    } else {
      bounds.extend([lat, lon]);
    }
  }
  var i;
  if (points) {
    for (i = 0; i < points.length; i++) {
      extend(points[i].lat, points[i].lon);
    }
  }
  if (waypoints) {
    for (i = 0; i < waypoints.length; i++) {
      extend(waypoints[i].lat, waypoints[i].lon);
    }
  }
  if (!bounds) {
    return;
  }
  mapShell.fitBounds(bounds, {
    paddingTopLeft: [40, 64],
    paddingBottomRight: [40, 88]
  });
}
