/**
 * Shared editor (ES module). It only accepts a document:
 *   { name, segments: [{ name, points }], waypoints }
 * It does not detect a format, read a File, or import a parser.
 * The map and charts are the same modules the viewer uses.
 */
import { buildTrack, fillMissingSpeed } from '../core/track.js';
import {
  clonePoint, fixElevation, mergePoints, reversePoints, simplifyPoints,
  splitPoints, trimPoints
} from '../core/edit.js';
import { buildExport, saveBuilt } from '../core/exporters.js';
import * as mapShell from '../map/map-shell.js';
import * as trackLayer from '../map/track-layer.js';
import * as charts from '../map/track-charts.js';
import * as panels from '../map/panels.js';
import * as editTools from './edit-tools.js';

var parts = [];
var waypoints = [];
var active = 0;
var undo = [];
var track = null;
var fileLabel = '';
var previewFrame = 0;
var mounted = false;
var statusNote = '';

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

function showName(name) {
  var openBtn = document.getElementById('chip-open');
  var nameEl = document.getElementById('file-name');
  var landingName = document.getElementById('landing-file');
  if (openBtn) {
    openBtn.textContent = parts.length ? 'Add file' : 'Open file';
  }
  if (nameEl) {
    nameEl.hidden = !name;
    nameEl.textContent = name || '';
  }
  if (landingName) {
    landingName.hidden = !name;
    landingName.textContent = name || '';
  }
}

function enterTool() {
  var landing = document.getElementById('tool-landing');
  var first = !document.body.classList.contains('is-map');
  document.body.classList.add('is-map');
  if (landing) {
    landing.hidden = true;
  }
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
      paint(true);
    });
  });
}

function exportNote() {
  if (parts.length > 1) {
    return 'GPX, KML, and KMZ save every part. CSV saves the part you are viewing.';
  }
  return '';
}

function documentNow() {
  return {
    name: fileLabel || 'track',
    segments: parts,
    waypoints: waypoints
  };
}

function paint(refit) {
  var part = parts[active];
  var points = part ? part.points : [];
  showName(displayLabel());
  if (points.length) {
    fillMissingSpeed(points);
    track = buildTrack(points, { name: part.name || fileLabel || 'track' });
    trackLayer.drawTrack(track, { fit: false });
    panels.renderStats(track);
    try {
      charts.renderTrack(track);
    } catch (err) {
      charts.markFailed();
    }
    panels.setExportEnabled(true, exportNote());
    mapShell.setEmpty(false);
    charts.paintSeriesAvailability();
  } else {
    track = null;
    trackLayer.removeLayers();
    charts.clear();
    panels.renderStats(null);
    panels.setExportEnabled(!!(waypoints.length || parts.length), exportNote());
    mapShell.setEmpty(!waypoints.length);
  }
  trackLayer.drawMarks(waypoints);
  if (refit !== false && (points.length || waypoints.length)) {
    trackLayer.fitPoints(points, waypoints);
  }
  var idle = points.length
    ? 'Choose an edit. The track stays as it is until you apply it.'
    : 'This file has waypoints and no track to edit.';
  editTools.setState({
    count: points.length,
    parts: partSummary(),
    active: active,
    canUndo: undo.length > 0,
    canMerge: parts.filter(function (item) {
      return item.points && item.points.length;
    }).length >= 2,
    hasElevation: hasElevation(points),
    note: statusNote || idle
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
    }),
    waypoints: waypoints.map(function (mark) {
      return clonePoint(mark);
    })
  });
  if (undo.length > 30) {
    undo.shift();
  }
}

function show(note) {
  if (previewFrame) {
    window.cancelAnimationFrame(previewFrame);
    previewFrame = 0;
  }
  trackLayer.clearPreview();
  if (note) {
    statusNote = note;
  }
  enterTool();
  paint(true);
}

function segmentsFrom(next) {
  var list = [];
  var segments = next && next.segments ? next.segments : [];
  var i;
  for (i = 0; i < segments.length; i++) {
    var seg = segments[i];
    var points = (seg.points || []).map(clonePoint);
    if (!points.length) {
      continue;
    }
    list.push({
      name: seg.name || ('Part ' + (list.length + 1)),
      points: points
    });
  }
  return list;
}

export function hasDocument() {
  return parts.length > 0 || waypoints.length > 0;
}

/** Replace the open document. */
export function open(next, label) {
  parts = segmentsFrom(next);
  waypoints = (next && next.waypoints ? next.waypoints : []).map(clonePoint);
  active = 0;
  undo = [];
  fileLabel = label || (next && next.name) || 'track';
  show(parts.length > 1
    ? parts.length + ' parts. Choose one to edit. A download of GPX, KML, or KMZ keeps them all.'
    : '');
}

/** Append another document's tracks. */
export function add(next) {
  var extra = segmentsFrom(next);
  var marks = (next && next.waypoints ? next.waypoints : []).map(clonePoint);
  if (!extra.length && !marks.length) {
    editTools.setNote('That file has nothing to add.');
    return;
  }
  remember();
  var i;
  for (i = 0; i < extra.length; i++) {
    parts.push(extra[i]);
  }
  for (i = 0; i < marks.length; i++) {
    waypoints.push(marks[i]);
  }
  if (extra.length) {
    active = parts.length - extra.length;
  }
  show('Added ' + (extra.length || marks.length) + ' from the new file.');
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
  show(note);
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

function previewSplit() {
  queuePreview(function () {
    var part = parts[active];
    var slider = document.getElementById('edit-split');
    if (!part || !slider) {
      return;
    }
    var halves = splitPoints(part.points, slider.value);
    if (!halves) {
      trackLayer.clearPreview();
      return;
    }
    trackLayer.showPreview(halves[0]);
  });
}

function clearEditPreview() {
  if (previewFrame) {
    window.cancelAnimationFrame(previewFrame);
    previewFrame = 0;
  }
  trackLayer.clearPreview();
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

function onMerge() {
  var next = mergePoints(parts);
  if (!next) {
    editTools.setNote('Add another track before merging.');
    return;
  }
  remember();
  parts = [{ name: fileLabel || 'Merged', points: next }];
  active = 0;
  show('Merged into one track.');
}

function onSplit(index) {
  var part = parts[active];
  if (!part) {
    return;
  }
  var halves = splitPoints(part.points, index);
  if (!halves) {
    editTools.setNote('Split needs at least four points, with two on each side.');
    return;
  }
  remember();
  var name = part.name || 'Track';
  parts.splice(active, 1, {
    name: name + ' A',
    points: halves[0]
  }, {
    name: name + ' B',
    points: halves[1]
  });
  show('Split into two tracks.');
}

function onUndo() {
  var previous = undo.pop();
  if (!previous) {
    return;
  }
  parts = previous.parts;
  waypoints = previous.waypoints || waypoints;
  active = previous.active;
  if (active >= parts.length) {
    active = 0;
  }
  show('Undone.');
}

function onSelectPart(index) {
  if (!parts[index] || index === active) {
    return;
  }
  active = index;
  show('Editing ' + parts[active].name + '.');
}

function onExport(kind) {
  var built = buildExport(kind, documentNow(), fileLabel, parts[active] ? parts[active].points : []);
  saveBuilt(built);
}

/** Prepare the map chrome once. exports is [{ id, label }]. */
export function mount(options) {
  if (mounted) {
    return;
  }
  mounted = true;
  var opts = options || {};
  charts.mountCharts(opts.noun || 'a file');
  panels.mount(opts.noun || 'a file', opts.exports);
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
    merge: onMerge,
    split: onSplit,
    previewSimplify: previewSimplify,
    previewTrim: previewTrim,
    previewSplit: previewSplit,
    clearPreview: clearEditPreview,
    selectPart: onSelectPart
  });
  panels.paintUnits();
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
