/**
 * GoPro GPS Extractor: the tool app (ES module). Glue only.
 *
 *   pick a file → parsers/gpmf.js → Track → map shell, graphs, stats,
 *   export, and (optionally) the video overlay.
 *
 * The file is read in the browser. It is not uploaded.
 * Page markup: tools/gopro-gps-extract/ (content.php, page.php) and
 * includes/layout/map-app.php.
 */
import * as fileDrop from '../core/file-drop.js';
import { buildTrack, fillMissingSpeed } from '../core/track.js';
import { exportTrack, stem } from '../core/exporters.js';
import * as mapShell from '../map/map-shell.js';
import * as trackLayer from '../map/track-layer.js';
import * as charts from '../map/track-charts.js';
import * as panels from '../map/panels.js';
import * as gpmf from '../parsers/gpmf.js';
import * as overlay from '../video/overlay.js';

var job = 0;
var token = { cancelled: false };
var track = null;

function acceptedFile(file) {
  if (!file) {
    return false;
  }
  var name = String(file.name || '');
  var dot = name.lastIndexOf('.');
  var ext = dot >= 0 ? name.slice(dot + 1).toLowerCase() : '';
  if (ext === 'mp4' || ext === 'lrv') {
    return true;
  }
  return String(file.type || '').slice(0, 6) === 'video/';
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

/** Swap the landing page for the full-screen map. */
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
  overlay.detach();
  if (!track) {
    mapShell.setEmpty(true);
  }
}

function clearTrack() {
  track = null;
  trackLayer.removeLayers();
  overlay.clearTrack();
  charts.clear();
  panels.setExportEnabled(false);
  panels.renderStats(null);
}

function samplePoints() {
  var start = Date.UTC(2026, 5, 21, 8, 30, 0);
  var points = [];
  var count = 90;
  var i;
  for (i = 0; i < count; i++) {
    var f = i / (count - 1);
    points.push({
      lat: 59.437 + Math.sin(f * Math.PI * 2) * 0.008,
      lon: 24.745 + f * 0.02,
      ele: 15 + Math.sin(f * Math.PI) * 55,
      speed: null,
      t: start + i * 4000
    });
  }
  fillMissingSpeed(points);
  return points;
}

function showTrack(id, points, name, acc) {
  if (id !== job) {
    return;
  }
  hideProgress();
  if (!points || !points.length) {
    clearTrack();
    overlay.detach();
    showError('No GPS track in this file. GPS has to be on in the camera while it records.');
    mapShell.setEmpty(true);
    return;
  }
  track = buildTrack(points, { name: name, acc: acc });
  clearError();
  enterTool();
  trackLayer.drawTrack(track);
  panels.renderStats(track);
  try {
    charts.renderTrack(track);
  } catch (err) {
    charts.markFailed();
  }
  panels.setExportEnabled(true);
  mapShell.setEmpty(false);
  charts.paintSeriesAvailability();
  overlay.setTrack(track);
}

function readFile(file, id, active) {
  gpmf.parse(file, {
    token: active,
    isCurrent: function () {
      return id === job;
    },
    onProgress: setProgress
  }).then(function (series) {
    if (id !== job || active.cancelled) {
      return;
    }
    setProgress(99, 'Drawing the track…');
    showTrack(id, series.points, stem(file.name), series.acc);
  }).catch(function (err) {
    if (id !== job) {
      return;
    }
    hideProgress();
    var message = gpmf.errorMessage(err);
    if (!message) {
      if (!track) {
        mapShell.setEmpty(true);
      }
      return;
    }
    clearTrack();
    overlay.detach();
    showError(message);
    mapShell.setEmpty(true);
  });
}

function onPickedFile(file) {
  var id = nextJob();
  clearError();
  overlay.detach();
  if (!acceptedFile(file)) {
    clearTrack();
    showError('Choose a GoPro video (.mp4 or .lrv).');
    mapShell.setEmpty(true);
    return;
  }
  overlay.attach(file);
  clearTrack();
  mapShell.setEmpty(false);
  var active = token;
  var label = file.size > 200 * 1024 * 1024
    ? 'Reading GPS from a large video…'
    : 'Reading GPS from the video…';
  setProgress(1, label);
  readFile(file, id, active);
}

function onSample() {
  var id = nextJob();
  clearError();
  overlay.detach();
  showName('Sample route');
  showTrack(id, samplePoints(), 'Sample route', []);
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
    '<p id="progress-label" role="status">Reading GPS from the video…</p>' +
    '<div id="progress-track" class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="Reading GPS from the video">' +
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
    overlay.refresh();
  });
  panels.bindExport(function (kind) {
    exportTrack(kind, track);
  });
  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') {
      return;
    }
    var box = document.getElementById('map-progress');
    if (!box || box.hidden) {
      overlay.closeMenu();
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
  document.addEventListener('gpstoolset:sample', onSample);
  var landingSample = document.getElementById('landing-sample');
  if (landingSample) {
    landingSample.addEventListener('click', function () {
      document.dispatchEvent(new CustomEvent('gpstoolset:sample'));
    });
  }
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
  charts.mountCharts('a video');
  panels.mount('a video');
  mountProgress();
  overlay.init();
  bindLandingDrop();
  bindUi();
  panels.paintUnits();
  var input = document.getElementById('file-input');
  if (input && !input.getAttribute('accept')) {
    input.setAttribute('accept', '.mp4,.lrv,video/*');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
