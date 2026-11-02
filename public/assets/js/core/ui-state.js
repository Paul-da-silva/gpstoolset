/**
 * UI preferences for map tools (ES module).
 * Storage key is exactly gpstoolset.ui.v1.
 */
export var KEY = 'gpstoolset.ui.v1';
var cache = null;

function blankOverlay() {
  return {
    miniMap: true,
    speed: true,
    altitude: true,
    distance: true,
    time: true,
    gForce: false,
    verticalSpeed: false
  };
}

var GRAPH_NAMES = ['speed', 'altitude', 'distance', 'time', 'gForce', 'verticalSpeed'];

function blankGraphs() {
  var graphs = {};
  GRAPH_NAMES.forEach(function (name) {
    graphs[name] = { open: false, height: 180 };
  });
  return graphs;
}

function blankMiniMap() {
  return { x: null, y: null, w: null, h: null };
}

function blankMeasure() {
  return { height: 300 };
}

function blank() {
  return {
    units: 'metric',
    graphs: blankGraphs(),
    dock: { height: 180, tab: 'speed' },
    measure: blankMeasure(),
    chips: { statsOpen: false, toolsOpen: false, graphsOpen: false },
    view: 'map',
    metricsLayout: 'row',
    videoOverlay: blankOverlay(),
    videoMiniMap: blankMiniMap()
  };
}

function cleanFraction(value) {
  var n = Number(value);
  if (!isFinite(n)) {
    return null;
  }
  if (n < 0) {
    return 0;
  }
  if (n > 1) {
    return 1;
  }
  return n;
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
  GRAPH_NAMES.forEach(function (name) {
    var graph = graphs[name];
    if (!graph || typeof graph !== 'object') {
      return;
    }
    next.graphs[name].open = !!graph.open;
    next.graphs[name].height = cleanHeight(graph.height);
  });

  var dock = data.dock && typeof data.dock === 'object' ? data.dock : {};
  next.dock.height = cleanHeight(dock.height);
  next.dock.tab = GRAPH_NAMES.indexOf(dock.tab) === -1 ? 'speed' : dock.tab;

  var measure = data.measure && typeof data.measure === 'object' ? data.measure : {};
  var measureHeight = measure.height == null ? 300 : measure.height;
  next.measure.height = cleanHeight(measureHeight);

  var chips = data.chips && typeof data.chips === 'object' ? data.chips : {};
  next.chips.statsOpen = !!chips.statsOpen;
  next.chips.toolsOpen = !!chips.toolsOpen;
  next.chips.graphsOpen = !!chips.graphsOpen;

  var box = data.videoMiniMap && typeof data.videoMiniMap === 'object' ? data.videoMiniMap : {};
  var mx = cleanFraction(box.x);
  var my = cleanFraction(box.y);
  var mw = cleanFraction(box.w);
  var mh = cleanFraction(box.h);
  if (mx != null && my != null && mw != null && mh != null && mw >= 0.05 && mh >= 0.05) {
    next.videoMiniMap = { x: mx, y: my, w: mw, h: mh };
  }

  next.view = data.view === 'video' ? 'video' : 'map';
  next.metricsLayout = data.metricsLayout === 'column' ? 'column' : 'row';
  var overlay = data.videoOverlay && typeof data.videoOverlay === 'object' ? data.videoOverlay : {};
  Object.keys(next.videoOverlay).forEach(function (key) {
    if (typeof overlay[key] === 'boolean') {
      next.videoOverlay[key] = overlay[key];
    }
  });
  return next;
}

function read() {
  try {
    var raw = window.localStorage.getItem(KEY);
    if (!raw) {
      return blank();
    }
    return sanitize(JSON.parse(raw));
  } catch (err) {
    return blank();
  }
}

export function load() {
  if (!cache) {
    cache = read();
  }
  return cache;
}

export function save() {
  var current = load();
  try {
    window.localStorage.setItem(KEY, JSON.stringify(current));
  } catch (err) {
    /* Private mode and full storage still keep the in-memory copy. */
  }
  return current;
}

export function update(mutator) {
  var current = load();
  if (typeof mutator === 'function') {
    mutator(current);
  }
  return save();
}
