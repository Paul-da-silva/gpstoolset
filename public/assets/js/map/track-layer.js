/**
 * Track on the main map (ES module): halo + line, start/end markers, and the
 * scrub dot. Hovering the track (or a graph) moves the dot and a tooltip.
 * Uses the shared map shell.
 */
import * as mapShell from './map-shell.js';
import { displayLatLngs, elapsedSec } from '../core/track.js';
import {
  formatAlt, formatClock, formatDistance, formatSpeed
} from '../core/format.js';

var layers = { halo: null, line: null, start: null, end: null, scrub: null };
var preview = { line: null, dots: null };
var markLayer = null;
var hoverTrack = null;
var hoverPoints = null;
var tipPoints = null;
var tipIndex = -1;
var hoverBound = false;
var hoverFrame = 0;
var hoverPending = null;
var lastPointer = null;
var draggingMap = false;
var projGen = 0;
var projCache = null;

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
  var hadTip = tipIndex >= 0;
  clearPreview();
  clearMarks();
  hoverTrack = null;
  hoverPoints = null;
  invalidateProj();
  hideScrub();
  if (hadTip) {
    emitScrub(-1);
  }
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
  tipIndex = -1;
  tipPoints = null;
  hideTip();
}

function tipNode() {
  return document.getElementById('track-tip');
}

function hideTip() {
  var tip = tipNode();
  if (tip) {
    tip.hidden = true;
  }
}

function pad(n) {
  return n < 10 ? '0' + n : String(n);
}

function clockOf(ms) {
  var date = new Date(ms);
  if (!isFinite(date.getTime())) {
    return '';
  }
  return pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds());
}

function timeText(points, point, index) {
  if (point.t != null && isFinite(point.t)) {
    return clockOf(point.t);
  }
  if (point.cts != null || (points[0] && (points[0].t != null || points[0].cts != null))) {
    return formatClock(elapsedSec(points, point, index));
  }
  return '';
}

function gAt(acc, cts) {
  if (!acc || !acc.length || cts == null || !isFinite(cts)) {
    return null;
  }
  var lo = 0;
  var hi = acc.length - 1;
  while (lo < hi) {
    var mid = (lo + hi) >> 1;
    if (acc[mid].cts < cts) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }
  if (lo > 0 && Math.abs(acc[lo - 1].cts - cts) < Math.abs(acc[lo].cts - cts)) {
    lo = lo - 1;
  }
  var g = acc[lo].g;
  return g != null && isFinite(g) ? g : null;
}

function tipRows(points, index) {
  var point = points[index];
  var track = hoverTrack && hoverTrack.points === points ? hoverTrack : null;
  var rows = [];
  var timed = !!(track && track.meta && track.meta.timed) || point.t != null || point.cts != null;
  if (timed) {
    rows.push(['Time', timeText(points, point, index) || '—']);
  }
  rows.push(['Distance', formatDistance(point.dist)]);
  rows.push(['Elevation', formatAlt(point.ele)]);
  var speed = point.speed;
  if ((speed == null || !isFinite(speed)) && track && track.smooth) {
    speed = track.smooth[index];
  }
  rows.push(['Speed', formatSpeed(speed)]);
  if (track && track.meta && track.meta.hasVspeed) {
    rows.push(['Vertical speed', formatSpeed(point.vspeed)]);
  }
  if (track && track.meta && track.meta.hasG) {
    var g = gAt(track.acc, point.cts);
    rows.push(['G-force', g == null ? '—' : g.toFixed(2) + ' g']);
  }
  return rows;
}

function renderTip(points, index) {
  var tip = tipNode();
  var point = points && points[index];
  if (!tip || !point) {
    hideTip();
    return;
  }
  var rows = tipRows(points, index);
  var dl = document.createElement('dl');
  var i;
  for (i = 0; i < rows.length; i++) {
    var row = document.createElement('div');
    var term = document.createElement('dt');
    var value = document.createElement('dd');
    term.textContent = rows[i][0];
    value.textContent = rows[i][1];
    row.appendChild(term);
    row.appendChild(value);
    dl.appendChild(row);
  }
  tip.textContent = '';
  tip.appendChild(dl);
  tip.hidden = false;
}

function placeTip(point) {
  var map = mapShell.getMap();
  var tip = tipNode();
  var stage = document.getElementById('map-stage');
  if (!map || !tip || !stage || !point || tip.hidden) {
    return;
  }
  var at = map.latLngToContainerPoint([point.lat, point.lon]);
  var width = tip.offsetWidth;
  var height = tip.offsetHeight;
  var x = at.x + 14;
  var y = at.y - height - 12;
  var maxX = stage.clientWidth - width - 8;
  var maxY = stage.clientHeight - height - 8;
  if (x > maxX) {
    x = at.x - width - 14;
  }
  if (x < 8) {
    x = 8;
  }
  if (y < 8) {
    y = at.y + 16;
  }
  if (y > maxY) {
    y = Math.max(8, maxY);
  }
  tip.style.left = Math.round(x) + 'px';
  tip.style.top = Math.round(y) + 'px';
}

function emitScrub(index) {
  document.dispatchEvent(new CustomEvent('gpstoolset:scrub', {
    detail: { index: index }
  }));
}

function distSq(x, y, px, py) {
  var dx = x - px;
  var dy = y - py;
  return dx * dx + dy * dy;
}

function distToSegSq(x, y, ax, ay, bx, by) {
  var abx = bx - ax;
  var aby = by - ay;
  var len = abx * abx + aby * aby;
  var t = 0;
  if (len > 0) {
    t = ((x - ax) * abx + (y - ay) * aby) / len;
    if (t < 0) {
      t = 0;
    } else if (t > 1) {
      t = 1;
    }
  }
  return distSq(x, y, ax + abx * t, ay + aby * t);
}

function hitLimit() {
  var coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  var px = coarse ? 36 : 28;
  return px * px;
}

function invalidateProj() {
  projGen += 1;
}

/** Container pixels for the open track. Rebuilt after a pan, zoom, or new line. */
function screenPoints(map, points) {
  if (projCache && projCache.gen === projGen && projCache.points === points) {
    return projCache;
  }
  var count = points.length;
  var pts = new Array(count);
  var minX = Infinity;
  var minY = Infinity;
  var maxX = -Infinity;
  var maxY = -Infinity;
  var i;
  for (i = 0; i < count; i++) {
    var p = map.latLngToContainerPoint([points[i].lat, points[i].lon]);
    pts[i] = p;
    if (!isFinite(p.x) || !isFinite(p.y)) {
      continue;
    }
    if (p.x < minX) {
      minX = p.x;
    }
    if (p.y < minY) {
      minY = p.y;
    }
    if (p.x > maxX) {
      maxX = p.x;
    }
    if (p.y > maxY) {
      maxY = p.y;
    }
  }
  projCache = {
    gen: projGen,
    points: points,
    pts: pts,
    minX: minX,
    minY: minY,
    maxX: maxX,
    maxY: maxY
  };
  return projCache;
}

/** Nearest track vertex to a map-container pixel, or -1 when the cursor is off the line. */
function nearestIndex(map, points, x, y) {
  var count = points.length;
  if (!count) {
    return -1;
  }
  var cache = screenPoints(map, points);
  var limit = hitLimit();
  var pad = Math.sqrt(limit);
  if (!isFinite(cache.minX) || x < cache.minX - pad || y < cache.minY - pad || x > cache.maxX + pad || y > cache.maxY + pad) {
    return -1;
  }
  var pts = cache.pts;
  var step = count > 2400 ? Math.ceil(count / 2400) : 1;
  var bestD = limit;
  var segStart = -1;
  var segEnd = -1;
  var prev = null;
  var prevI = -1;

  function consider(i0, p0, i1, p1) {
    var d = distToSegSq(x, y, p0.x, p0.y, p1.x, p1.y);
    if (d < bestD) {
      bestD = d;
      segStart = i0;
      segEnd = i1;
    }
  }

  var i;
  for (i = 0; i < count; i += step) {
    var p = pts[i];
    if (prev) {
      consider(prevI, prev, i, p);
    } else if (distSq(x, y, p.x, p.y) < bestD) {
      bestD = distSq(x, y, p.x, p.y);
      segStart = i;
      segEnd = i;
    }
    prev = p;
    prevI = i;
  }
  if (prevI !== count - 1 && prev) {
    consider(prevI, prev, count - 1, pts[count - 1]);
  }
  if (segStart < 0) {
    return -1;
  }
  var bestI = segStart;
  var bestPoint = Infinity;
  var a = pts[segStart];
  var da = distSq(x, y, a.x, a.y);
  if (da < bestPoint) {
    bestPoint = da;
    bestI = segStart;
  }
  for (i = segStart + 1; i <= segEnd; i++) {
    var b = pts[i];
    var along = distToSegSq(x, y, a.x, a.y, b.x, b.y);
    if (along < bestD) {
      bestD = along;
    }
    var db = distSq(x, y, b.x, b.y);
    if (db < bestPoint) {
      bestPoint = db;
      bestI = i;
    }
    a = b;
  }
  if (bestD > limit) {
    return -1;
  }
  return bestI;
}

function hideHover() {
  if (tipIndex < 0 && !layers.scrub) {
    hideTip();
    return;
  }
  hideScrub();
  emitScrub(-1);
}

function applyHover(x, y) {
  var map = mapShell.getMap();
  if (!map || !hoverPoints || draggingMap) {
    hideHover();
    return;
  }
  var index = nearestIndex(map, hoverPoints, x, y);
  if (index < 0) {
    hideHover();
    return;
  }
  if (index === tipIndex && tipPoints === hoverPoints) {
    return;
  }
  showScrub(hoverPoints, index);
  emitScrub(index);
}

function queueHover(x, y) {
  hoverPending = { x: x, y: y };
  if (hoverFrame) {
    return;
  }
  hoverFrame = window.requestAnimationFrame(function () {
    hoverFrame = 0;
    var pending = hoverPending;
    hoverPending = null;
    if (!pending) {
      return;
    }
    applyHover(pending.x, pending.y);
  });
}

function onControl(event) {
  var target = event.originalEvent && event.originalEvent.target;
  if (!target || !target.closest) {
    return false;
  }
  return !!target.closest('.leaflet-control');
}

function bindMapHover() {
  if (hoverBound) {
    return;
  }
  var map = mapShell.getMap();
  if (!map) {
    return;
  }
  hoverBound = true;
  map.on('move zoom viewreset resize', invalidateProj);
  map.on('mousemove', function (event) {
    if (draggingMap || onControl(event)) {
      return;
    }
    lastPointer = { x: event.containerPoint.x, y: event.containerPoint.y };
    queueHover(lastPointer.x, lastPointer.y);
  });
  map.on('mouseout', function () {
    if (Date.now() < bindMapHover.stickyUntil) {
      return;
    }
    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
      return;
    }
    lastPointer = null;
    hoverPending = null;
    hideHover();
  });
  map.on('click', function (event) {
    if (onControl(event)) {
      return;
    }
    bindMapHover.stickyUntil = Date.now() + 700;
    lastPointer = { x: event.containerPoint.x, y: event.containerPoint.y };
    queueHover(lastPointer.x, lastPointer.y);
  });
  map.on('dragstart', function () {
    draggingMap = true;
    hideHover();
  });
  map.on('dragend', function () {
    draggingMap = false;
  });
  document.addEventListener('gpstoolset:dock', function () {
    if (tipIndex >= 0) {
      emitScrub(tipIndex);
    }
  });
}

bindMapHover.stickyUntil = 0;

/** Repaint the open tooltip after a unit change, and keep the graph in step. */
export function refreshTip() {
  if (tipIndex < 0 || !tipPoints || !tipPoints[tipIndex]) {
    return;
  }
  renderTip(tipPoints, tipIndex);
  placeTip(tipPoints[tipIndex]);
  emitScrub(tipIndex);
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
  tipPoints = points;
  tipIndex = index;
  renderTip(points, index);
  placeTip(point);
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
  hoverTrack = track;
  hoverPoints = points;
  invalidateProj();
  bindMapHover();
  if (lastPointer && !draggingMap) {
    queueHover(lastPointer.x, lastPointer.y);
  }
  if (options && options.fit === false) {
    return;
  }
  if (layers.line) {
    mapShell.fitBounds(layers.line.getBounds(), {
      paddingTopLeft: [48, 72],
      paddingBottomRight: [72, 72]
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
    paddingTopLeft: [48, 72],
    paddingBottomRight: [72, 72]
  });
}
