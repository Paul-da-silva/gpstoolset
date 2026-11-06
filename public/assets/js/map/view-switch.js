/**
 * Map | Video | 3D view switcher for the map shell.
 * Press-state and 3D lifecycle live here. GoPro owns video attach/detach
 * via registerVideo(); regular viewers only use Map | 3D.
 */
import * as uiState from '../core/ui-state.js';
import * as mapShell from './map-shell.js';
import * as track3d from './track-3d.js';

var mode = 'map';
var trackRef = null;
var videoAttached = false;
var bound = false;
var viewer3d = null;
var enterPending = null;

var videoHooks = {
  canEnter: null,
  onEnter: null,
  onLeave: null,
  pauseLeaving: null
};

function $(id) {
  return document.getElementById(id);
}

export function registerVideo(hooks) {
  videoHooks = Object.assign({
    canEnter: null,
    onEnter: null,
    onLeave: null,
    pauseLeaving: null
  }, hooks || {});
}

export function paint(active) {
  var mapBtn = $('view-map');
  var videoBtn = $('view-video');
  var btn3d = $('view-3d');
  if (mapBtn) {
    mapBtn.setAttribute('aria-pressed', active === 'map' ? 'true' : 'false');
  }
  if (videoBtn) {
    videoBtn.setAttribute('aria-pressed', active === 'video' ? 'true' : 'false');
  }
  if (btn3d) {
    btn3d.setAttribute('aria-pressed', active === '3d' ? 'true' : 'false');
  }
}

export function show(on) {
  var switcher = $('view-switch');
  if (switcher) {
    switcher.hidden = !on;
  }
}

function paintVideoButton() {
  var videoBtn = $('view-video');
  if (videoBtn) {
    videoBtn.hidden = !videoAttached;
  }
}

function syncVisibility() {
  paintVideoButton();
  show(!!trackRef);
}

function stop3d() {
  if (viewer3d) {
    viewer3d.stop();
  }
}

function dispose3d() {
  enterPending = null;
  if (viewer3d) {
    viewer3d.dispose();
    viewer3d = null;
  }
  var stage = $('track3d-stage');
  if (stage) {
    stage.hidden = true;
  }
}

function leave3dShell() {
  stop3d();
  var stage = $('track3d-stage');
  var app = $('map-app');
  if (stage) {
    stage.hidden = true;
  }
  if (app) {
    app.classList.remove('is-3d');
  }
}

function fail3dToMap() {
  enterPending = null;
  dispose3d();
  leave3dShell();
  mode = 'map';
  paint('map');
  var app = $('map-app');
  if (app) {
    app.classList.remove('is-3d');
    app.classList.remove('is-video');
  }
  mapShell.invalidate();
}

function enter3dShell() {
  var app = $('map-app');
  var stage = $('track3d-stage');
  var host = $('track3d-host');
  if (!app || !stage || !host || !trackRef) {
    return Promise.resolve(false);
  }
  app.classList.remove('is-video');
  app.classList.add('is-3d');
  stage.hidden = false;
  try {
    if (!viewer3d) {
      viewer3d = track3d.create(host);
    }
  } catch (err) {
    return Promise.resolve(false);
  }
  var pending = viewer3d.setTrack(trackRef).then(function () {
    if (mode !== '3d' || enterPending !== pending) {
      return false;
    }
    viewer3d.start();
    return true;
  }).catch(function () {
    return false;
  });
  enterPending = pending;
  return pending;
}

/**
 * Switch shell mode. persist writes ui-state.view when true.
 * Modes: 'map' | 'video' | '3d'.
 */
export function applyView(next, persist) {
  var want = next;
  if (want === 'video') {
    var can = videoAttached && (!videoHooks.canEnter || videoHooks.canEnter());
    if (!can) {
      want = 'map';
    }
  }
  if (want === '3d' && !trackRef) {
    want = 'map';
  }

  var prev = mode;

  if (prev === 'video' && want !== 'video') {
    if (typeof videoHooks.pauseLeaving === 'function') {
      videoHooks.pauseLeaving();
    }
    if (typeof videoHooks.onLeave === 'function') {
      videoHooks.onLeave();
    }
  }
  if (prev === '3d' && want !== '3d') {
    leave3dShell();
  }

  var app = $('map-app');
  if (want === 'video') {
    leave3dShell();
    if (app) {
      app.classList.add('is-video');
      app.classList.remove('is-3d');
    }
    if (typeof videoHooks.onEnter === 'function') {
      videoHooks.onEnter();
    }
    mode = want;
    paint(want);
    if (persist) {
      uiState.update(function (current) {
        current.view = want;
      });
    }
    return want;
  }

  if (want === '3d') {
    if (app) {
      app.classList.remove('is-video');
    }
    mode = '3d';
    paint('3d');
    enter3dShell().then(function (ok) {
      if (ok) {
        if (persist) {
          uiState.update(function (current) {
            current.view = '3d';
          });
        }
        return;
      }
      if (mode !== '3d') {
        return;
      }
      fail3dToMap();
    });
    return want;
  }

  if (app) {
    app.classList.remove('is-video');
    app.classList.remove('is-3d');
  }
  var stage3d = $('track3d-stage');
  if (stage3d) {
    stage3d.hidden = true;
  }
  stop3d();
  mapShell.invalidate();

  mode = want;
  paint(want);
  if (persist) {
    uiState.update(function (current) {
      current.view = want;
    });
  }
  return want;
}

export function setTrack(track) {
  trackRef = track && track.points && track.points.length ? track : null;
  syncVisibility();
  if (!trackRef) {
    dispose3d();
    if (mode === '3d') {
      applyView('map', false);
    }
    return;
  }
  if (viewer3d && mode === '3d') {
    enter3dShell().then(function (ok) {
      if (!ok && mode === '3d') {
        fail3dToMap();
      }
    });
  }
}

export function setVideoAttached(on) {
  videoAttached = !!on;
  syncVisibility();
  if (!videoAttached && mode === 'video') {
    applyView('map', false);
  }
}

/**
 * Restore a saved view after track (and optional video) are ready.
 */
export function restoreSaved() {
  var saved = uiState.load().view;
  var want = 'map';
  if (saved === '3d' && trackRef) {
    want = '3d';
  } else if (saved === 'video' && videoAttached) {
    want = 'video';
  }
  applyView(want, false);
}

export function clear() {
  trackRef = null;
  dispose3d();
  mode = 'map';
  paint('map');
  show(false);
  var app = $('map-app');
  if (app) {
    app.classList.remove('is-3d');
  }
  var stage = $('track3d-stage');
  if (stage) {
    stage.hidden = true;
  }
}

export function getMode() {
  return mode;
}

export function hasTrack() {
  return !!trackRef;
}

/** Bind switcher buttons once. Safe to call from viewer and GoPro. */
export function init() {
  if (bound) {
    return;
  }
  var switcher = $('view-switch');
  var mapBtn = $('view-map');
  var btn3d = $('view-3d');
  if (!switcher || !mapBtn || !btn3d) {
    return;
  }
  bound = true;
  paintVideoButton();
  mapBtn.addEventListener('click', function () {
    applyView('map', true);
  });
  var videoBtn = $('view-video');
  if (videoBtn) {
    videoBtn.addEventListener('click', function () {
      if (videoAttached) {
        applyView('video', true);
      }
    });
  }
  btn3d.addEventListener('click', function () {
    applyView('3d', true);
  });
}
