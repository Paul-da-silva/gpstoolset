/**
 * Graph dock under the map. Open graphs shrink the map; they do not cover tiles.
 */
(function (global) {
  'use strict';

  var MIN = 120;
  var state = null;
  var dock = null;
  var handle = null;
  var dragging = false;
  var startY = 0;
  var startH = 0;

  function isMobile() {
    return global.matchMedia('(max-width: 720px)').matches;
  }

  function maxHeight() {
    var ratio = isMobile() ? 0.4 : 0.45;
    var byRatio = Math.round(global.innerHeight * ratio);
    var header = document.querySelector('.topbar');
    var headerH = header ? header.offsetHeight : 0;
    var byRoom = global.innerHeight - headerH - 140;
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

  function anyOpen() {
    return !!(state.graphs.speed.open || state.graphs.altitude.open);
  }

  function notify() {
    document.dispatchEvent(new CustomEvent('gpstoolset:dock'));
  }

  function apply() {
    var open = anyOpen();
    if (state.dock.tab !== 'speed' && state.dock.tab !== 'altitude') {
      state.dock.tab = 'speed';
    }
    if (open && !state.graphs[state.dock.tab].open) {
      state.dock.tab = state.graphs.speed.open ? 'speed' : 'altitude';
    }

    if (!open) {
      dock.hidden = true;
    } else {
      state.dock.height = clamp(state.dock.height);
      state.graphs[state.dock.tab].height = state.dock.height;
      dock.hidden = false;
      dock.style.height = state.dock.height + 'px';
    }

    var tabs = dock.querySelectorAll('[data-dock-tab]');
    for (var i = 0; i < tabs.length; i++) {
      var name = tabs[i].getAttribute('data-dock-tab');
      var active = open && state.dock.tab === name;
      tabs[i].hidden = !state.graphs[name].open;
      tabs[i].classList.toggle('is-active', active);
      tabs[i].setAttribute('aria-pressed', active ? 'true' : 'false');
      tabs[i].setAttribute('aria-selected', active ? 'true' : 'false');
    }

    var panes = dock.querySelectorAll('[data-pane]');
    for (var p = 0; p < panes.length; p++) {
      var paneName = panes[p].getAttribute('data-pane');
      panes[p].hidden = !(open && state.dock.tab === paneName);
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
    global.GpsUiState.save();
  }

  function toggle(name) {
    if (!state.graphs[name]) {
      return;
    }
    var graph = state.graphs[name];
    graph.open = !graph.open;
    if (graph.open) {
      state.dock.tab = name;
      state.dock.height = clamp(graph.height || state.dock.height);
    }
    apply();
    persist();
  }

  function setTab(name) {
    if (!state.graphs[name]) {
      return;
    }
    state.graphs[name].open = true;
    state.dock.tab = name;
    state.dock.height = clamp(state.graphs[name].height || state.dock.height);
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
    state.graphs[state.dock.tab].height = next;
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
    state.graphs[state.dock.tab].height = state.dock.height;
    apply();
    persist();
  }

  function init() {
    dock = document.getElementById('graph-dock');
    handle = document.getElementById('dock-handle');
    if (!dock || !handle || !global.GpsUiState) {
      return;
    }
    state = global.GpsUiState.load();

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

    global.addEventListener('resize', function () {
      if (!anyOpen() || dragging) {
        return;
      }
      var next = clamp(state.dock.height);
      if (next === state.dock.height) {
        handle.setAttribute('aria-valuemax', String(maxHeight()));
        return;
      }
      state.dock.height = next;
      state.graphs[state.dock.tab].height = next;
      apply();
      persist();
    });

    apply();
  }

  global.GpsGraphDock = {
    init: init,
    toggle: toggle,
    setTab: setTab
  };
})(window);
