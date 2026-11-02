/**
 * GPX viewer and editor (ES module). Glue only.
 *
 *   pick a file → parsers/gpx.js → Track → the same map shell, graphs,
 *   stats, and export as the other viewers, plus the edit tools.
 *
 * The file is read in the browser. It is not uploaded.
 */
import * as fileDrop from '../core/file-drop.js';
import { buildTrack, fillMissingSpeed } from '../core/track.js';
import { download, exportTrack, stem, toGpxTracks } from '../core/exporters.js';
import {
  clonePoint, fixElevation, reversePoints, simplifyPoints, trimPoints
} from '../core/edit.js';
import * as mapShell from '../map/map-shell.js';
import * as trackLayer from '../map/track-layer.js?v=3';
import * as charts from '../map/track-charts.js';
import * as panels from '../map/panels.js';
import * as editTools from '../map/edit-tools.js';
import { parse } from '../parsers/gpx.js';
import { take } from '../core/file-handoff.js';

var job = 0;
var token = { cancelled: false };
var track = null;
var parts = [];
var active = 0;
var undo = [];
var waypoints = [];
var waypointLayer = null;
var fileLabel = '';
var previewFrame = 0;

function acceptedFile(file) {
  if (!file) {
    return false;
  }
  var name = String(file.name || '').toLowerCase();
  return name.slice(-4) === '.gpx';
}

function showName(name) {
  var openBtn = document.getElementById('chip-open');
  var nameEl = document.getElementById('file-name');
  var landingName = document.getElementById('landing-file');
  if (openBtn) {
    openBtn.textContent = 'Replace file';
  }
  if (nameEl) {
    nameEl.hidden = false;
    nameEl.textContent = name;
  }
  if (landingName) {
    landingName.hidden = false;
    landingName.textContent = name;
  }
}

function showError(message) {
  var ids = ['empty-error', 'landing-error'];
  var i;
  for (i = 0; i < ids.length; i++) {
    var el = document.getElementById(ids[i]);
    if (!el) {
      continue;
    }
    el.hidden = !message;
    el.textContent = message || '';
  }
}

function clearError() {
  showError('');
}

function applyProgress(boxId, barId, labelId, trackId, clamped, label) {
  var box = document.getElementById(boxId);
  var bar = document.getElementById(barId);
  var text = document.getElementById(labelId);
  var meter = document.getElementById(trackId);
  if (box) {
    box.hidden = false;
  }
  if (bar) {
    bar.style.width = clamped + '%';
  }
  if (text) {
    text.textContent = label ? label + ' ' + clamped + '%' : clamped + '%';
  }
  if (meter) {
    meter.setAttribute('aria-valuenow', String(clamped));
    if (label) {
      meter.setAttribute('aria-label', label);
    }
  }
}

function setProgress(pct, label) {
  var clamped = Math.max(0, Math.min(100, Math.round(pct)));
  applyProgress('map-progress', 'progress-bar', 'progress-label', 'progress-track', clamped, label);
  applyProgress('landing-progress', 'landing-progress-bar', 'landing-progress-label', 'landing-progress-track', clamped, label);
}

function hideProgress() {
  var ids = ['map-progress', 'landing-progress'];
  var i;
  for (i = 0; i < ids.length; i++) {
    var box = document.getElementById(ids[i]);
    if (box) {
      box.hidden = true;
    }
  }
}

function enterTool() {
  var landing = document.getElementById('tool-landing');
  if (!landing) {
    return;
  }
  var first = !document.body.classList.contains('is-map');
  document.body.classList.add('is-map');
  landing.hidden = true;
  var footer = document.querySelector('.site-footer');
  if (footer) {
    footer.hidden = true;
  }
  var app = document.getElementById('map-app');
  if (app) {
    app.hidden = false;
  }
  if (!mapShell.getMap()) {
    mapShell.init();
  }
  if (!first) {
    return;
  }
  window.scrollTo(0, 0);
  window.requestAnimationFrame(function () {
    mapShell.invalidate();
    window.requestAnimationFrame(function () {
      mapShell.invalidate();
      if (track) {
        trackLayer.drawTrack(track);
      }
      drawWaypoints();
      fitTrackAndMarks();
    });
  });
}

function nextJob() {
  job += 1;
  token.cancelled = true;
  token = { cancelled: false };
  hideProgress();
  return job;
}

function onCancel() {
  token.cancelled = true;
  job += 1;
  hideProgress();
  clearError();
  if (!track && !waypoints.length) {
    mapShell.setEmpty(true);
  }
}

function clearWaypoints() {
  var map = mapShell.getMap();
  if (waypointLayer && map) {
    map.removeLayer(waypointLayer);
  }
  waypointLayer = null;
}

function tooltipText(value) {
  return String(value || 'Waypoint')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function fitTrackAndMarks() {
  if (!window.L || !track || !waypoints.length) {
    return;
  }
  var bounds = window.L.latLngBounds(track.points.map(function (point) {
    return [point.lat, point.lon];
  }));
  var i;
  for (i = 0; i < waypoints.length; i++) {
    bounds.extend([waypoints[i].lat, waypoints[i].lon]);
  }
  mapShell.fitBounds(bounds, {
    paddingTopLeft: [40, 64],
    paddingBottomRight: [40, 88]
  });
}

function drawWaypoints() {
  clearWaypoints();
  var map = mapShell.getMap();
  if (!map || !window.L || !waypoints.length) {
    return;
  }
  waypointLayer = window.L.layerGroup();
  var i;
  for (i = 0; i < waypoints.length; i++) {
    var mark = waypoints[i];
    window.L.circleMarker([mark.lat, mark.lon], {
      radius: 5,
      color: '#115e59',
      weight: 2,
      fillColor: '#2dd4a0',
      fillOpacity: 1
    }).bindTooltip(tooltipText(mark.name), { direction: 'top' }).addTo(waypointLayer);
  }
  waypointLayer.addTo(map);
  if (!track) {
    var bounds = window.L.latLngBounds(waypoints.map(function (mark) {
      return [mark.lat, mark.lon];
    }));
    mapShell.fitBounds(bounds, {
      paddingTopLeft: [40, 64],
      paddingBottomRight: [40, 88]
    });
  } else {
    fitTrackAndMarks();
  }
}

function clearLoaded() {
  track = null;
  parts = [];
  active = 0;
  undo = [];
  waypoints = [];
  trackLayer.removeLayers();
  clearWaypoints();
  charts.clear();
  panels.setExportEnabled(false);
  panels.renderStats(null);
  editTools.setState({
    count: 0,
    parts: [],
    active: 0,
    canUndo: false,
    hasElevation: false,
    note: 'Open a GPX file to edit the track.'
  });
}

function hasElevation(points) {
  var i;
  for (i = 0; i < points.length; i++) {
    if (points[i].ele != null && isFinite(points[i].ele)) {
      return true;
    }
  }
  return false;
}

function partSummary() {
  return parts.map(function (part) {
    return { name: part.name, count: part.points.length };
  });
}

function displayLabel() {
  if (parts.length > 1 && parts[active]) {
    return fileLabel + ' · ' + parts[active].name;
  }
  return fileLabel;
}

function exportNote() {
  if (parts.length > 1) {
    var note = document.getElementById('export-note');
    if (note) {
      note.textContent = 'GPX saves every part. CSV and KML save the part you are viewing.';
    }
  }
}

function showActive(note) {
  var part = parts[active];
  var points = part ? part.points : [];
  hideProgress();
  clearError();
  enterTool();
  showName(displayLabel());
  if (points.length) {
    fillMissingSpeed(points);
    track = buildTrack(points, { name: part.name || fileLabel || 'track' });
    trackLayer.drawTrack(track);
    panels.renderStats(track);
    try {
      charts.renderTrack(track);
    } catch (err) {
      charts.markFailed();
    }
    panels.setExportEnabled(true);
    exportNote();
    mapShell.setEmpty(false);
    charts.paintSeriesAvailability();
  } else {
    track = null;
    trackLayer.removeLayers();
    charts.clear();
    panels.renderStats(null);
    panels.setExportEnabled(false);
    mapShell.setEmpty(!waypoints.length);
  }
  drawWaypoints();
  var idle = points.length
    ? 'Choose an edit. The track stays as it is until you apply it.'
    : 'This GPX has waypoints and no track to edit.';
  editTools.setState({
    count: points.length,
    parts: partSummary(),
    active: active,
    canUndo: undo.length > 0,
    hasElevation: hasElevation(points),
    note: note || idle
  });
}

function remember() {
  undo.push({
    active: active,
    parts: parts.map(function (part) {
      return {
        name: part.name,
        points: part.points.map(clonePoint)
      };
    })
  });
  if (undo.length > 30) {
    undo.shift();
  }
}

function replaceActive(nextPoints, note) {
  if (previewFrame) {
    window.cancelAnimationFrame(previewFrame);
    previewFrame = 0;
  }
  if (!nextPoints) {
    editTools.setNote(note || 'Nothing changed.');
    return;
  }
  remember();
  parts[active].points = nextPoints;
  showActive(note);
}

function loadParsed(parsed, label) {
  var base = stem(label);
  fileLabel = label || base;
  undo = [];
  active = 0;
  waypoints = parsed.waypoints || [];
  parts = (parsed.segments || []).map(function (seg, index) {
    var name = seg.name;
    if (!name) {
      name = parsed.segments.length > 1 ? 'Part ' + (index + 1) : base;
    }
    return {
      name: name,
      points: seg.points.map(clonePoint)
    };
  });
  if (!parts.length && !waypoints.length) {
    clearLoaded();
    showError('No track in this GPX file.');
    mapShell.setEmpty(true);
    return;
  }
  var note = '';
  if (parts.length > 1) {
    note = parts.length + ' parts. Choose one to edit. GPX export keeps them all.';
  }
  showActive(note);
}

function readFile(file, id, activeToken) {
  setProgress(15, 'Reading the GPX…');
  parse(file).then(function (parsed) {
    if (id !== job || activeToken.cancelled) {
      return;
    }
    setProgress(90, 'Drawing the track…');
    loadParsed(parsed, file.name);
  }).catch(function (err) {
    if (id !== job) {
      return;
    }
    hideProgress();
    clearLoaded();
    showError((err && err.message) || 'Couldn’t read that file.');
    mapShell.setEmpty(true);
  });
}

function onPickedFile(file) {
  var id = nextJob();
  clearError();
  if (!acceptedFile(file)) {
    clearLoaded();
    showError('Choose a GPX file (.gpx).');
    mapShell.setEmpty(true);
    return;
  }
  showName(file.name);
  clearLoaded();
  mapShell.setEmpty(false);
  readFile(file, id, token);
}

function queuePreview(run) {
  if (previewFrame) {
    window.cancelAnimationFrame(previewFrame);
  }
  previewFrame = window.requestAnimationFrame(function () {
    previewFrame = 0;
    run();
  });
}

function previewSimplify(meters) {
  queuePreview(function () {
    var part = parts[active];
    if (!part) {
      return;
    }
    if (!meters) {
      trackLayer.clearPreview();
      editTools.setSimplifyLabel('Off');
      return;
    }
    var next = simplifyPoints(part.points, meters);
    var kept = next ? next.length : part.points.length;
    editTools.setSimplifyLabel(kept + ' of ' + part.points.length + ' · ' + meters + ' m');
    if (!next) {
      trackLayer.clearPreview();
      return;
    }
    trackLayer.showPreview(next);
  });
}

function clearEditPreview() {
  if (previewFrame) {
    window.cancelAnimationFrame(previewFrame);
    previewFrame = 0;
  }
  trackLayer.clearPreview();
}

function previewTrim() {
  queuePreview(function () {
    var part = parts[active];
    if (!part) {
      return;
    }
    var start = document.getElementById('edit-trim-start');
    var end = document.getElementById('edit-trim-end');
    var next = trimPoints(part.points, start ? start.value : 0, end ? end.value : 0);
    if (!next) {
      trackLayer.clearPreview();
      return;
    }
    trackLayer.showPreview(next);
  });
}

function onSimplify(meters) {
  var part = parts[active];
  if (!part) {
    return;
  }
  if (!meters) {
    editTools.setNote('Move the slider off zero to simplify.');
    return;
  }
  var next = simplifyPoints(part.points, meters);
  if (!next) {
    trackLayer.clearPreview();
    editTools.setNote('Every point is already within ' + meters + ' m of a straight line.');
    return;
  }
  replaceActive(next, 'Simplified to ' + next.length + ' points, within ' + meters + ' m.');
}

function onTrim(start, end) {
  var part = parts[active];
  if (!part) {
    return;
  }
  var next = trimPoints(part.points, start, end);
  if (!next) {
    editTools.setNote(part.points.length < 3
      ? 'Trim needs at least three points.'
      : 'That range is already the whole track.');
    return;
  }
  replaceActive(next, 'Trimmed to ' + next.length + ' points.');
}

function onReverse() {
  var part = parts[active];
  if (!part) {
    return;
  }
  var next = reversePoints(part.points);
  if (!next) {
    return;
  }
  replaceActive(next, 'Reversed. The clock still runs forward along the new direction.');
}

function onElevation() {
  var part = parts[active];
  if (!part) {
    return;
  }
  var next = fixElevation(part.points);
  if (!next) {
    editTools.setNote(hasElevation(part.points)
      ? 'No elevation spikes or gaps to fix.'
      : 'This track has no elevation to fix.');
    return;
  }
  replaceActive(next, 'Fixed elevation spikes and short gaps from nearby points.');
}

function onUndo() {
  var previous = undo.pop();
  if (!previous) {
    return;
  }
  parts = previous.parts;
  active = previous.active;
  if (active >= parts.length) {
    active = 0;
  }
  showActive('Undone.');
}

function onSelectPart(index) {
  if (!parts[index] || index === active) {
    return;
  }
  active = index;
  showActive('Editing ' + parts[active].name + '.');
}

function onExport(kind) {
  if (!track) {
    return;
  }
  if (kind === 'gpx' && parts.length > 1) {
    download(
      stem(fileLabel) + '.gpx',
      'application/gpx+xml',
      toGpxTracks(parts, stem(fileLabel))
    );
    return;
  }
  exportTrack(kind, track);
}

function mountProgress() {
  if (document.getElementById('map-progress')) {
    return;
  }
  var stage = document.getElementById('map-stage');
  if (!stage) {
    return;
  }
  var box = document.createElement('div');
  box.id = 'map-progress';
  box.className = 'map-progress';
  box.hidden = true;
  box.innerHTML =
    '<p id="progress-label" role="status">Reading the GPX…</p>' +
    '<div id="progress-track" class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="Reading the GPX">' +
    '<div id="progress-bar" class="progress-bar"></div></div>' +
    '<button type="button" class="chip" id="progress-cancel">Cancel</button>';
  stage.appendChild(box);
  document.getElementById('progress-cancel').addEventListener('click', onCancel);
}

function bindUi() {
  panels.bindUnits(function () {
    panels.renderStats(track);
    if (track) {
      charts.renderTrack(track);
    }
  });
  panels.bindExport(onExport);
  editTools.bind({
    undo: onUndo,
    reverse: onReverse,
    elevation: onElevation,
    simplify: onSimplify,
    trim: onTrim,
    previewSimplify: previewSimplify,
    previewTrim: previewTrim,
    clearPreview: clearEditPreview,
    selectPart: onSelectPart
  });
  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') {
      return;
    }
    var box = document.getElementById('map-progress');
    if (!box || box.hidden) {
      return;
    }
    onCancel();
  });
  document.addEventListener('gpstoolset:file', function (event) {
    var file = event.detail && event.detail.file;
    if (file) {
      onPickedFile(file);
    }
  });
  var landingCancel = document.getElementById('landing-cancel');
  if (landingCancel) {
    landingCancel.addEventListener('click', onCancel);
  }
  document.addEventListener('gpstoolset:dock', function () {
    window.requestAnimationFrame(charts.resize);
  });
  ['speed', 'altitude', 'distance', 'time', 'verticalSpeed', 'gForce'].forEach(function (name) {
    var pane = document.getElementById('pane-' + name);
    if (pane) {
      pane.addEventListener('mouseleave', trackLayer.hideScrub);
    }
  });
}

function bindLandingDrop() {
  if (!document.getElementById('tool-landing') || fileDrop.isBound()) {
    return;
  }
  fileDrop.init({
    stage: '#tool-landing',
    overlay: '#landing-overlay',
    onFile: function (file) {
      document.dispatchEvent(new CustomEvent('gpstoolset:file', {
        detail: { file: file }
      }));
    }
  });
}

function init() {
  charts.mountCharts('a GPX file');
  panels.mount('a GPX file');
  mountProgress();
  bindLandingDrop();
  bindUi();
  panels.paintUnits();
  var input = document.getElementById('file-input');
  if (input && !input.getAttribute('accept')) {
    input.setAttribute('accept', '.gpx,application/gpx+xml');
  }
  take('gpx-viewer').then(function (file) {
    if (file) {
      onPickedFile(file);
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
