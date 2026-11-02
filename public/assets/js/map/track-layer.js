/**
 * Track on the main map (ES module): halo + line, start/end markers, and the
 * scrub dot that follows a hover on a graph. Uses the shared map shell.
 */
import * as mapShell from './map-shell.js';
import { displayLatLngs } from '../core/track.js';

var layers = { halo: null, line: null, start: null, end: null, scrub: null };

export function removeLayers() {
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

/** Draw the Track and fit the map to it. */
export function drawTrack(track) {
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
  if (layers.line) {
    mapShell.fitBounds(layers.line.getBounds(), {
      paddingTopLeft: [40, 64],
      paddingBottomRight: [40, 88]
    });
  } else {
    map.setView([first.lat, first.lon], 16);
  }
}
