/**
 * Graph dock under the map (ES module). Open graphs shrink the map; they do not cover tiles.
 */
import * as uiState from '../core/ui-state.js';

var MIN = 120;
var state = null;
var dock = null;
var handle = null;
var dragging = false;
var startY = 0;
var startH = 0;

function isMobile() {
  return window.matchMedia('(max-width: 720px)').matches;
}

function maxHeight() {
  var ratio = isMobile() ? 0.4 : 0.45;
  var byRatio = Math.round(window.innerHeight * ratio);
  var header = document.querySelector('.topbar');
  var headerH = header ? header.offsetHeight : 0;
  var byRoom = window.innerHeight - headerH - 140;
  var max = Math.min(byRatio, byRoom);
  if (max < MIN) {
    max = MIN;
  }
  return max;
}

function clamp(height) {
  var n = Math.round(Number(height));
  if (!isFinite(n)) {
    n = 180;
  }
  if (n < MIN) {
    n = MIN;
  }
  var max = maxHeight();
  if (n > max) {
    n = max;
  }
  return n;
}

function isAvailable(name) {
  var chip = document.querySelector('[data-graph="' + name + '"]');
  if (chip && chip.getAttribute('data-available') === 'false') {
    return false;
  }
  return !!(state.graphs[name]);
}

function graphNames() {
  return Object.keys(state.graphs);
}

function anyOpen() {
  var names = graphNames();
  var i;
  for (i = 0; i < names.length; i++) {
    if (state.graphs[names[i]].open && isAvailable(names[i])) {
      return true;
    }
  }
  return false;
}

function firstOpen() {
  var names = graphNames();
  var i;
  for (i = 0; i < names.length; i++) {
    if (state.graphs[names[i]].open && isAvailable(names[i])) {
      return names[i];
    }
  }
  return 'speed';
}

function notify() {
  document.dispatchEvent(new CustomEvent('gpstoolset:dock'));
}

function shareHeight() {
  var height = clamp(state.dock.height);
  var names = graphNames();
  var i;
  state.dock.height = height;
  for (i = 0; i < names.length; i++) {
    state.graphs[names[i]].height = height;
  }
  return height;
}

function apply() {
  var open = anyOpen();
  if (!state.graphs[state.dock.tab]) {
    state.dock.tab = 'speed';
  }
  if (open && (!state.graphs[state.dock.tab].open || !isAvailable(state.dock.tab))) {
    state.dock.tab = firstOpen();
  }

  if (!open) {
    dock.hidden = true;
  } else {
    dock.hidden = false;
    dock.style.height = shareHeight() + 'px';
  }

  var tabs = dock.querySelectorAll('[data-dock-tab]');
  for (var i = 0; i < tabs.length; i++) {
    var name = tabs[i].getAttribute('data-dock-tab');
    var graph = state.graphs[name];
    var shown = !!(open && graph && graph.open && isAvailable(name));
    var active = shown && state.dock.tab === name;
    tabs[i].hidden = !shown;
    tabs[i].classList.toggle('is-active', active);
    tabs[i].setAttribute('aria-pressed', active ? 'true' : 'false');
    tabs[i].setAttribute('aria-selected', active ? 'true' : 'false');
  }

  var panes = dock.querySelectorAll('[data-pane]');
  for (var p = 0; p < panes.length; p++) {
    var paneName = panes[p].getAttribute('data-pane');
    var paneGraph = state.graphs[paneName];
    panes[p].hidden = !(open && paneGraph && paneGraph.open && isAvailable(paneName) && state.dock.tab === paneName);
  }

  var chips = document.querySelectorAll('[data-graph]');
  for (var c = 0; c < chips.length; c++) {
    var graph = chips[c].getAttribute('data-graph');
    var pressed = !!(state.graphs[graph] && state.graphs[graph].open);
    chips[c].classList.toggle('is-active', pressed);
    chips[c].setAttribute('aria-pressed', pressed ? 'true' : 'false');
  }

  if (handle) {
    handle.setAttribute('aria-valuemin', String(MIN));
    handle.setAttribute('aria-valuenow', String(state.dock.height));
    handle.setAttribute('aria-valuemax', String(maxHeight()));
  }

  notify();
}

function persist() {
  uiState.save();
}

export function toggle(name) {
  if (!state.graphs[name] || !isAvailable(name)) {
    return;
  }
  var graph = state.graphs[name];
  graph.open = !graph.open;
  if (graph.open) {
    state.dock.tab = name;
  }
  apply();
  persist();
}

export function setTab(name) {
  if (!state.graphs[name] || !isAvailable(name)) {
    return;
  }
  state.graphs[name].open = true;
  state.dock.tab = name;
  apply();
  persist();
}

function onPointerDown(event) {
  if (event.button != null && event.button !== 0) {
    return;
  }
  dragging = true;
  startY = event.clientY;
  startH = state.dock.height;
  document.body.classList.add('is-resizing');
  if (handle.setPointerCapture) {
    handle.setPointerCapture(event.pointerId);
  }
  event.preventDefault();
}

function onPointerMove(event) {
  if (!dragging) {
    return;
  }
  var next = clamp(startH + (startY - event.clientY));
  state.dock.height = next;
  dock.style.height = next + 'px';
  handle.setAttribute('aria-valuenow', String(next));
  notify();
}

function onPointerUp(event) {
  if (!dragging) {
    return;
  }
  dragging = false;
  document.body.classList.remove('is-resizing');
  if (handle.releasePointerCapture) {
    try {
      handle.releasePointerCapture(event.pointerId);
    } catch (err) {
      /* capture may already be gone */
    }
  }
  shareHeight();
  persist();
}

function onKey(event) {
  var step = event.shiftKey ? 40 : 16;
  if (event.key === 'ArrowUp') {
    state.dock.height = clamp(state.dock.height + step);
  } else if (event.key === 'ArrowDown') {
    state.dock.height = clamp(state.dock.height - step);
  } else {
    return;
  }
  event.preventDefault();
  apply();
  persist();
}

export function init() {
  dock = document.getElementById('graph-dock');
  handle = document.getElementById('dock-handle');
  if (!dock || !handle) {
    return;
  }
  state = uiState.load();

  var chips = document.querySelectorAll('[data-graph]');
  for (var i = 0; i < chips.length; i++) {
    chips[i].addEventListener('click', function (event) {
      toggle(event.currentTarget.getAttribute('data-graph'));
    });
  }

  var tabs = dock.querySelectorAll('[data-dock-tab]');
  for (var t = 0; t < tabs.length; t++) {
    tabs[t].addEventListener('click', function (event) {
      setTab(event.currentTarget.getAttribute('data-dock-tab'));
    });
  }

  handle.addEventListener('pointerdown', onPointerDown);
  handle.addEventListener('pointermove', onPointerMove);
  handle.addEventListener('pointerup', onPointerUp);
  handle.addEventListener('pointercancel', onPointerUp);
  handle.addEventListener('keydown', onKey);

  window.addEventListener('resize', function () {
    if (!anyOpen() || dragging) {
      return;
    }
    var next = clamp(state.dock.height);
    if (next === state.dock.height) {
      handle.setAttribute('aria-valuemax', String(maxHeight()));
      return;
    }
    state.dock.height = next;
    apply();
    persist();
  });

  apply();
}

export function refresh() {
  if (!dock) {
    return;
  }
  state = uiState.load();
  apply();
}
