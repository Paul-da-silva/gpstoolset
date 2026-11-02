/**
 * UI preferences for map tools.
 * Storage key is exactly gpstoolset.ui.v1.
 */
(function (global) {
  'use strict';

  var KEY = 'gpstoolset.ui.v1';
  var cache = null;

  function blank() {
    return {
      units: 'metric',
      graphs: {
        speed: { open: false, height: 180 },
        altitude: { open: false, height: 180 }
      },
      dock: { height: 180, tab: 'speed' },
      chips: { statsOpen: false, toolsOpen: false }
    };
  }

  function cleanHeight(value) {
    var n = Math.round(Number(value));
    if (!isFinite(n)) {
      return 180;
    }
    if (n < 120) {
      return 120;
    }
    if (n > 2000) {
      return 2000;
    }
    return n;
  }

  function sanitize(raw) {
    var next = blank();
    var data = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
    next.units = data.units === 'imperial' ? 'imperial' : 'metric';

    var graphs = data.graphs && typeof data.graphs === 'object' ? data.graphs : {};
    ['speed', 'altitude'].forEach(function (name) {
      var graph = graphs[name];
      if (!graph || typeof graph !== 'object') {
        return;
      }
      next.graphs[name].open = !!graph.open;
      next.graphs[name].height = cleanHeight(graph.height);
    });

    var dock = data.dock && typeof data.dock === 'object' ? data.dock : {};
    next.dock.height = cleanHeight(dock.height);
    next.dock.tab = dock.tab === 'altitude' ? 'altitude' : 'speed';

    var chips = data.chips && typeof data.chips === 'object' ? data.chips : {};
    next.chips.statsOpen = !!chips.statsOpen;
    next.chips.toolsOpen = !!chips.toolsOpen;
    return next;
  }

  function read() {
    try {
      var raw = global.localStorage.getItem(KEY);
      if (!raw) {
        return blank();
      }
      return sanitize(JSON.parse(raw));
    } catch (err) {
      return blank();
    }
  }

  function load() {
    if (!cache) {
      cache = read();
    }
    return cache;
  }

  function save() {
    var current = load();
    try {
      global.localStorage.setItem(KEY, JSON.stringify(current));
    } catch (err) {
      /* Private mode and full storage still keep the in-memory copy. */
    }
    return current;
  }

  function update(mutator) {
    var current = load();
    if (typeof mutator === 'function') {
      mutator(current);
    }
    return save();
  }

  global.GpsUiState = {
    key: KEY,
    load: load,
    save: save,
    update: update
  };
})(window);
