/**
 * Measure distance (ES module). Glue only.
 *
 * Click the map to add a point. Distance is the great-circle length.
 * A long leg is drawn along that arc so the curve shows on the map.
 * Two points finish a leg. Done or Escape ends a longer line.
 * The readout is the dock under the map. Points stay in this tab
 * (sessionStorage gpstoolset.measure.v1). Units and dock height use
 * gpstoolset.ui.v1. Nothing is uploaded.
 *
 * Page: tools/measure-distance/
 */
import { haversine } from '../core/track.js';
import { formatDistance } from '../core/format.js';
import * as uiState from '../core/ui-state.js';
import { bindUnits, paintUnits } from '../map/panels.js';
import * as mapShell from '../map/map-shell.js';

var MAX_POINTS = 500;
var SESSION_KEY = 'gpstoolset.measure.v1';
var MIN_DOCK = 120;

var points = [];
var markers = [];
var line = null;
var rubber = null;
var map = null;
var color = '#0369a1';
var suppressClick = false;
var draggingPoint = false;
var draggingDock = false;
var dockHeight = 300;
var dockStartY = 0;
var dockStartH = 0;
var copyTimer = 0;
var lastAdd = 0;
var hover = null;
var finished = false;

function $(id) {
  return document.getElementById(id);
}

function setStatus(message) {
  var el = $('measure-status');
  if (el) {
    el.textContent = message || '';
  }
}

function readRouteColor() {
  var value = window.getComputedStyle(document.documentElement).getPropertyValue('--route').trim();
  return value || '#0369a1';
}

function isMobile() {
  return window.matchMedia('(max-width: 720px)').matches;
}

function maxDock() {
  var ratio = isMobile() ? 0.4 : 0.45;
  var byRatio = Math.round(window.innerHeight * ratio);
  var header = document.querySelector('.topbar');
  var headerH = header ? header.offsetHeight : 0;
  var byRoom = window.innerHeight - headerH - 140;
  var max = Math.min(byRatio, byRoom);
  if (max < MIN_DOCK) {
    max = MIN_DOCK;
  }
  return max;
}

function clampDock(height) {
  var n = Math.round(Number(height));
  if (!isFinite(n)) {
    n = 300;
  }
  if (n < MIN_DOCK) {
    n = MIN_DOCK;
  }
  var max = maxDock();
  if (n > max) {
    n = max;
  }
  return n;
}

function applyDockHeight(height, save) {
  var dock = $('measure-dock');
  var handle = $('measure-handle');
  dockHeight = clampDock(height);
  if (dock) {
    dock.style.height = dockHeight + 'px';
  }
  if (handle) {
    handle.setAttribute('aria-valuemin', String(MIN_DOCK));
    handle.setAttribute('aria-valuenow', String(dockHeight));
    handle.setAttribute('aria-valuemax', String(maxDock()));
  }
  if (save) {
    var current = uiState.load();
    current.measure.height = dockHeight;
    uiState.save();
  }
}

function totalMeters() {
  var sum = 0;
  var i;
  for (i = 1; i < points.length; i++) {
    sum += haversine(points[i - 1], points[i]);
  }
  return sum;
}

function summaryText() {
  var lines = ['Measure distance on a map', 'Total: ' + formatDistance(totalMeters())];
  var running = 0;
  var i;
  for (i = 0; i < points.length; i++) {
    if (i === 0) {
      lines.push('1  Start');
      continue;
    }
    var leg = haversine(points[i - 1], points[i]);
    running += leg;
    lines.push((i + 1) + '  ' + formatDistance(leg) + '  (total ' + formatDistance(running) + ')');
  }
  return lines.join('\n');
}

function paintButtons() {
  var has = points.length > 0;
  var span = points.length > 1;
  $('measure-undo').disabled = !has;
  $('measure-clear').disabled = !has;
  $('measure-fit').disabled = !has;
  $('measure-copy').disabled = !span;
  $('measure-done').disabled = finished || !span;
  paintCursor();
}

function paintCursor() {
  if (!map) {
    return;
  }
  map.getContainer().style.cursor = finished ? '' : 'crosshair';
}

function renderLegs() {
  var list = $('measure-legs');
  var running = 0;
  list.replaceChildren();
  points.forEach(function (point, index) {
    var li = document.createElement('li');
    li.className = 'measure-leg';

    var num = document.createElement('span');
    num.className = 'measure-leg-num';
    num.textContent = String(index + 1);

    var text = document.createElement('span');
    text.className = 'measure-leg-text';
    if (index === 0) {
      text.textContent = 'Start';
    } else {
      var leg = haversine(points[index - 1], point);
      running += leg;
      text.textContent = formatDistance(leg) + ' · total ' + formatDistance(running);
    }

    var remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'measure-remove';
    remove.textContent = 'Remove';
    remove.setAttribute('aria-label', 'Remove point ' + (index + 1));
    remove.addEventListener('click', function () {
      removeAt(index);
    });

    li.append(num, text, remove);
    list.appendChild(li);
  });
}

function paintLegs() {
  var list = $('measure-legs');
  if (!list) {
    return;
  }
  if (list.children.length !== points.length) {
    renderLegs();
    return;
  }
  var running = 0;
  var i;
  for (i = 0; i < points.length; i++) {
    var text = list.children[i].querySelector('.measure-leg-text');
    if (!text) {
      continue;
    }
    if (i === 0) {
      text.textContent = 'Start';
      continue;
    }
    var leg = haversine(points[i - 1], points[i]);
    running += leg;
    text.textContent = formatDistance(leg) + ' · total ' + formatDistance(running);
  }
}

function paintNext() {
  var next = $('measure-next');
  if (!next) {
    return;
  }
  if (finished || !hover || draggingPoint || points.length === 0) {
    next.hidden = true;
    next.textContent = '';
    return;
  }
  var meters = haversine(points[points.length - 1], hover);
  if (meters < 1) {
    next.hidden = true;
    next.textContent = '';
    return;
  }
  next.hidden = false;
  next.textContent = 'Next leg ' + formatDistance(meters);
}

function paintReadout() {
  var total = $('measure-total');
  if (total) {
    total.textContent = formatDistance(points.length > 1 ? totalMeters() : 0);
  }
  paintLegs();
  paintButtons();
  paintNext();
}

function pinIcon(n) {
  return window.L.divIcon({
    className: 'measure-pin',
    html: '<span>' + n + '</span>',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
}

function hideRubber() {
  hover = null;
  if (rubber && map) {
    map.removeLayer(rubber);
    rubber = null;
  }
  paintNext();
}

/** Vertices along the great circle, so a long leg bends on the mercator map. */
function arcSteps(meters) {
  var delta = meters / 6371000;
  if (delta < 0.08) {
    return 1;
  }
  var n = Math.ceil(delta / 0.035);
  if (n < 8) {
    n = 8;
  }
  if (n > 160) {
    n = 160;
  }
  return n;
}

function geodesic(a, b) {
  var lat1 = a.lat * Math.PI / 180;
  var lon1 = a.lon * Math.PI / 180;
  var lat2 = b.lat * Math.PI / 180;
  var lon2 = b.lon * Math.PI / 180;
  var meters = haversine(a, b);
  var delta = meters / 6371000;
  var steps = arcSteps(meters);
  var sinDelta = Math.sin(delta);
  if (steps < 2 || delta < 1e-8 || Math.abs(sinDelta) < 1e-8) {
    return [[a.lat, a.lon], [b.lat, b.lon]];
  }
  var out = [];
  var i;
  for (i = 0; i <= steps; i++) {
    var f = i / steps;
    var A = Math.sin((1 - f) * delta) / sinDelta;
    var B = Math.sin(f * delta) / sinDelta;
    var x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
    var y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
    var z = A * Math.sin(lat1) + B * Math.sin(lat2);
    var lat = Math.atan2(z, Math.sqrt(x * x + y * y)) * 180 / Math.PI;
    var lon = Math.atan2(y, x) * 180 / Math.PI;
    out.push([lat, lon]);
  }
  return out;
}

function curvedLatLngs(path) {
  if (!path || path.length === 0) {
    return [];
  }
  if (path.length === 1) {
    return [[path[0].lat, path[0].lon]];
  }
  var segments = [];
  var current = [];
  function add(latlng) {
    if (current.length) {
      var jump = latlng[1] - current[current.length - 1][1];
      if (jump > 180 || jump < -180) {
        segments.push(current);
        current = [];
      }
    }
    current.push(latlng);
  }
  var i;
  var j;
  for (i = 1; i < path.length; i++) {
    var arc = geodesic(path[i - 1], path[i]);
    for (j = (current.length === 0 ? 0 : 1); j < arc.length; j++) {
      add(arc[j]);
    }
  }
  if (current.length) {
    segments.push(current);
  }
  if (segments.length === 1) {
    return segments[0];
  }
  return segments;
}

function paintLine() {
  var latlngs = curvedLatLngs(points);
  if (!line) {
    line = window.L.polyline(latlngs, {
      color: color,
      weight: 4,
      lineCap: 'round',
      lineJoin: 'round',
      smoothFactor: 0,
      interactive: false
    }).addTo(map);
    return;
  }
  line.setLatLngs(latlngs);
}

function rebuildMarkers() {
  var i;
  for (i = 0; i < markers.length; i++) {
    map.removeLayer(markers[i]);
  }
  markers = [];
  points.forEach(function (point, index) {
    var marker = window.L.marker([point.lat, point.lon], {
      icon: pinIcon(index + 1),
      draggable: true,
      autoPan: true,
      keyboard: false,
      title: 'Point ' + (index + 1) + '. Drag to move.'
    });
    marker.on('dragstart', function () {
      draggingPoint = true;
      suppressClick = true;
      hideRubber();
      marker.setZIndexOffset(1000);
    });
    marker.on('drag', function (event) {
      var ll = event.target.getLatLng();
      points[index] = { lat: ll.lat, lon: ll.lng };
      paintLine();
      paintReadout();
    });
    marker.on('dragend', function () {
      draggingPoint = false;
      persist();
      window.setTimeout(function () {
        suppressClick = false;
      }, 40);
    });
    marker.on('click', function (event) {
      window.L.DomEvent.stopPropagation(event);
      suppressClick = true;
      window.setTimeout(function () {
        suppressClick = false;
      }, 40);
    });
    marker.addTo(map);
    markers.push(marker);
  });
}

function refresh() {
  rebuildMarkers();
  paintLine();
  paintReadout();
  if (points.length === 0) {
    hideRubber();
  }
}

function persist() {
  if (!map) {
    return;
  }
  var center = map.getCenter();
  var payload = {
    points: points,
    view: {
      lat: center.lat,
      lon: center.lng,
      zoom: map.getZoom()
    },
    finished: finished
  };
  try {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload));
  } catch (err) {
    /* Private mode still keeps the line until the tab closes. */
  }
}

function cleanPoint(raw) {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  var lat = Number(raw.lat);
  var lon = Number(raw.lon);
  if (!isFinite(lat) || !isFinite(lon)) {
    return null;
  }
  if (Math.abs(lat) > 90 || Math.abs(lon) > 180) {
    return null;
  }
  return { lat: lat, lon: lon };
}

function restore() {
  var empty = { points: [], view: null, finished: false };
  try {
    var raw = window.sessionStorage.getItem(SESSION_KEY);
    if (!raw) {
      return empty;
    }
    var data = JSON.parse(raw);
    var saved = [];
    var list = data && Array.isArray(data.points) ? data.points : [];
    var i;
    for (i = 0; i < list.length && saved.length < MAX_POINTS; i++) {
      var point = cleanPoint(list[i]);
      if (point) {
        saved.push(point);
      }
    }
    var view = null;
    if (data && data.view && typeof data.view === 'object') {
      var lat = Number(data.view.lat);
      var lon = Number(data.view.lon);
      var zoom = Number(data.view.zoom);
      if (isFinite(lat) && isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180 && isFinite(zoom)) {
        if (zoom < 1) {
          zoom = 1;
        }
        if (zoom > 19) {
          zoom = 19;
        }
        view = { lat: lat, lon: lon, zoom: zoom };
      }
    }
    var done = saved.length >= 2;
    if (data && typeof data.finished === 'boolean') {
      done = data.finished;
    }
    return { points: saved, view: view, finished: done };
  } catch (err) {
    return empty;
  }
}

function addPoint(latlng) {
  var here = { lat: latlng.lat, lon: latlng.lng };
  var now = Date.now();
  if (points.length && now - lastAdd < 400) {
    if (haversine(points[points.length - 1], here) < 2) {
      return false;
    }
  }
  if (points.length >= MAX_POINTS) {
    setStatus('500 points is the limit. Remove one to add another.');
    return false;
  }
  lastAdd = now;
  points.push(here);
  finished = points.length === 2;
  refresh();
  if (finished) {
    hideRubber();
  }
  persist();
  setStatus('');
  return true;
}

function removeAt(index) {
  if (index < 0 || index >= points.length) {
    return;
  }
  points.splice(index, 1);
  if (points.length < 2) {
    finished = false;
  }
  refresh();
  persist();
  setStatus('');
}

function undo() {
  if (!points.length) {
    return;
  }
  points.pop();
  if (points.length < 2) {
    finished = false;
  }
  refresh();
  persist();
  setStatus('');
}

function clearAll() {
  points = [];
  finished = false;
  refresh();
  persist();
  setStatus('');
}

function fit() {
  if (!map || points.length === 0) {
    return;
  }
  if (points.length === 1) {
    map.setView([points[0].lat, points[0].lon], Math.max(map.getZoom(), 15));
    return;
  }
  var flat = [];
  function collect(item) {
    if (!item || !item.length) {
      return;
    }
    if (typeof item[0] === 'number') {
      flat.push(item);
      return;
    }
    var i;
    for (i = 0; i < item.length; i++) {
      collect(item[i]);
    }
  }
  collect(curvedLatLngs(points));
  mapShell.fitBounds(flat);
}

function finishLine() {
  if (finished || points.length === 0) {
    return;
  }
  finished = true;
  hideRubber();
  paintButtons();
  persist();
}

function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }
  return new Promise(function (resolve, reject) {
    var area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.left = '-9999px';
    document.body.appendChild(area);
    area.select();
    try {
      var ok = document.execCommand('copy');
      document.body.removeChild(area);
      if (ok) {
        resolve();
      } else {
        reject(new Error('copy'));
      }
    } catch (err) {
      document.body.removeChild(area);
      reject(err);
    }
  });
}

function markCopied() {
  var button = $('measure-copy');
  if (!button) {
    return;
  }
  button.textContent = 'Copied';
  if (copyTimer) {
    window.clearTimeout(copyTimer);
  }
  copyTimer = window.setTimeout(function () {
    button.textContent = 'Copy';
    copyTimer = 0;
  }, 1600);
}

function showGuide() {
  document.body.classList.remove('is-map');
  window.scrollTo(0, 0);
}

function showMap() {
  document.body.classList.add('is-map');
  window.scrollTo(0, 0);
  window.requestAnimationFrame(function () {
    mapShell.invalidate();
    window.requestAnimationFrame(function () {
      mapShell.invalidate();
    });
  });
}

function onMouseMove(event) {
  if (!map || draggingPoint || finished || points.length === 0) {
    hideRubber();
    return;
  }
  var last = points[points.length - 1];
  hover = { lat: event.latlng.lat, lon: event.latlng.lng };
  var latlngs = curvedLatLngs([last, hover]);
  if (!rubber) {
    rubber = window.L.polyline(latlngs, {
      color: color,
      weight: 3,
      dashArray: '7 8',
      opacity: 0.8,
      smoothFactor: 0,
      interactive: false
    }).addTo(map);
  } else {
    rubber.setLatLngs(latlngs);
  }
  paintNext();
}

function locate() {
  var button = $('measure-locate');
  if (!navigator.geolocation) {
    setStatus('Location is not available in this browser. Click the map instead.');
    return;
  }
  if (button) {
    button.disabled = true;
  }
  navigator.geolocation.getCurrentPosition(function (pos) {
    if (button) {
      button.disabled = false;
    }
    var added = addPoint({
      lat: pos.coords.latitude,
      lng: pos.coords.longitude
    });
    if (!added) {
      return;
    }
    fit();
    setStatus('Added your location.');
  }, function (err) {
    if (button) {
      button.disabled = false;
    }
    if (err && err.code === 1) {
      setStatus('Location blocked. Click the map instead.');
      return;
    }
    setStatus('Location unavailable. Click the map instead.');
  }, {
    enableHighAccuracy: true,
    timeout: 12000,
    maximumAge: 30000
  });
}

function bindDock() {
  var handle = $('measure-handle');
  if (!handle) {
    return;
  }
  applyDockHeight(uiState.load().measure.height, false);

  handle.addEventListener('pointerdown', function (event) {
    if (event.button != null && event.button !== 0) {
      return;
    }
    draggingDock = true;
    dockStartY = event.clientY;
    dockStartH = dockHeight;
    document.body.classList.add('is-resizing');
    if (handle.setPointerCapture) {
      handle.setPointerCapture(event.pointerId);
    }
    event.preventDefault();
  });

  handle.addEventListener('pointermove', function (event) {
    if (!draggingDock) {
      return;
    }
    applyDockHeight(dockStartH + (dockStartY - event.clientY), false);
  });

  function endDrag(event) {
    if (!draggingDock) {
      return;
    }
    draggingDock = false;
    document.body.classList.remove('is-resizing');
    if (handle.releasePointerCapture && event) {
      try {
        handle.releasePointerCapture(event.pointerId);
      } catch (err) {
        /* capture may already be gone */
      }
    }
    applyDockHeight(dockHeight, true);
  }

  handle.addEventListener('pointerup', endDrag);
  handle.addEventListener('pointercancel', endDrag);

  handle.addEventListener('keydown', function (event) {
    var step = event.shiftKey ? 40 : 16;
    if (event.key === 'ArrowUp') {
      applyDockHeight(dockHeight + step, true);
    } else if (event.key === 'ArrowDown') {
      applyDockHeight(dockHeight - step, true);
    } else {
      return;
    }
    event.preventDefault();
  });

  window.addEventListener('resize', function () {
    if (draggingDock) {
      return;
    }
    var next = clampDock(dockHeight);
    if (next !== dockHeight) {
      applyDockHeight(next, true);
      return;
    }
    handle.setAttribute('aria-valuemax', String(maxDock()));
  });
}

function bindKeys() {
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      if (!document.body.classList.contains('is-map')) {
        event.preventDefault();
        showMap();
        return;
      }
      if (!finished && points.length > 0) {
        event.preventDefault();
        finishLine();
      }
      return;
    }
    if (event.key !== 'Backspace' && event.key !== 'Delete') {
      return;
    }
    if (!document.body.classList.contains('is-map') || !points.length) {
      return;
    }
    var target = event.target;
    if (target && target.closest && target.closest('input, textarea, button, a, select, [role="separator"]')) {
      return;
    }
    event.preventDefault();
    undo();
  });
}

function boot() {
  color = readRouteColor();
  map = mapShell.init({ files: false, doubleClickZoom: false });
  map.getContainer().style.cursor = 'crosshair';

  var saved = restore();
  if (saved.view) {
    map.setView([saved.view.lat, saved.view.lon], saved.view.zoom);
  }
  if (saved.points.length) {
    points = saved.points;
    finished = !!saved.finished;
    refresh();
    if (!saved.view) {
      fit();
    }
  } else {
    paintReadout();
  }

  map.on('click', function (event) {
    if (suppressClick || draggingPoint) {
      return;
    }
    addPoint(event.latlng);
  });
  map.on('mousemove', onMouseMove);
  map.getContainer().addEventListener('mouseleave', hideRubber);
  map.on('moveend', persist);

  $('measure-undo').addEventListener('click', undo);
  $('measure-clear').addEventListener('click', clearAll);
  $('measure-fit').addEventListener('click', fit);
  $('measure-done').addEventListener('click', finishLine);
  $('measure-locate').addEventListener('click', locate);
  $('measure-copy').addEventListener('click', function () {
    if (points.length < 2) {
      return;
    }
    copyText(summaryText()).then(function () {
      markCopied();
      setStatus('');
    }, function () {
      setStatus('Could not copy. The total is shown above.');
    });
  });
  $('measure-guide').addEventListener('click', showGuide);
  var open = $('measure-open');
  if (open) {
    open.addEventListener('click', showMap);
  }

  paintUnits();
  bindUnits(function () {
    paintReadout();
  });
  bindDock();
  bindKeys();
  mapShell.invalidate();
}

boot();
