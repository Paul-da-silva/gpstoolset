/**
 * GoPro GPS Extractor (ES module).
 * Parses GPMF from a video, then hands one document to the shared viewer.
 * Video sync stays here. The map, charts, and export do not.
 * The file is read in the browser. It is not uploaded.
 */
import * as fileDrop from '../core/file-drop.js';
import { exportChoices } from '../core/formats.js';
import { buildExport } from '../core/exporters.js';
import { stash, take } from '../core/file-handoff.js';
import * as gpmf from '../parsers/gpmf.js';
import * as overlay from '../video/overlay.js';
import * as viewer from '../viewer/app.js';

var job = 0;
var token = { cancelled: false };

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
    hideProgress();
    if (!series || !series.points || !series.points.length) {
      viewer.clear();
      overlay.detach();
      showError('No GPS track in this file. GPS has to be on in the camera while it records.');
      return;
    }
    var name = file.name || 'video';
    viewer.open({
      name: name,
      segments: [{
        name: name,
        points: series.points,
        acc: series.acc || [],
        videoDuration: series.videoDuration
      }],
      waypoints: []
    }, name);
    overlay.setTrack(viewer.getTrack());
    clearError();
  }).catch(function (err) {
    if (id !== job) {
      return;
    }
    hideProgress();
    var message = gpmf.errorMessage(err);
    if (!message) {
      return;
    }
    viewer.clear();
    overlay.detach();
    showError(message);
  });
}

function onPickedFile(file) {
  var id = nextJob();
  clearError();
  overlay.detach();
  if (!acceptedFile(file)) {
    viewer.clear();
    showError('Choose a GoPro video (.mp4 or .lrv).');
    return;
  }
  overlay.attach(file);
  var active = token;
  var label = file.size > 200 * 1024 * 1024
    ? 'Reading GPS from a large video…'
    : 'Reading GPS from the video…';
  setProgress(1, label);
  readFile(file, id, active);
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

function bindEdit() {
  var link = document.getElementById('chip-edit');
  if (!link) {
    return;
  }
  link.addEventListener('click', function (event) {
    var doc = viewer.getDocument();
    var current = viewer.getTrack();
    if (!doc || !current || !current.points || !current.points.length) {
      return;
    }
    event.preventDefault();
    var built = buildExport('gpx', doc, current.meta && current.meta.name);
    if (!built) {
      return;
    }
    var file = new File([built.text], built.filename, { type: built.mime });
    stash(file, 'gpx-editor').then(function () {
      window.location.assign('/gpx-editor');
    }).catch(function (err) {
      showError((err && err.message) || 'Couldn’t open the editor. Download the GPX and open it there.');
    });
  });
}

function bindUi() {
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
  var landingCancel = document.getElementById('landing-cancel');
  if (landingCancel) {
    landingCancel.addEventListener('click', onCancel);
  }
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
  viewer.mount({
    noun: 'a video',
    exports: exportChoices(),
    onUnits: function () {
      overlay.refresh();
    }
  });
  mountProgress();
  overlay.init();
  bindLandingDrop();
  bindUi();
  bindEdit();
  var input = document.getElementById('file-input');
  if (input && !input.getAttribute('accept')) {
    input.setAttribute('accept', '.mp4,.lrv,video/*');
  }
  take('gopro-gps-extract').then(function (file) {
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
