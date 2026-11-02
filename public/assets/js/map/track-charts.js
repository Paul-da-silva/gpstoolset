/**
 * Graphs in the dock under the map (ES module, Chart.js 4 from the vendored
 * classic script, global Chart). Speed, altitude, distance, time, vertical
 * speed and G-force for one Track. Hovering a graph moves a dot on the map.
 */
import * as graphDock from './graph-dock.js';
import { hideScrub, showScrub } from './track-layer.js';
import {
  anyNumber, durationMs, elapsedSec, maxOf, minOf, nearestPointIndex, totalDistance
} from '../core/track.js';
import {
  formatAlt, formatClock, formatDistance, formatDuration, formatSpeed, unitScale
} from '../core/format.js';

var charts = {};
var current = null;
var idleNoun = 'a file';

function idleText(label) {
  return label + ' appears here after ' + idleNoun + ' is opened.';
}

export function destroy() {
  Object.keys(charts).forEach(function (name) {
    if (charts[name]) {
      charts[name].destroy();
      charts[name] = null;
    }
  });
}

function setSummary(id, text) {
  var el = document.getElementById(id);
  if (el) {
    el.textContent = text;
  }
}

function themeInk() {
  var dark = document.documentElement.getAttribute('data-theme') === 'dark';
  return {
    text: window.getComputedStyle(document.body).color || '#0f172a',
    grid: dark ? 'rgba(248, 250, 252, 0.16)' : 'rgba(15, 23, 42, 0.12)'
  };
}

function xOf(point, index, origin) {
  if (current.meta.timed && origin != null && point.t != null) {
    return (point.t - origin) / 1000;
  }
  return index;
}

function axisLabel(value) {
  if (!current.meta.timed) {
    return '';
  }
  return formatClock(value);
}

function chartRows(readY) {
  var origin = current.meta.timed ? current.points[0].t : null;
  var rows = [];
  var i;
  for (i = 0; i < current.idx.length; i++) {
    var at = current.idx[i];
    var point = current.points[at];
    var y = readY(point, at);
    rows.push({
      x: xOf(point, at, origin),
      y: y == null || !isFinite(y) ? null : y,
      i: at
    });
  }
  return rows;
}

function yScaleExtent(rows, fromZero) {
  var min = null;
  var max = null;
  var i;
  for (i = 0; i < rows.length; i++) {
    var y = rows[i].y;
    if (y == null || !isFinite(y)) {
      continue;
    }
    if (min == null || y < min) {
      min = y;
    }
    if (max == null || y > max) {
      max = y;
    }
  }
  if (min == null) {
    return {};
  }
  if (fromZero) {
    return { min: 0 };
  }
  var pad = (max - min) * 0.12;
  if (pad === 0) {
    pad = Math.abs(min) * 0.08 || 1;
  }
  return { min: min - pad, max: max + pad };
}

function makeChart(canvasId, legend, color, fill, rows, digits, suffix, fromZero) {
  var canvas = document.getElementById(canvasId);
  if (!canvas || !window.Chart || !rows.length) {
    return null;
  }
  var ink = themeInk();
  var yExtent = yScaleExtent(rows, fromZero);
  return new window.Chart(canvas, {
    type: 'line',
    data: {
      datasets: [{
        label: legend,
        data: rows,
        borderColor: color,
        backgroundColor: fill,
        fill: !!fill,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHitRadius: 16,
        tension: 0.15,
        spanGaps: true
      }]
    },
    options: {
      animation: false,
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          displayColors: false,
          callbacks: {
            title: function (items) {
              if (!items.length) {
                return '';
              }
              return axisLabel(items[0].parsed.x);
            },
            label: function (item) {
              var y = item.parsed.y;
              if (y == null || !isFinite(y)) {
                return legend + ': —';
              }
              return legend + ': ' + y.toFixed(digits) + ' ' + suffix;
            }
          }
        }
      },
      layout: { padding: { top: 4, right: 8, bottom: 0, left: 0 } },
      scales: {
        x: {
          type: 'linear',
          ticks: {
            maxTicksLimit: 6,
            color: ink.text,
            font: { size: 11 },
            maxRotation: 0,
            padding: 2,
            callback: function (value) {
              return axisLabel(value);
            }
          },
          grid: { display: false },
          border: { display: false }
        },
        y: {
          beginAtZero: !!fromZero,
          min: yExtent.min,
          max: yExtent.max,
          ticks: {
            maxTicksLimit: 3,
            color: ink.text,
            font: { size: 11 },
            padding: 4,
            callback: function (value) {
              var n = Number(value);
              if (!isFinite(n)) {
                return value;
              }
              if (Math.abs(n) >= 10) {
                return String(Math.round(n));
              }
              return String(Math.round(n * 10) / 10);
            }
          },
          grid: { color: ink.grid },
          border: { display: false }
        }
      },
      onHover: function (evt, els, chart) {
        if (!els || !els.length) {
          hideScrub();
          return;
        }
        var row = chart.data.datasets[0].data[els[0].index];
        if (row) {
          showScrub(current.points, row.i);
        }
      }
    }
  });
}

export function resize() {
  Object.keys(charts).forEach(function (name) {
    var pane = document.getElementById('pane-' + name);
    if (charts[name] && pane && !pane.hidden) {
      charts[name].resize();
    }
  });
}

function accChartRows() {
  var rows = [];
  var acc = current.acc;
  if (!acc.length) {
    return rows;
  }
  var step = acc.length > 2500 ? Math.ceil(acc.length / 2500) : 1;
  var i;
  for (i = 0; i < acc.length; i += step) {
    rows.push({
      x: acc[i].cts / 1000,
      y: acc[i].g,
      i: nearestPointIndex(current.points, acc[i].cts)
    });
  }
  var last = acc[acc.length - 1];
  if (!rows.length || rows[rows.length - 1].x !== last.cts / 1000) {
    rows.push({ x: last.cts / 1000, y: last.g, i: nearestPointIndex(current.points, last.cts) });
  }
  return rows;
}

/** Draw every graph for a Track (and the one-line summaries). */
export function renderTrack(track) {
  current = track;
  destroy();
  var scale = unitScale();
  var speedSuffix = scale.speedSuffix;
  var altSuffix = scale.altSuffix;
  var distSuffix = scale.distSuffix;
  var speedFactor = scale.speedFactor;
  var altFactor = scale.altFactor;
  var distFactor = scale.distFactor;
  var speeds = current.smooth;
  var alts = current.points.map(function (point) {
    return point.ele;
  });
  var dists = current.points.map(function (point) {
    return point.dist;
  });
  var vspeeds = current.points.map(function (point) {
    return point.vspeed;
  });
  var meters = totalDistance(current.points);
  var elapsed = durationMs(current.points);

  if (anyNumber(speeds)) {
    var average = elapsed ? meters / (elapsed / 1000) : null;
    setSummary('speed-summary', 'Max ' + formatSpeed(maxOf(speeds)) + ' · average ' + formatSpeed(average));
    charts.speed = makeChart(
      'chart-speed',
      'Speed',
      '#0369a1',
      'rgba(3, 105, 161, 0.16)',
      chartRows(function (point, index) {
        var value = speeds[index];
        return value == null ? null : value * speedFactor;
      }),
      1,
      speedSuffix,
      true
    );
  } else {
    setSummary('speed-summary', 'No speed in this track.');
  }

  if (anyNumber(alts)) {
    setSummary('altitude-summary', 'Lowest ' + formatAlt(minOf(alts)) + ' · highest ' + formatAlt(maxOf(alts)));
    charts.altitude = makeChart(
      'chart-altitude',
      'Altitude',
      '#115e59',
      'rgba(17, 94, 89, 0.18)',
      chartRows(function (point) {
        return point.ele == null ? null : point.ele * altFactor;
      }),
      0,
      altSuffix,
      false
    );
  } else {
    setSummary('altitude-summary', 'No altitude in this track.');
  }

  if (anyNumber(dists)) {
    setSummary('distance-summary', 'Total ' + formatDistance(meters));
    charts.distance = makeChart(
      'chart-distance',
      'Distance',
      '#0369a1',
      'rgba(3, 105, 161, 0.12)',
      chartRows(function (point) {
        return point.dist == null ? null : point.dist * distFactor;
      }),
      2,
      distSuffix,
      true
    );
  } else {
    setSummary('distance-summary', 'No distance in this track.');
  }

  if (current.points.length > 1 && (current.meta.timed || current.points[0].cts != null)) {
    setSummary('time-summary', 'Duration ' + formatDuration(elapsed));
    charts.time = makeChart(
      'chart-time',
      'Time',
      '#115e59',
      null,
      chartRows(function (point, index) {
        return elapsedSec(current.points, point, index);
      }),
      0,
      's',
      true
    );
  } else {
    setSummary('time-summary', 'No time in this track.');
  }

  if (current.meta.hasVspeed && anyNumber(vspeeds)) {
    setSummary('verticalSpeed-summary', 'Lowest ' + formatSpeed(minOf(vspeeds)) + ' · highest ' + formatSpeed(maxOf(vspeeds)));
    charts.verticalSpeed = makeChart(
      'chart-verticalSpeed',
      'Vertical speed',
      '#c2410c',
      'rgba(194, 65, 12, 0.14)',
      chartRows(function (point) {
        return point.vspeed == null ? null : point.vspeed * speedFactor;
      }),
      1,
      speedSuffix,
      false
    );
  } else {
    setSummary('verticalSpeed-summary', 'No vertical speed in this track.');
  }

  if (current.meta.hasG && current.acc.length) {
    var gValues = current.acc.map(function (sample) {
      return sample.g;
    });
    setSummary('gForce-summary', 'Lowest ' + minOf(gValues).toFixed(2) + ' g · highest ' + maxOf(gValues).toFixed(2) + ' g');
    charts.gForce = makeChart(
      'chart-gForce',
      'G-force',
      '#c2410c',
      'rgba(194, 65, 12, 0.14)',
      accChartRows(),
      2,
      'g',
      true
    );
  } else {
    setSummary('gForce-summary', 'No G-force in this track.');
  }
  window.requestAnimationFrame(resize);
}

function setSeriesAvailable(name, on) {
  var chips = document.querySelectorAll('[data-graph="' + name + '"]');
  var i;
  for (i = 0; i < chips.length; i++) {
    chips[i].setAttribute('data-available', on ? 'true' : 'false');
    chips[i].hidden = !on;
  }
  var tab = document.querySelector('[data-dock-tab="' + name + '"]');
  if (tab) {
    tab.setAttribute('data-available', on ? 'true' : 'false');
  }
}

export function paintSeriesAvailability() {
  setSeriesAvailable('speed', true);
  setSeriesAvailable('altitude', true);
  setSeriesAvailable('distance', true);
  setSeriesAvailable('time', true);
  setSeriesAvailable('verticalSpeed', !!(current && current.meta.hasVspeed));
  setSeriesAvailable('gForce', !!(current && current.meta.hasG));
  graphDock.refresh();
}

/**
 * Build the graph panes once. noun completes the idle text, e.g. 'a video'
 * gives "Speed appears here after a video is opened."
 */
export function mountCharts(noun) {
  idleNoun = noun || idleNoun;
  function mount(paneId, canvasId, summaryId, label, emptyText) {
    var pane = document.getElementById(paneId);
    if (!pane || document.getElementById(canvasId)) {
      return;
    }
    pane.textContent = '';
    var summary = document.createElement('p');
    summary.className = 'dock-summary';
    summary.id = summaryId;
    summary.setAttribute('aria-live', 'polite');
    summary.textContent = emptyText;
    var wrap = document.createElement('div');
    wrap.className = 'dock-chart';
    var canvas = document.createElement('canvas');
    canvas.id = canvasId;
    canvas.setAttribute('aria-label', label);
    canvas.addEventListener('mouseleave', hideScrub);
    wrap.appendChild(canvas);
    pane.appendChild(summary);
    pane.appendChild(wrap);
    if (typeof window.ResizeObserver === 'function') {
      var chartName = canvasId.replace(/^chart-/, '');
      var observer = new window.ResizeObserver(function () {
        if (charts[chartName]) {
          charts[chartName].resize();
        }
      });
      observer.observe(wrap);
    }
  }
  mount('pane-speed', 'chart-speed', 'speed-summary', 'Speed over time', idleText('Speed'));
  mount('pane-altitude', 'chart-altitude', 'altitude-summary', 'Altitude over time', idleText('Altitude'));
  mount('pane-distance', 'chart-distance', 'distance-summary', 'Distance over time', idleText('Distance'));
  mount('pane-time', 'chart-time', 'time-summary', 'Time along the track', idleText('Time'));
  mount('pane-verticalSpeed', 'chart-verticalSpeed', 'verticalSpeed-summary', 'Vertical speed over time', idleText('Vertical speed'));
  mount('pane-gForce', 'chart-gForce', 'gForce-summary', 'G-force over time', idleText('G-force'));
}

/** Forget the Track: destroy graphs, reset summaries, hide graphs that need data. */
export function clear() {
  current = null;
  destroy();
  setSummary('speed-summary', idleText('Speed'));
  setSummary('altitude-summary', idleText('Altitude'));
  setSummary('distance-summary', idleText('Distance'));
  setSummary('time-summary', idleText('Time'));
  setSummary('verticalSpeed-summary', idleText('Vertical speed'));
  setSummary('gForce-summary', idleText('G-force'));
  paintSeriesAvailability();
}

/** Say the graphs could not be drawn (speed and altitude summaries). */
export function markFailed() {
  setSummary('speed-summary', 'The graph could not be drawn.');
  setSummary('altitude-summary', 'The graph could not be drawn.');
}
