/**
 * Shared viewer (ES module). It only accepts a document:
 *   { name, segments: [{ name, points, acc? }], waypoints }
 * It does not detect a format, read a File, or import a parser.
 * Map, charts, and the dock come from the shared map modules.
 */
import { buildTrack, fillMissingSpeed } from '../core/track.js';
import { buildExport, saveBuilt, stem } from '../core/exporters.js';
import * as mapShell from '../map/map-shell.js';
import * as trackLayer from '../map/track-layer.js';
import * as charts from '../map/track-charts.js';
import * as panels from '../map/panels.js';

var doc = null;
var fileLabel = '';
var active = 0;
var track = null;
var mounted = false;
var onUnits = null;

function segmentAt(index) {
  if (!doc || !doc.segments || !doc.segments[index]) {
    return null;
  }
  return doc.segments[index];
}

function activePoints() {
  var seg = segmentAt(active);
  return seg && seg.points ? seg.points : [];
}

function showName(name) {
  mapShell.setFileName(name, name ? 'replace' : 'open');
  var landingName = document.getElementById('landing-file');
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
      paintMap(true);
    });
  });
}

function exportNote() {
  if (doc && doc.segments && doc.segments.length > 1) {
    return 'GPX, KML, and KMZ save every part. CSV saves the part you are viewing.';
  }
  return '';
}

function paintParts() {
  var box = document.getElementById('track-parts');
  if (!box) {
    return;
  }
  box.textContent = '';
  var segments = doc && doc.segments ? doc.segments : [];
  if (segments.length < 2) {
    box.hidden = true;
    return;
  }
  box.hidden = false;
  var i;
  for (i = 0; i < segments.length; i++) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'chip';
    button.setAttribute('data-part', String(i));
    button.setAttribute('aria-pressed', i === active ? 'true' : 'false');
    if (i === active) {
      button.classList.add('is-active');
    }
    var count = segments[i].points ? segments[i].points.length : 0;
    button.textContent = segments[i].name + ' (' + count + ')';
    box.appendChild(button);
  }
}

function paintMap(refit) {
  var points = activePoints();
  var waypoints = doc && doc.waypoints ? doc.waypoints : [];
  if (points.length) {
    var seg = segmentAt(active);
    fillMissingSpeed(points);
    track = buildTrack(points, {
      name: (seg && seg.name) || fileLabel || 'track',
      acc: seg && seg.acc ? seg.acc : [],
      videoDuration: seg && seg.videoDuration
    });
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
    panels.setExportEnabled(!!waypoints.length, exportNote());
    mapShell.setEmpty(!waypoints.length);
  }
  trackLayer.drawMarks(waypoints);
  if (refit !== false && (points.length || waypoints.length)) {
    trackLayer.fitPoints(points, waypoints);
  }
  paintParts();
}

function onExport(kind) {
  if (!doc) {
    return;
  }
  var built = buildExport(kind, doc, fileLabel || doc.name, activePoints());
  saveBuilt(built);
}

/**
 * Prepare charts, export, and the dock. Call once, before open().
 * options: { noun, exports: [{ id, label }], onUnits }
 */
export function mount(options) {
  if (mounted) {
    return;
  }
  mounted = true;
  var opts = options || {};
  onUnits = opts.onUnits;
  charts.mountCharts(opts.noun || 'a file');
  panels.mount(opts.noun || 'a file', opts.exports);
  panels.bindUnits(function () {
    panels.renderStats(track);
    if (track) {
      charts.renderTrack(track);
    }
    trackLayer.refreshTip();
    if (typeof onUnits === 'function') {
      onUnits();
    }
  });
  panels.bindExport(onExport);
  panels.paintUnits();
  document.addEventListener('gpstoolset:dock', function () {
    window.requestAnimationFrame(charts.resize);
  });
  ['speed', 'altitude', 'distance', 'time', 'heartRate', 'verticalSpeed', 'gForce'].forEach(function (name) {
    var pane = document.getElementById('pane-' + name);
    if (pane) {
      pane.addEventListener('mouseleave', trackLayer.hideScrub);
    }
  });
  var parts = document.getElementById('track-parts');
  if (parts) {
    parts.addEventListener('click', function (event) {
      var node = event.target;
      while (node && node !== parts) {
        if (node.getAttribute && node.getAttribute('data-part') != null) {
          var index = Number(node.getAttribute('data-part'));
          if (doc && doc.segments && doc.segments[index] && index !== active) {
            active = index;
            paintMap(true);
          }
          return;
        }
        node = node.parentNode;
      }
    });
  }
}

/** Show a document. fileLabel is the name in the top bar. */
export function open(next, label) {
  doc = next || { name: 'track', segments: [], waypoints: [] };
  fileLabel = label || doc.name || 'track';
  active = 0;
  var segments = doc.segments || [];
  var i;
  for (i = 0; i < segments.length; i++) {
    if (segments[i].points && segments[i].points.length) {
      active = i;
      break;
    }
  }
  showName(fileLabel);
  enterTool();
  paintMap(true);
  return track;
}

export function clear() {
  doc = null;
  track = null;
  active = 0;
  fileLabel = '';
  showName('');
  paintParts();
  if (!mapShell.getMap()) {
    return;
  }
  trackLayer.removeLayers();
  charts.clear();
  panels.renderStats(null);
  panels.setExportEnabled(false);
  mapShell.setEmpty(true);
}

export function getTrack() {
  return track;
}

export function getDocument() {
  return doc;
}

export function fileStem() {
  return stem(fileLabel || (doc && doc.name) || 'track');
}
