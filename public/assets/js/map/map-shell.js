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

/**
 * File name in the control column.
 * mode is "open" (no file), "replace", or "add".
 */
export function setFileName(name, mode) {
  var openBtn = document.getElementById('chip-open');
  var nameEl = document.getElementById('file-name');
  var kind = mode === 'add' || mode === 'replace' ? mode : 'open';
  if (openBtn) {
    var label = kind === 'add' ? 'Add file' : (kind === 'replace' ? 'Replace file' : 'Open file');
    openBtn.setAttribute('aria-label', label);
    openBtn.title = label;
    openBtn.classList.toggle('is-replace', kind === 'replace');
    openBtn.classList.toggle('is-add', kind === 'add');
  }
  if (nameEl) {
    var text = name ? String(name) : '';
    nameEl.hidden = text === '';
    nameEl.textContent = text;
    if (text) {
      nameEl.title = text;
    } else {
      nameEl.removeAttribute('title');
    }
  }
}

function onFile(file) {
  setFileName(file && file.name, file ? 'replace' : 'open');
  setEmpty(false);
  document.dispatchEvent(new CustomEvent('gpstoolset:file', {
    detail: { file: file }
  }));
}

var popovers = [];

function bindPopover(buttonId, panelId, persistKey) {
  var button = document.getElementById(buttonId);
  var panel = document.getElementById(panelId);
  if (!button || !panel) {
    return;
  }

  var entry = { button: button, panel: panel, persistKey: persistKey };

  function paint(open) {
    panel.hidden = !open;
    button.classList.toggle('is-active', open);
    button.setAttribute('aria-pressed', open ? 'true' : 'false');
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  entry.paint = paint;
  popovers.push(entry);

  if (persistKey) {
    paint(!!uiState.load().chips[persistKey]);
  }

  button.addEventListener('click', function () {
    var open = panel.hidden;
    var i;
    if (open) {
      for (i = 0; i < popovers.length; i++) {
        var other = popovers[i];
        if (other === entry || other.panel.hidden) {
          continue;
        }
        other.paint(false);
        if (other.persistKey) {
          uiState.update(function (current) {
            current.chips[other.persistKey] = false;
          });
        }
      }
    }
    paint(open);
    if (persistKey) {
      uiState.update(function (current) {
        current.chips[persistKey] = open;
      });
    }
  });
}

function bindGraphs() {
  var button = document.getElementById('chip-graphs');
  if (!button) {
    return;
  }
  function paint() {
    var open = graphDock.isOpen();
    button.classList.toggle('is-active', open);
    button.setAttribute('aria-pressed', open ? 'true' : 'false');
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  document.addEventListener('gpstoolset:dock', paint);
  button.addEventListener('click', function () {
    graphDock.toggleOpen();
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

function createMap(options) {
  var el = document.getElementById('map');
  var opts = options || {};
  if (!el || !window.L) {
    throw new Error('Leaflet is required before the map shell starts.');
  }

  map = window.L.map(el, {
    attributionControl: true,
    zoomControl: true,
    scrollWheelZoom: true,
    doubleClickZoom: opts.doubleClickZoom !== false
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

/**
 * Start the map. options.files === false skips file drop and the
 * track popovers (a tool with no file, such as measure distance).
 * options.doubleClickZoom === false leaves double-click for the tool.
 */
export function init(options) {
  if (ready || map) {
    return map;
  }
  var opts = options || {};
  if (opts.files !== false) {
    bindPopover('chip-stats', 'stats-panel', 'statsOpen');
    bindPopover('chip-edit', 'edit-panel', 'toolsOpen');
    bindPopover('chip-export', 'export-panel', null);
    bindGraphs();
    graphDock.init();
    if (fileDrop.isBound()) {
      fileDrop.addStage('#map-stage', '#file-overlay');
    } else {
      fileDrop.init({ onFile: onFile });
    }
  }
  createMap(opts);
  flush();
  return map;
}

/** The Leaflet map, or null until init() has run. */
export function getMap() {
  return map;
}
