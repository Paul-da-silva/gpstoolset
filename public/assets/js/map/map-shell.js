/**
 * Full-screen map page (ES module). Tile layers come from tiles.js only.
 */
import * as uiState from '../core/ui-state.js';
import * as fileDrop from '../core/file-drop.js';
import * as graphDock from './graph-dock.js';
import { createTileLayer } from './tiles.js';

var map = null;
var ready = false;
var waiters = [];
var resizeFrame = 0;

export function setEmpty(show) {
  var empty = document.getElementById('empty-state');
  if (empty) {
    empty.hidden = !show;
  }
}

function setFileLabel(file) {
  var openBtn = document.getElementById('chip-open');
  var nameEl = document.getElementById('file-name');
  if (openBtn) {
    openBtn.textContent = 'Replace file';
  }
  if (nameEl && file) {
    nameEl.hidden = false;
    nameEl.textContent = file.name;
  }
}

function onFile(file) {
  setFileLabel(file);
  setEmpty(false);
  document.dispatchEvent(new CustomEvent('gpstoolset:file', {
    detail: { file: file }
  }));
}

function bindPopover(buttonId, panelId, persistKey) {
  var button = document.getElementById(buttonId);
  var panel = document.getElementById(panelId);
  if (!button || !panel) {
    return;
  }

  function paint(open) {
    panel.hidden = !open;
    button.classList.toggle('is-active', open);
    button.setAttribute('aria-pressed', open ? 'true' : 'false');
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  if (persistKey) {
    paint(!!uiState.load().chips[persistKey]);
  }

  button.addEventListener('click', function () {
    var open = panel.hidden;
    paint(open);
    if (persistKey) {
      uiState.update(function (current) {
        current.chips[persistKey] = open;
      });
    }
  });
}

function bindSample() {
  var sample = document.getElementById('chip-sample');
  if (!sample) {
    return;
  }
  sample.addEventListener('click', function () {
    document.dispatchEvent(new CustomEvent('gpstoolset:sample'));
  });
}

export function invalidate() {
  if (!map) {
    return;
  }
  if (resizeFrame) {
    return;
  }
  resizeFrame = window.requestAnimationFrame(function () {
    resizeFrame = 0;
    map.invalidateSize();
  });
}

export function fitBounds(target, options) {
  if (!map || target == null) {
    return;
  }
  var bounds = target;
  if (Array.isArray(target)) {
    bounds = window.L.latLngBounds(target);
  }
  if (!bounds || typeof bounds.isValid !== 'function' || !bounds.isValid()) {
    return;
  }
  var pad = { maxZoom: 16 };
  var hasPad = options && (
    options.padding != null ||
    options.paddingTopLeft != null ||
    options.paddingBottomRight != null
  );
  if (!hasPad) {
    pad.padding = [40, 40];
  }
  if (options) {
    Object.keys(options).forEach(function (key) {
      pad[key] = options[key];
    });
  }
  map.fitBounds(bounds, pad);
}

function createMap() {
  var el = document.getElementById('map');
  if (!el || !window.L) {
    throw new Error('Leaflet is required before the map shell starts.');
  }

  map = window.L.map(el, {
    attributionControl: true,
    zoomControl: true,
    scrollWheelZoom: true
  });

  createTileLayer(window.L).addTo(map);
  map.setView([20, 0], 2);

  var stage = document.getElementById('map-stage');
  if (stage && typeof window.ResizeObserver === 'function') {
    var observer = new window.ResizeObserver(function () {
      invalidate();
    });
    observer.observe(stage);
  }

  document.addEventListener('gpstoolset:dock', invalidate);
  window.addEventListener('resize', invalidate);
  invalidate();
}

function flush() {
  ready = true;
  var pending = waiters.slice();
  waiters.length = 0;
  pending.forEach(function (fn) {
    fn(map);
  });
  document.dispatchEvent(new CustomEvent('gpstoolset:mapready'));
}

export function onReady(fn) {
  if (typeof fn !== 'function') {
    return;
  }
  if (ready && map) {
    fn(map);
    return;
  }
  waiters.push(fn);
}

export function init() {
  if (ready || map) {
    return map;
  }
  bindPopover('chip-stats', 'stats-panel', 'statsOpen');
  bindPopover('chip-graphs', 'graphs-panel', 'graphsOpen');
  bindPopover('chip-export', 'export-panel', null);
  bindSample();
  graphDock.init();
  if (fileDrop.isBound()) {
    fileDrop.addStage('#map-stage', '#file-overlay');
  } else {
    fileDrop.init({ onFile: onFile });
  }
  createMap();
  flush();
  return map;
}

/** The Leaflet map, or null until init() has run. */
export function getMap() {
  return map;
}
