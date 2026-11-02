/**
 * GoPro Hero video GPS on the map shell.
 * The file is read in the browser. It is not uploaded.
 */
(function (global) {
  'use strict';

  var GROUP_MS = 200;
  var MAX_SPEED = 139;
  var CHART_POINTS = 2500;
  var LINE_POINTS = 10000;

  var job = 0;
  var token = { cancelled: false };
  var layers = { halo: null, line: null, start: null, end: null, scrub: null };
  var charts = {};
  var state = {
    points: [],
    smooth: [],
    idx: [],
    name: 'track',
    timed: false,
    acc: [],
    hasVspeed: false,
    hasG: false,
    videoUrl: null
  };
  var mini = { map: null, halo: null, line: null, marker: null, fitted: false };
  var rafId = 0;
  var loopOn = false;
  var resumePlay = false;

  function pad(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function formatClock(seconds) {
    var sec = Math.max(0, Math.round(Number(seconds) || 0));
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    if (m >= 60) {
      var h = Math.floor(m / 60);
      m = m % 60;
      return h + ':' + pad(m) + ':' + pad(s);
    }
    return m + ':' + pad(s);
  }

  function formatDuration(ms) {
    if (ms == null || !isFinite(ms) || ms < 0) {
      return '—';
    }
    return formatClock(ms / 1000);
  }

  function unitMode() {
    var saved = global.GpsUiState && global.GpsUiState.load();
    return saved && saved.units === 'imperial' ? 'imperial' : 'metric';
  }

  function formatSpeed(mps) {
    if (mps == null || !isFinite(mps)) {
      return '—';
    }
    if (unitMode() === 'imperial') {
      return (mps * 2.2369362920544).toFixed(1) + ' mph';
    }
    return (mps * 3.6).toFixed(1) + ' km/h';
  }

  function formatAlt(meters) {
    if (meters == null || !isFinite(meters)) {
      return '—';
    }
    if (unitMode() === 'imperial') {
      return Math.round(meters * 3.280839895013123) + ' ft';
    }
    return Math.round(meters) + ' m';
  }

  function formatDistance(meters) {
    if (meters == null || !isFinite(meters)) {
      return '—';
    }
    if (unitMode() === 'imperial') {
      var miles = meters / 1609.344;
      if (miles < 0.1) {
        return Math.round(meters * 3.280839895013123) + ' ft';
      }
      return miles.toFixed(2) + ' mi';
    }
    if (meters < 1000) {
      return Math.round(meters) + ' m';
    }
    return (meters / 1000).toFixed(2) + ' km';
  }

  function xml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function stem(name) {
    var base = String(name || 'track');
    var cut = base.lastIndexOf('.');
    if (cut > 0) {
      base = base.slice(0, cut);
    }
    base = base.replace(/[^\w.\- ]+/g, '-').replace(/\s+/g, ' ').trim();
    return base || 'track';
  }

  function haversine(a, b) {
    var earth = 6371000;
    var dLat = (b.lat - a.lat) * Math.PI / 180;
    var dLon = (b.lon - a.lon) * Math.PI / 180;
    var lat1 = a.lat * Math.PI / 180;
    var lat2 = b.lat * Math.PI / 180;
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 2 * earth * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  }

  function validCoord(lat, lon) {
    return isFinite(lat) && isFinite(lon) &&
      Math.abs(lat) <= 90 && Math.abs(lon) <= 180 &&
      !(lat === 0 && lon === 0);
  }

  function gpsTimeOf(sample) {
    if (!sample || sample.date == null) {
      return null;
    }
    var date = sample.date instanceof Date ? sample.date : new Date(sample.date);
    var ms = date.getTime();
    return isFinite(ms) ? ms : null;
  }

  /* cts from extractGpmfFast / GoProTelemetry is milliseconds from video start, not the GPS clock. */
  function ctsMs(sample) {
    if (!sample || typeof sample.cts !== 'number' || !isFinite(sample.cts)) {
      return null;
    }
    return sample.cts;
  }

  function sampleFix(sample, value) {
    if (value && value.length >= 9 && isFinite(Number(value[8]))) {
      return Number(value[8]);
    }
    var sticky = sample && sample.sticky;
    if (sticky && sticky.GPSF != null && isFinite(Number(sticky.GPSF))) {
      return Number(sticky.GPSF);
    }
    return null;
  }

  function isoTime(ms) {
    if (ms == null || !isFinite(ms) || ms < Date.UTC(2000, 0, 1)) {
      return '';
    }
    var date = new Date(ms);
    if (isNaN(date.getTime())) {
      return '';
    }
    return date.toISOString();
  }

  function fillMissingSpeed(points) {
    var i;
    for (i = 1; i < points.length; i++) {
      if (points[i].speed != null) {
        continue;
      }
      if (points[i].t == null || points[i - 1].t == null) {
        continue;
      }
      var dt = (points[i].t - points[i - 1].t) / 1000;
      if (dt <= 0) {
        continue;
      }
      var speed = haversine(points[i - 1], points[i]) / dt;
      if (speed >= 0 && speed <= MAX_SPEED) {
        points[i].speed = speed;
      }
    }
    if (points.length > 1 && points[0].speed == null && points[1].speed != null) {
      points[0].speed = points[1].speed;
    }
  }

  function median(values, win) {
    var half = Math.floor(win / 2);
    var out = new Array(values.length);
    var i;
    for (i = 0; i < values.length; i++) {
      if (values[i] == null || !isFinite(values[i])) {
        out[i] = null;
        continue;
      }
      var bucket = [];
      var start = i - half;
      var end = i + half + 1;
      var j;
      if (start < 0) {
        start = 0;
      }
      if (end > values.length) {
        end = values.length;
      }
      for (j = start; j < end; j++) {
        if (values[j] != null && isFinite(values[j])) {
          bucket.push(values[j]);
        }
      }
      if (!bucket.length) {
        out[i] = null;
        continue;
      }
      bucket.sort(function (a, b) {
        return a - b;
      });
      var mid = Math.floor(bucket.length / 2);
      out[i] = bucket.length % 2 ? bucket[mid] : (bucket[mid - 1] + bucket[mid]) / 2;
    }
    return out;
  }

  function thinIndices(count, max) {
    var out = [];
    if (count <= 0) {
      return out;
    }
    if (count <= max) {
      var n;
      for (n = 0; n < count; n++) {
        out.push(n);
      }
      return out;
    }
    var last = count - 1;
    var step = last / (max - 1);
    var prev = -1;
    var k;
    for (k = 0; k < max; k++) {
      var at = Math.round(k * step);
      if (at !== prev) {
        out.push(at);
      }
      prev = at;
    }
    if (out[out.length - 1] !== last) {
      out.push(last);
    }
    return out;
  }

  function displayLatLngs(points) {
    var idx = thinIndices(points.length, LINE_POINTS);
    var out = [];
    var i;
    for (i = 0; i < idx.length; i++) {
      var p = points[idx[i]];
      out.push([p.lat, p.lon]);
    }
    return out;
  }

  function totalDistance(points) {
    var meters = 0;
    var i;
    for (i = 1; i < points.length; i++) {
      meters += haversine(points[i - 1], points[i]);
    }
    return meters;
  }

  function durationMs(points) {
    if (points.length < 2) {
      return null;
    }
    var a = points[0].t;
    var b = points[points.length - 1].t;
    if (a == null || b == null || b < a) {
      return null;
    }
    return b - a;
  }

  function hasTimes(points) {
    var i;
    for (i = 0; i < points.length; i++) {
      if (points[i].t == null) {
        return false;
      }
    }
    return points.length > 0;
  }

  function anyNumber(values) {
    var i;
    for (i = 0; i < values.length; i++) {
      if (values[i] != null && isFinite(values[i])) {
        return true;
      }
    }
    return false;
  }

  function maxOf(values) {
    var max = null;
    var i;
    for (i = 0; i < values.length; i++) {
      if (values[i] == null || !isFinite(values[i])) {
        continue;
      }
      if (max == null || values[i] > max) {
        max = values[i];
      }
    }
    return max;
  }

  function minOf(values) {
    var min = null;
    var i;
    for (i = 0; i < values.length; i++) {
      if (values[i] == null || !isFinite(values[i])) {
        continue;
      }
      if (min == null || values[i] < min) {
        min = values[i];
      }
    }
    return min;
  }

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
    var track = document.getElementById(trackId);
    if (box) {
      box.hidden = false;
    }
    if (bar) {
      bar.style.width = clamped + '%';
    }
    if (text) {
      text.textContent = label ? label + ' ' + clamped + '%' : clamped + '%';
    }
    if (track) {
      track.setAttribute('aria-valuenow', String(clamped));
      if (label) {
        track.setAttribute('aria-label', label);
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
    if (global.GpsMapShell && !global.GpsMapShell.map) {
      global.GpsMapShell.init();
    }
    if (!first) {
      return;
    }
    global.scrollTo(0, 0);
    global.requestAnimationFrame(function () {
      if (global.GpsMapShell) {
        global.GpsMapShell.invalidate();
      }
      global.requestAnimationFrame(function () {
        if (global.GpsMapShell) {
          global.GpsMapShell.invalidate();
        }
        if (state.points.length) {
          drawMap();
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
    releaseVideo();
    if (!state.points.length && global.GpsMapShell) {
      global.GpsMapShell.setEmpty(true);
    }
  }

  function removeLayers() {
    var map = global.GpsMapShell && global.GpsMapShell.map;
    var keys = ['halo', 'line', 'start', 'end', 'scrub'];
    var i;
    for (i = 0; i < keys.length; i++) {
      if (layers[keys[i]] && map) {
        map.removeLayer(layers[keys[i]]);
      }
      layers[keys[i]] = null;
    }
  }

  function hideScrub() {
    var map = global.GpsMapShell && global.GpsMapShell.map;
    if (layers.scrub && map) {
      map.removeLayer(layers.scrub);
    }
    layers.scrub = null;
  }

  function showScrub(index) {
    var map = global.GpsMapShell && global.GpsMapShell.map;
    var point = state.points[index];
    if (!map || !point || !global.L) {
      return;
    }
    var latlng = [point.lat, point.lon];
    if (!layers.scrub) {
      layers.scrub = global.L.circleMarker(latlng, {
        radius: 7,
        color: '#ffffff',
        weight: 3,
        fillColor: '#c2410c',
        fillOpacity: 1,
        interactive: false
      }).addTo(map);
    } else {
      layers.scrub.setLatLng(latlng);
    }
  }

  function markerStyle(fill) {
    return {
      radius: 7,
      color: '#ffffff',
      weight: 2,
      fillColor: fill,
      fillOpacity: 1
    };
  }

  function drawMap() {
    var map = global.GpsMapShell && global.GpsMapShell.map;
    if (!map || !global.L || !state.points.length) {
      return;
    }
    removeLayers();
    var latlngs = displayLatLngs(state.points);
    var first = state.points[0];
    var last = state.points[state.points.length - 1];
    if (latlngs.length >= 2) {
      layers.halo = global.L.polyline(latlngs, {
        color: '#ffffff',
        weight: 8,
        opacity: 0.95,
        lineJoin: 'round',
        lineCap: 'round',
        interactive: false
      }).addTo(map);
      layers.line = global.L.polyline(latlngs, {
        color: '#0369a1',
        weight: 4,
        opacity: 0.95,
        lineJoin: 'round',
        lineCap: 'round'
      }).addTo(map);
    }
    layers.start = global.L.circleMarker([first.lat, first.lon], markerStyle('#115e59'))
      .addTo(map)
      .bindTooltip('Start', { direction: 'top' });
    if (state.points.length > 1) {
      layers.end = global.L.circleMarker([last.lat, last.lon], markerStyle('#b91c1c'))
        .addTo(map)
        .bindTooltip('End', { direction: 'top' });
    }
    if (layers.line) {
      global.GpsMapShell.fitBounds(layers.line.getBounds(), {
        paddingTopLeft: [40, 64],
        paddingBottomRight: [40, 88]
      });
    } else {
      map.setView([first.lat, first.lon], 16);
    }
  }

  function destroyCharts() {
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
      text: global.getComputedStyle(document.body).color || '#0f172a',
      grid: dark ? 'rgba(248, 250, 252, 0.16)' : 'rgba(15, 23, 42, 0.12)'
    };
  }

  function xOf(point, index, origin) {
    if (state.timed && origin != null && point.t != null) {
      return (point.t - origin) / 1000;
    }
    return index;
  }

  function axisLabel(value) {
    if (!state.timed) {
      return '';
    }
    return formatClock(value);
  }

  function chartRows(readY) {
    var origin = state.timed ? state.points[0].t : null;
    var rows = [];
    var i;
    for (i = 0; i < state.idx.length; i++) {
      var at = state.idx[i];
      var point = state.points[at];
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
    if (!canvas || !global.Chart || !rows.length) {
      return null;
    }
    var ink = themeInk();
    var yExtent = yScaleExtent(rows, fromZero);
    return new global.Chart(canvas, {
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
            showScrub(row.i);
          }
        }
      }
    });
  }

  function resizeCharts() {
    Object.keys(charts).forEach(function (name) {
      var pane = document.getElementById('pane-' + name);
      if (charts[name] && pane && !pane.hidden) {
        charts[name].resize();
      }
    });
  }

  function elapsedSec(point, index) {
    var first = state.points[0];
    if (!first) {
      return index;
    }
    if (point.cts != null && first.cts != null) {
      return (point.cts - first.cts) / 1000;
    }
    if (point.t != null && first.t != null) {
      return (point.t - first.t) / 1000;
    }
    return index;
  }

  function nearestPointIndex(cts) {
    var points = state.points;
    if (!points.length || points[0].cts == null || cts == null) {
      return 0;
    }
    var lo = 0;
    var hi = points.length - 1;
    while (lo < hi) {
      var mid = (lo + hi) >> 1;
      if (points[mid].cts < cts) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }
    if (lo > 0 && Math.abs(points[lo - 1].cts - cts) < Math.abs(points[lo].cts - cts)) {
      return lo - 1;
    }
    return lo;
  }

  function accChartRows() {
    var rows = [];
    var acc = state.acc;
    if (!acc.length) {
      return rows;
    }
    var step = acc.length > 2500 ? Math.ceil(acc.length / 2500) : 1;
    var i;
    for (i = 0; i < acc.length; i += step) {
      rows.push({
        x: acc[i].cts / 1000,
        y: acc[i].g,
        i: nearestPointIndex(acc[i].cts)
      });
    }
    var last = acc[acc.length - 1];
    if (!rows.length || rows[rows.length - 1].x !== last.cts / 1000) {
      rows.push({ x: last.cts / 1000, y: last.g, i: nearestPointIndex(last.cts) });
    }
    return rows;
  }

  function renderCharts() {
    destroyCharts();
    var imperial = unitMode() === 'imperial';
    var speedSuffix = imperial ? 'mph' : 'km/h';
    var altSuffix = imperial ? 'ft' : 'm';
    var distSuffix = imperial ? 'mi' : 'km';
    var speedFactor = imperial ? 2.2369362920544 : 3.6;
    var altFactor = imperial ? 3.280839895013123 : 1;
    var distFactor = imperial ? 1 / 1609.344 : 0.001;
    var speeds = state.smooth;
    var alts = state.points.map(function (point) {
      return point.ele;
    });
    var dists = state.points.map(function (point) {
      return point.dist;
    });
    var vspeeds = state.points.map(function (point) {
      return point.vspeed;
    });
    var meters = totalDistance(state.points);
    var elapsed = durationMs(state.points);

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

    if (state.points.length > 1 && (state.timed || state.points[0].cts != null)) {
      setSummary('time-summary', 'Duration ' + formatDuration(elapsed));
      charts.time = makeChart(
        'chart-time',
        'Time',
        '#115e59',
        null,
        chartRows(function (point, index) {
          return elapsedSec(point, index);
        }),
        0,
        's',
        true
      );
    } else {
      setSummary('time-summary', 'No time in this track.');
    }

    if (state.hasVspeed && anyNumber(vspeeds)) {
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

    if (state.hasG && state.acc.length) {
      var gValues = state.acc.map(function (sample) {
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
    global.requestAnimationFrame(resizeCharts);
  }

  function stat(id, text) {
    var el = document.getElementById(id);
    if (el) {
      el.textContent = text;
    }
  }

  function renderStats() {
    var points = state.points;
    if (!points.length) {
      stat('stat-points', '—');
      stat('stat-duration', '—');
      stat('stat-distance', '—');
      stat('stat-avg', '—');
      stat('stat-max', '—');
      stat('stat-low', '—');
      stat('stat-high', '—');
      return;
    }
    var meters = totalDistance(points);
    var elapsed = durationMs(points);
    var average = elapsed ? meters / (elapsed / 1000) : null;
    var eles = points.map(function (point) {
      return point.ele;
    });
    stat('stat-points', points.length.toLocaleString());
    stat('stat-duration', formatDuration(elapsed));
    stat('stat-distance', formatDistance(meters));
    stat('stat-avg', formatSpeed(average));
    stat('stat-max', formatSpeed(maxOf(state.smooth)));
    stat('stat-low', formatAlt(minOf(eles)));
    stat('stat-high', formatAlt(maxOf(eles)));
  }

  function paintUnits() {
    var mode = unitMode();
    var buttons = document.querySelectorAll('[data-units]');
    var i;
    for (i = 0; i < buttons.length; i++) {
      var on = buttons[i].getAttribute('data-units') === mode;
      buttons[i].classList.toggle('is-active', on);
      buttons[i].setAttribute('aria-pressed', on ? 'true' : 'false');
    }
  }

  function setExportEnabled(on) {
    var buttons = document.querySelectorAll('#export-panel [data-export]');
    var i;
    for (i = 0; i < buttons.length; i++) {
      buttons[i].disabled = !on;
    }
    var note = document.getElementById('export-note');
    if (note) {
      note.textContent = on
        ? 'Saves a file on this device. Nothing is uploaded.'
        : 'Open a video to export the track.';
    }
  }

  function clearTrack() {
    state.points = [];
    state.smooth = [];
    state.idx = [];
    state.name = 'track';
    state.timed = false;
    state.acc = [];
    state.hasVspeed = false;
    state.hasG = false;
    removeLayers();
    clearMiniTrack();
    destroyCharts();
    setExportEnabled(false);
    renderStats();
    setSummary('speed-summary', 'Speed appears here after a video is opened.');
    setSummary('altitude-summary', 'Altitude appears here after a video is opened.');
    setSummary('distance-summary', 'Distance appears here after a video is opened.');
    setSummary('time-summary', 'Time appears here after a video is opened.');
    setSummary('verticalSpeed-summary', 'Vertical speed appears here after a video is opened.');
    setSummary('gForce-summary', 'G-force appears here after a video is opened.');
    paintSeriesAvailability();
  }

  function download(filename, mime, text) {
    var blob = new Blob([text], { type: mime });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    global.setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1500);
  }

  function toGpx(points, name) {
    var lines = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<gpx version="1.1" creator="GPS Toolset" xmlns="http://www.topografix.com/GPX/1/1" xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v1">',
      '<trk><name>' + xml(name) + '</name><trkseg>'
    ];
    var i;
    for (i = 0; i < points.length; i++) {
      var point = points[i];
      lines.push('<trkpt lat="' + point.lat.toFixed(7) + '" lon="' + point.lon.toFixed(7) + '">');
      if (point.ele != null && isFinite(point.ele)) {
        lines.push('<ele>' + point.ele.toFixed(2) + '</ele>');
      }
      var when = isoTime(point.t);
      if (when) {
        lines.push('<time>' + when + '</time>');
      }
      if (point.speed != null && isFinite(point.speed)) {
        lines.push('<extensions><gpxtpx:TrackPointExtension><gpxtpx:speed>' +
          point.speed.toFixed(3) + '</gpxtpx:speed></gpxtpx:TrackPointExtension></extensions>');
      }
      lines.push('</trkpt>');
    }
    lines.push('</trkseg></trk></gpx>');
    return lines.join('');
  }

  function toCsv(points) {
    var lines = ['time_utc,latitude,longitude,altitude_m,speed_mps'];
    var i;
    for (i = 0; i < points.length; i++) {
      var point = points[i];
      lines.push([
        isoTime(point.t),
        point.lat.toFixed(7),
        point.lon.toFixed(7),
        point.ele != null && isFinite(point.ele) ? point.ele.toFixed(2) : '',
        point.speed != null && isFinite(point.speed) ? point.speed.toFixed(3) : ''
      ].join(','));
    }
    return lines.join('\n') + '\n';
  }

  function toKml(points, name) {
    var coords = [];
    var i;
    for (i = 0; i < points.length; i++) {
      var point = points[i];
      var alt = point.ele != null && isFinite(point.ele) ? point.ele.toFixed(2) : '0';
      coords.push(point.lon.toFixed(7) + ',' + point.lat.toFixed(7) + ',' + alt);
    }
    return '<?xml version="1.0" encoding="UTF-8"?>' +
      '<kml xmlns="http://www.opengis.net/kml/2.2"><Document><name>' + xml(name) + '</name>' +
      '<Placemark><name>' + xml(name) + '</name><LineString><altitudeMode>absolute</altitudeMode><coordinates>' +
      coords.join(' ') +
      '</coordinates></LineString></Placemark></Document></kml>';
  }

  function exportTrack(kind) {
    if (!state.points.length) {
      return;
    }
    var name = stem(state.name);
    if (kind === 'gpx') {
      download(name + '.gpx', 'application/gpx+xml', toGpx(state.points, name));
    } else if (kind === 'csv') {
      download(name + '.csv', 'text/csv', toCsv(state.points));
    } else if (kind === 'kml') {
      download(name + '.kml', 'application/vnd.google-earth.kml+xml', toKml(state.points, name));
    }
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

  function showTrack(id, points, name) {
    if (id !== job) {
      return;
    }
    hideProgress();
    if (!points || !points.length) {
      clearTrack();
      releaseVideo();
      showError('No GPS track in this file. GPS has to be on in the camera while it records.');
      if (global.GpsMapShell) {
        global.GpsMapShell.setEmpty(true);
      }
      return;
    }
    state.points = points;
    state.name = name;
    annotatePoints(points);
    state.timed = hasTimes(points);
    state.smooth = median(points.map(function (point) {
      return point.speed;
    }), 5);
    state.idx = thinIndices(points.length, CHART_POINTS);
    clearError();
    enterTool();
    drawMap();
    renderStats();
    try {
      renderCharts();
    } catch (err) {
      setSummary('speed-summary', 'The graph could not be drawn.');
      setSummary('altitude-summary', 'The graph could not be drawn.');
    }
    setExportEnabled(true);
    if (global.GpsMapShell) {
      global.GpsMapShell.setEmpty(false);
    }
    onTrackReady();
  }

  function devicesFrom(result) {
    var devices = [];
    if (Array.isArray(result)) {
      return result;
    }
    if (result && typeof result === 'object') {
      if (result.streams) {
        return [result];
      }
      var keys = Object.keys(result);
      var k;
      for (k = 0; k < keys.length; k++) {
        var device = result[keys[k]];
        if (device && typeof device === 'object' && device.streams) {
          devices.push(device);
        }
      }
    }
    return devices;
  }

  function byCts(a, b) {
    var ak = a.cts != null ? a.cts : a.t;
    var bk = b.cts != null ? b.cts : b.t;
    if (ak == null && bk == null) {
      return 0;
    }
    if (ak == null) {
      return 1;
    }
    if (bk == null) {
      return -1;
    }
    return ak - bk;
  }

  function seriesFromTelemetry(result) {
    var devices = devicesFrom(result);
    var samples = [];
    var accRaw = [];
    var d;
    for (d = 0; d < devices.length; d++) {
      var streams = devices[d].streams || {};
      var stream = streams.GPS9 || streams.GPS5 || streams.GPS;
      if (stream && stream.samples) {
        var s;
        for (s = 0; s < stream.samples.length; s++) {
          samples.push(stream.samples[s]);
        }
      }
      var acc = streams.ACCL;
      if (acc && acc.samples) {
        var a;
        for (a = 0; a < acc.samples.length; a++) {
          var accSample = acc.samples[a];
          var axes = accSample && accSample.value;
          if (!axes || axes.length < 3) {
            continue;
          }
          var x = Number(axes[0]);
          var y = Number(axes[1]);
          var z = Number(axes[2]);
          var cts = ctsMs(accSample);
          if (!isFinite(x) || !isFinite(y) || !isFinite(z) || cts == null) {
            continue;
          }
          accRaw.push({ cts: cts, mag: Math.sqrt(x * x + y * y + z * z) });
        }
      }
    }
    var points = [];
    var i;
    for (i = 0; i < samples.length; i++) {
      var sample = samples[i];
      var value = sample && sample.value;
      if (!value || value.length < 2) {
        continue;
      }
      var fix = sampleFix(sample, value);
      if (fix != null && fix < 2) {
        continue;
      }
      var lat = Number(value[0]);
      var lon = Number(value[1]);
      if (!validCoord(lat, lon)) {
        continue;
      }
      var ele = value.length > 2 ? Number(value[2]) : NaN;
      var speed = value.length > 3 ? Number(value[3]) : NaN;
      points.push({
        lat: lat,
        lon: lon,
        ele: isFinite(ele) ? ele : null,
        speed: isFinite(speed) && speed >= 0 && speed <= MAX_SPEED ? speed : null,
        t: gpsTimeOf(sample),
        cts: ctsMs(sample)
      });
    }
    points.sort(byCts);
    fillMissingSpeed(points);
    accRaw.sort(byCts);
    return { points: points, acc: scaleAcc(accRaw) };
  }

  function scaleAcc(samples) {
    if (!samples.length) {
      return [];
    }
    var probe = [];
    var i;
    for (i = 0; i < samples.length && probe.length < 40; i++) {
      probe.push(samples[i].mag);
    }
    probe.sort(function (a, b) {
      return a - b;
    });
    var mid = probe[Math.floor(probe.length / 2)];
    var scale = mid > 3 ? 9.80665 : 1;
    var out = [];
    for (i = 0; i < samples.length; i++) {
      out.push({ cts: samples[i].cts, g: samples[i].mag / scale });
    }
    return out;
  }

  function annotatePoints(points) {
    var i;
    state.hasVspeed = false;
    if (!points.length) {
      return;
    }
    points[0].dist = 0;
    points[0].vspeed = null;
    for (i = 1; i < points.length; i++) {
      points[i].dist = points[i - 1].dist + haversine(points[i - 1], points[i]);
      points[i].vspeed = null;
      var dtMs = null;
      if (points[i].cts != null && points[i - 1].cts != null) {
        dtMs = points[i].cts - points[i - 1].cts;
      } else if (points[i].t != null && points[i - 1].t != null) {
        dtMs = points[i].t - points[i - 1].t;
      }
      if (dtMs == null) {
        continue;
      }
      var dt = dtMs / 1000;
      if (dt <= 0.02 || points[i].ele == null || points[i - 1].ele == null) {
        continue;
      }
      var vs = (points[i].ele - points[i - 1].ele) / dt;
      if (Math.abs(vs) <= MAX_SPEED) {
        points[i].vspeed = vs;
        state.hasVspeed = true;
      }
    }
    if (points.length > 1 && points[0].vspeed == null) {
      points[0].vspeed = points[1].vspeed;
    }
  }

  function messageFor(err) {
    var msg = '';
    if (err) {
      msg = err.message ? String(err.message) : String(err);
    }
    var low = msg.toLowerCase();
    if (low.indexOf('cancel') !== -1) {
      return '';
    }
    if (
      low.indexOf('gpmf') !== -1 ||
      low.indexOf('track not found') !== -1 ||
      low.indexOf('no gps') !== -1
    ) {
      return 'No GPS track in this file. GPS has to be on in the camera while it records.';
    }
    return "Couldn't read that file.";
  }

  function extract(file, id, active, onProgress) {
    function slow() {
      if (typeof global.GPMFExtract !== 'function') {
        return Promise.reject(new Error('GPMF track not found'));
      }
      var idleMs = file.size < 50 * 1024 * 1024
        ? 8000
        : Math.min(180000, 20000 + Math.round(file.size / (20 * 1024 * 1024)) * 1000);
      return new Promise(function (resolve, reject) {
        var settled = false;
        var timer = null;
        function finish(fn, value) {
          if (settled) {
            return;
          }
          settled = true;
          global.clearTimeout(timer);
          fn(value);
        }
        function arm() {
          global.clearTimeout(timer);
          timer = global.setTimeout(function () {
            active.cancelled = true;
            finish(reject, new Error("Couldn't read that file."));
          }, idleMs);
        }
        arm();
        global.GPMFExtract(file, {
          browserMode: true,
          useWorker: false,
          cancellationToken: active,
          progress: function (pct) {
            if (settled) {
              return;
            }
            arm();
            if (id !== job || active.cancelled) {
              return;
            }
            var ratio = typeof pct === 'number' ? pct : 0;
            if (ratio > 1) {
              ratio = ratio / 100;
            }
            onProgress(ratio, 'Reading the whole video. You can cancel if this takes too long.');
          }
        }).then(function (value) {
          finish(resolve, value);
        }, function (err) {
          finish(reject, err);
        });
      });
    }

    function fast() {
      return global.extractGpmfFast(file, {
        progress: function (ratio) {
          if (id !== job || active.cancelled) {
            return;
          }
          onProgress(typeof ratio === 'number' ? ratio : 0, 'Reading GPS from the video…');
        }
      });
    }

    if (typeof global.extractGpmfFast !== 'function') {
      return slow();
    }
    return fast().catch(function () {
      if (id !== job || active.cancelled) {
        throw new Error('Canceled by user');
      }
      onProgress(0, 'Reading the whole video. You can cancel if this takes too long.');
      return slow();
    });
  }

  function readFile(file, id, active) {
    extract(file, id, active, function (ratio, label) {
      var pct = Math.max(0, Math.min(1, ratio)) * 78;
      setProgress(pct, label);
    }).then(function (extracted) {
      if (id !== job || active.cancelled) {
        throw new Error('Canceled by user');
      }
      if (!extracted || !extracted.rawData || !extracted.rawData.length) {
        throw new Error('No GPS track in this file');
      }
      setProgress(82, 'Building the track…');
      if (typeof global.GoProTelemetry !== 'function') {
        throw new Error("Couldn't read that file.");
      }
      return global.GoProTelemetry({
        rawData: extracted.rawData,
        timing: extracted.timing
      }, {
        stream: ['GPS', 'ACCL'],
        GPSFix: 2,
        GPSPrecision: 500,
        groupTimes: GROUP_MS,
        disableInterpolation: true,
        disableMerging: false,
        progress: function (ratio) {
          if (id !== job || active.cancelled) {
            return;
          }
          var p = typeof ratio === 'number' ? ratio : 0;
          if (p > 1) {
            p = p / 100;
          }
          setProgress(82 + Math.max(0, Math.min(1, p)) * 16, 'Building the track…');
        }
      });
    }).then(function (telemetry) {
      if (id !== job || active.cancelled) {
        return;
      }
      setProgress(99, 'Drawing the track…');
      var series = seriesFromTelemetry(telemetry);
      state.acc = series.acc;
      state.hasG = series.acc.length > 0;
      showTrack(id, series.points, stem(file.name));
    }).catch(function (err) {
      if (id !== job) {
        return;
      }
      hideProgress();
      var message = messageFor(err);
      if (!message) {
        if (!state.points.length && global.GpsMapShell) {
          global.GpsMapShell.setEmpty(true);
        }
        return;
      }
      clearTrack();
      releaseVideo();
      showError(message);
      if (global.GpsMapShell) {
        global.GpsMapShell.setEmpty(true);
      }
    });
  }

  function onPickedFile(file) {
    var id = nextJob();
    clearError();
    releaseVideo();
    if (!acceptedFile(file)) {
      clearTrack();
      showError('Choose a GoPro video (.mp4 or .lrv).');
      if (global.GpsMapShell) {
        global.GpsMapShell.setEmpty(true);
      }
      return;
    }
    attachVideoFile(file);
    clearTrack();
    if (global.GpsMapShell) {
      global.GpsMapShell.setEmpty(false);
    }
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
    releaseVideo();
    state.acc = [];
    state.hasG = false;
    showName('Sample route');
    showTrack(id, samplePoints(), 'Sample route');
  }

  function mountCharts() {
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
      if (typeof global.ResizeObserver === 'function') {
        var chartName = canvasId.replace(/^chart-/, '');
        var observer = new global.ResizeObserver(function () {
          if (charts[chartName]) {
            charts[chartName].resize();
          }
        });
        observer.observe(wrap);
      }
    }
    mount('pane-speed', 'chart-speed', 'speed-summary', 'Speed over time', 'Speed appears here after a video is opened.');
    mount('pane-altitude', 'chart-altitude', 'altitude-summary', 'Altitude over time', 'Altitude appears here after a video is opened.');
    mount('pane-distance', 'chart-distance', 'distance-summary', 'Distance over time', 'Distance appears here after a video is opened.');
    mount('pane-time', 'chart-time', 'time-summary', 'Time along the track', 'Time appears here after a video is opened.');
    mount('pane-verticalSpeed', 'chart-verticalSpeed', 'verticalSpeed-summary', 'Vertical speed over time', 'Vertical speed appears here after a video is opened.');
    mount('pane-gForce', 'chart-gForce', 'gForce-summary', 'G-force over time', 'G-force appears here after a video is opened.');
  }

  function mountPanels() {
    var stats = document.getElementById('stats-panel');
    var exp = document.getElementById('export-panel');
    if (stats) {
      stats.innerHTML =
        '<p class="popover-kicker">Track</p>' +
        '<div class="unit-switch" role="group" aria-label="Units">' +
        '<button type="button" class="chip" data-units="metric" aria-pressed="true">Metric</button>' +
        '<button type="button" class="chip" data-units="imperial" aria-pressed="false">Imperial</button>' +
        '</div>' +
        '<dl class="stat-list">' +
        '<div><dt>Points</dt><dd id="stat-points">—</dd></div>' +
        '<div><dt>Duration</dt><dd id="stat-duration">—</dd></div>' +
        '<div><dt>Distance</dt><dd id="stat-distance">—</dd></div>' +
        '<div><dt>Average speed</dt><dd id="stat-avg">—</dd></div>' +
        '<div><dt>Max speed</dt><dd id="stat-max">—</dd></div>' +
        '<div><dt>Lowest altitude</dt><dd id="stat-low">—</dd></div>' +
        '<div><dt>Highest altitude</dt><dd id="stat-high">—</dd></div>' +
        '</dl>';
    }
    if (exp) {
      exp.innerHTML =
        '<p class="popover-kicker">Export</p>' +
        '<p class="popover-note" id="export-note">Open a video to export the track.</p>' +
        '<div class="export-actions">' +
        '<button type="button" class="chip" data-export="gpx" disabled>GPX</button>' +
        '<button type="button" class="chip" data-export="csv" disabled>CSV</button>' +
        '<button type="button" class="chip" data-export="kml" disabled>KML</button>' +
        '</div>';
    }
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
    var buttons = document.querySelectorAll('[data-units]');
    var i;
    for (i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function (event) {
        var mode = event.currentTarget.getAttribute('data-units');
        if (mode !== 'metric' && mode !== 'imperial') {
          return;
        }
        if (global.GpsUiState) {
          global.GpsUiState.update(function (current) {
            current.units = mode;
          });
        }
        paintUnits();
        renderStats();
        if (state.points.length) {
          renderCharts();
        }
        paintVideo();
      });
    }
    var exp = document.getElementById('export-panel');
    if (exp) {
      exp.addEventListener('click', function (event) {
        var node = event.target;
        while (node && node !== exp) {
          if (node.getAttribute && node.getAttribute('data-export')) {
            if (!node.disabled) {
              exportTrack(node.getAttribute('data-export'));
            }
            return;
          }
          node = node.parentNode;
        }
      });
    }
    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') {
        return;
      }
      var box = document.getElementById('map-progress');
      if (!box || box.hidden) {
        setVideoMenu(false);
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
      global.requestAnimationFrame(resizeCharts);
    });
    ['speed', 'altitude', 'distance', 'time', 'verticalSpeed', 'gForce'].forEach(function (name) {
      var pane = document.getElementById('pane-' + name);
      if (pane) {
        pane.addEventListener('mouseleave', hideScrub);
      }
    });
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

  function paintSeriesAvailability() {
    setSeriesAvailable('speed', true);
    setSeriesAvailable('altitude', true);
    setSeriesAvailable('distance', true);
    setSeriesAvailable('time', true);
    setSeriesAvailable('verticalSpeed', !!state.hasVspeed);
    setSeriesAvailable('gForce', !!state.hasG);
    if (global.GpsGraphDock && global.GpsGraphDock.refresh) {
      global.GpsGraphDock.refresh();
    }
  }

  var OVERLAYS = [
    { key: 'miniMap', label: 'Mini map' },
    { key: 'speed', label: 'Speed' },
    { key: 'altitude', label: 'Altitude' },
    { key: 'distance', label: 'Distance' },
    { key: 'time', label: 'Time' },
    { key: 'gForce', label: 'G-force', needs: 'hasG' },
    { key: 'verticalSpeed', label: 'Vertical speed', needs: 'hasVspeed' }
  ];

  function overlayOn(key) {
    var saved = global.GpsUiState && global.GpsUiState.load();
    var overlay = saved && saved.videoOverlay;
    return !!(overlay && overlay[key]);
  }

  function lerp(a, b, f) {
    if (a == null || !isFinite(a)) {
      return b;
    }
    if (b == null || !isFinite(b)) {
      return a;
    }
    return a + (b - a) * f;
  }

  function lerpLon(a, b, f) {
    var delta = b - a;
    if (delta > 180) {
      delta -= 360;
    }
    if (delta < -180) {
      delta += 360;
    }
    var lon = a + delta * f;
    if (lon > 180) {
      lon -= 360;
    }
    if (lon < -180) {
      lon += 360;
    }
    return lon;
  }

  function firstAtOrAfter(samples, ms) {
    var lo = 0;
    var hi = samples.length - 1;
    while (lo <= hi) {
      var mid = (lo + hi) >> 1;
      if (samples[mid].cts < ms) {
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    return lo;
  }

  function sampleAt(points, ms) {
    if (!points.length || points[0].cts == null) {
      return { waiting: true, timed: false };
    }
    if (ms < points[0].cts) {
      return { waiting: true, timed: true };
    }
    var last = points[points.length - 1];
    if (ms >= last.cts) {
      return {
        waiting: false,
        timed: true,
        lat: last.lat,
        lon: last.lon,
        ele: last.ele,
        speed: last.speed,
        dist: last.dist,
        vspeed: last.vspeed
      };
    }
    var idx = firstAtOrAfter(points, ms);
    var next = points[idx];
    var prev = points[idx - 1];
    if (!prev || !next) {
      var only = next || prev || last;
      return {
        waiting: false,
        timed: true,
        lat: only.lat,
        lon: only.lon,
        ele: only.ele,
        speed: only.speed,
        dist: only.dist,
        vspeed: only.vspeed
      };
    }
    var span = next.cts - prev.cts;
    var f = span > 0 ? (ms - prev.cts) / span : 0;
    return {
      waiting: false,
      timed: true,
      lat: prev.lat + (next.lat - prev.lat) * f,
      lon: lerpLon(prev.lon, next.lon, f),
      ele: lerp(prev.ele, next.ele, f),
      speed: lerp(prev.speed, next.speed, f),
      dist: lerp(prev.dist, next.dist, f),
      vspeed: lerp(prev.vspeed, next.vspeed, f)
    };
  }

  function gAt(ms) {
    var acc = state.acc;
    if (!acc.length || acc[0].cts == null || ms < acc[0].cts) {
      return null;
    }
    var last = acc[acc.length - 1];
    if (ms >= last.cts) {
      return last.g;
    }
    var idx = firstAtOrAfter(acc, ms);
    var next = acc[idx];
    var prev = acc[idx - 1];
    if (!prev || !next) {
      return next ? next.g : null;
    }
    var span = next.cts - prev.cts;
    var f = span > 0 ? (ms - prev.cts) / span : 0;
    return lerp(prev.g, next.g, f);
  }

  function selfCheckSync() {
    var pts = [
      { cts: 2000, lat: 0, lon: 0, ele: 0, speed: 0, dist: 0, vspeed: 0 },
      { cts: 4000, lat: 2, lon: 4, ele: 10, speed: 8, dist: 100, vspeed: 2 }
    ];
    var early = sampleAt(pts, 1000);
    var mid = sampleAt(pts, 3000);
    var at = sampleAt(pts, 2000);
    var end = sampleAt(pts, 9000);
    var bad = !early.waiting || !early.timed || mid.waiting ||
      Math.abs(mid.lat - 1) > 1e-9 || Math.abs(mid.lon - 2) > 1e-9 ||
      Math.abs(mid.ele - 5) > 1e-9 || at.waiting || Math.abs(at.lat) > 1e-9 ||
      end.waiting || Math.abs(end.lat - 2) > 1e-9;
    if (bad && global.console) {
      global.console.error('GPS sync check failed', early, mid, at, end);
    }
  }

  function showViewSwitch(on) {
    var host = document.getElementById('topbar-tools');
    if (host) {
      host.hidden = !on;
    }
  }

  function paintViewSwitch(videoOn) {
    var mapBtn = document.getElementById('view-map');
    var videoBtn = document.getElementById('view-video');
    if (mapBtn) {
      mapBtn.setAttribute('aria-pressed', videoOn ? 'false' : 'true');
    }
    if (videoBtn) {
      videoBtn.setAttribute('aria-pressed', videoOn ? 'true' : 'false');
    }
  }

  function videoEl() {
    return document.getElementById('gopro-video');
  }

  function stopLoop() {
    loopOn = false;
    if (rafId) {
      global.cancelAnimationFrame(rafId);
      rafId = 0;
    }
  }

  function startLoop() {
    if (loopOn) {
      return;
    }
    var stage = document.getElementById('video-stage');
    if (!stage || stage.hidden) {
      return;
    }
    loopOn = true;
    var tick = function () {
      if (!loopOn) {
        return;
      }
      paintVideo();
      rafId = global.requestAnimationFrame(tick);
    };
    rafId = global.requestAnimationFrame(tick);
  }

  function hideMiniMarker() {
    if (mini.marker && mini.map) {
      mini.map.removeLayer(mini.marker);
    }
    mini.marker = null;
  }

  function clearMiniTrack() {
    hideMiniMarker();
    if (mini.map) {
      if (mini.halo) {
        mini.map.removeLayer(mini.halo);
      }
      if (mini.line) {
        mini.map.removeLayer(mini.line);
      }
    }
    mini.halo = null;
    mini.line = null;
    mini.fitted = false;
  }

  function drawMiniTrack() {
    if (!mini.map || !global.L || !state.points.length) {
      return;
    }
    if (mini.halo) {
      mini.map.removeLayer(mini.halo);
      mini.halo = null;
    }
    if (mini.line) {
      mini.map.removeLayer(mini.line);
      mini.line = null;
    }
    var latlngs = displayLatLngs(state.points);
    if (latlngs.length < 2) {
      return;
    }
    mini.halo = global.L.polyline(latlngs, {
      color: '#ffffff',
      weight: 7,
      opacity: 0.95,
      lineJoin: 'round',
      lineCap: 'round',
      interactive: false
    }).addTo(mini.map);
    mini.line = global.L.polyline(latlngs, {
      color: '#0369a1',
      weight: 4,
      opacity: 0.95,
      lineJoin: 'round',
      lineCap: 'round',
      interactive: false
    }).addTo(mini.map);
    mini.fitted = false;
  }

  function stageBox() {
    var stage = document.getElementById('video-stage');
    if (!stage) {
      return null;
    }
    var rect = stage.getBoundingClientRect();
    if (rect.width < 40 || rect.height < 40) {
      return null;
    }
    return rect;
  }

  function clampBox(value, min, max) {
    if (value < min) {
      return min;
    }
    if (value > max) {
      return max;
    }
    return value;
  }

  function applyMiniFrame() {
    var frame = document.getElementById('video-minimap-frame');
    var rect = stageBox();
    var saved = global.GpsUiState && global.GpsUiState.load().videoMiniMap;
    if (!frame || !rect || !saved || saved.x == null) {
      return;
    }
    var width = clampBox(saved.w * rect.width, 144, rect.width * 0.86);
    var height = clampBox(saved.h * rect.height, 128, rect.height * 0.72);
    var left = clampBox(saved.x * rect.width, 8, Math.max(8, rect.width - width - 8));
    var top = clampBox(saved.y * rect.height, 8, Math.max(8, rect.height - height - 8));
    frame.style.left = left + 'px';
    frame.style.top = top + 'px';
    frame.style.right = 'auto';
    frame.style.bottom = 'auto';
    frame.style.width = width + 'px';
    frame.style.height = height + 'px';
  }

  function saveMiniFrame() {
    var frame = document.getElementById('video-minimap-frame');
    var rect = stageBox();
    if (!frame || !rect || !global.GpsUiState) {
      return;
    }
    var box = frame.getBoundingClientRect();
    global.GpsUiState.update(function (current) {
      current.videoMiniMap = {
        x: (box.left - rect.left) / rect.width,
        y: (box.top - rect.top) / rect.height,
        w: box.width / rect.width,
        h: box.height / rect.height
      };
    });
  }

  function bindMiniFrame() {
    var drag = document.getElementById('video-minimap-drag');
    var resize = document.getElementById('video-minimap-resize');
    var frame = document.getElementById('video-minimap-frame');
    if (!drag || !resize || !frame || drag.getAttribute('data-bound')) {
      return;
    }
    drag.setAttribute('data-bound', 'true');

    function track(handle, onMove) {
      handle.addEventListener('pointerdown', function (event) {
        if (event.button != null && event.button !== 0) {
          return;
        }
        var rect = stageBox();
        var box = frame.getBoundingClientRect();
        if (!rect) {
          return;
        }
        var startX = event.clientX;
        var startY = event.clientY;
        var origin = {
          left: box.left - rect.left,
          top: box.top - rect.top,
          width: box.width,
          height: box.height
        };
        function move(ev) {
          onMove(ev.clientX - startX, ev.clientY - startY, origin);
          if (mini.map) {
            mini.map.invalidateSize();
          }
        }
        function up(ev) {
          handle.removeEventListener('pointermove', move);
          handle.removeEventListener('pointerup', up);
          handle.removeEventListener('pointercancel', up);
          saveMiniFrame();
          if (ev && ev.pointerId != null && handle.releasePointerCapture) {
            try {
              handle.releasePointerCapture(ev.pointerId);
            } catch (err) {
              /* capture may already be gone */
            }
          }
        }
        if (handle.setPointerCapture) {
          handle.setPointerCapture(event.pointerId);
        }
        handle.addEventListener('pointermove', move);
        handle.addEventListener('pointerup', up);
        handle.addEventListener('pointercancel', up);
        event.preventDefault();
      });
    }

    track(drag, function (dx, dy, origin) {
      var rect = stageBox();
      if (!rect) {
        return;
      }
      var left = clampBox(origin.left + dx, 8, Math.max(8, rect.width - origin.width - 8));
      var top = clampBox(origin.top + dy, 8, Math.max(8, rect.height - origin.height - 8));
      frame.style.left = left + 'px';
      frame.style.top = top + 'px';
      frame.style.right = 'auto';
      frame.style.bottom = 'auto';
    });

    track(resize, function (dx, dy, origin) {
      var rect = stageBox();
      if (!rect) {
        return;
      }
      var width = clampBox(origin.width + dx, 144, rect.width * 0.86);
      var height = clampBox(origin.height + dy, 128, rect.height * 0.72);
      var maxLeft = Math.max(8, rect.width - width - 8);
      var maxTop = Math.max(8, rect.height - height - 8);
      frame.style.width = width + 'px';
      frame.style.height = height + 'px';
      frame.style.left = clampBox(origin.left, 8, maxLeft) + 'px';
      frame.style.top = clampBox(origin.top, 8, maxTop) + 'px';
      frame.style.right = 'auto';
      frame.style.bottom = 'auto';
    });
  }

  function ensureMiniMap() {
    var el = document.getElementById('video-minimap');
    if (!el || mini.map || !global.L || !global.GpsTiles) {
      return;
    }
    mini.map = global.L.map(el, {
      attributionControl: true,
      zoomControl: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      touchZoom: true
    });
    global.GpsTiles.createTileLayer(global.L).addTo(mini.map);
    mini.map.setView([20, 0], 2);
    drawMiniTrack();
  }

  function syncMiniMap() {
    var el = document.getElementById('video-minimap-frame');
    var app = document.getElementById('map-app');
    if (!el) {
      return;
    }
    var on = overlayOn('miniMap') && app && app.classList.contains('is-video');
    el.hidden = !on;
    if (on) {
      applyMiniFrame();
    }
    if (!on) {
      return;
    }
    ensureMiniMap();
    if (!mini.map) {
      return;
    }
    var attempt = 0;
    var fit = function () {
      if (!mini.map) {
        return;
      }
      mini.map.invalidateSize();
      var size = mini.map.getSize();
      if ((!size || size.x < 20) && attempt < 6) {
        attempt += 1;
        global.requestAnimationFrame(fit);
        return;
      }
      if (mini.fitted || !size || size.x < 20) {
        return;
      }
      if (mini.line) {
        mini.map.fitBounds(mini.line.getBounds(), { padding: [18, 18], maxZoom: 16 });
        mini.fitted = true;
      } else if (state.points.length) {
        mini.map.setView([state.points[0].lat, state.points[0].lon], 15);
        mini.fitted = true;
      }
    };
    global.requestAnimationFrame(fit);
  }

  function showMiniMarker(lat, lon) {
    if (!mini.map || !global.L) {
      return;
    }
    var latlng = [lat, lon];
    if (!mini.marker) {
      mini.marker = global.L.circleMarker(latlng, {
        radius: 7,
        color: '#ffffff',
        weight: 3,
        fillColor: '#c2410c',
        fillOpacity: 1,
        interactive: false
      }).addTo(mini.map);
    } else {
      mini.marker.setLatLng(latlng);
    }
    var bounds = mini.map.getBounds();
    if (bounds && bounds.isValid() && !bounds.pad(-0.25).contains(latlng)) {
      mini.map.panTo(latlng, { animate: false });
    }
  }

  function metricText(key, fix, video) {
    if (key === 'time') {
      return formatClock(video.currentTime || 0);
    }
    if (key === 'gForce') {
      var g = gAt((video.currentTime || 0) * 1000);
      return g == null ? '—' : g.toFixed(2) + ' g';
    }
    if (!fix || fix.waiting || !fix.timed) {
      return '—';
    }
    if (key === 'speed') {
      return formatSpeed(fix.speed);
    }
    if (key === 'altitude') {
      return formatAlt(fix.ele);
    }
    if (key === 'distance') {
      return formatDistance(fix.dist);
    }
    if (key === 'verticalSpeed') {
      return formatSpeed(fix.vspeed);
    }
    return '—';
  }

  function paintOverlayToggles() {
    var i;
    for (i = 0; i < OVERLAYS.length; i++) {
      var item = OVERLAYS[i];
      var button = document.querySelector('#video-toggles [data-overlay="' + item.key + '"]');
      if (!button) {
        continue;
      }
      var available = !item.needs || !!state[item.needs];
      button.hidden = !available;
      var on = available && overlayOn(item.key);
      button.setAttribute('aria-pressed', on ? 'true' : 'false');
      button.classList.toggle('is-active', on);
    }
  }

  function paintVideo() {
    var stage = document.getElementById('video-stage');
    var video = videoEl();
    if (!stage || stage.hidden || !video) {
      return;
    }
    var ms = (video.currentTime || 0) * 1000;
    var fix = sampleAt(state.points, ms);
    var wait = document.getElementById('video-wait');
    if (wait) {
      if (!state.points.length || !fix.timed) {
        wait.hidden = !state.videoUrl;
        wait.textContent = state.points.length ? 'No video timing on this track.' : 'Waiting for GPS fix';
      } else if (fix.waiting) {
        wait.hidden = false;
        wait.textContent = 'Waiting for GPS fix';
      } else {
        wait.hidden = true;
      }
    }
    var i;
    for (i = 0; i < OVERLAYS.length; i++) {
      var item = OVERLAYS[i];
      if (item.key === 'miniMap') {
        continue;
      }
      var chip = document.querySelector('#video-metrics [data-metric="' + item.key + '"]');
      if (!chip) {
        continue;
      }
      var available = !item.needs || !!state[item.needs];
      chip.hidden = !available || !overlayOn(item.key);
      var value = chip.querySelector('.metric-value');
      if (value) {
        value.textContent = metricText(item.key, fix, video);
      }
    }
    if (!overlayOn('miniMap') || !mini.map || fix.waiting || !fix.timed) {
      hideMiniMarker();
      return;
    }
    showMiniMarker(fix.lat, fix.lon);
  }

  function applyView(mode, persist) {
    var app = document.getElementById('map-app');
    var stage = document.getElementById('video-stage');
    var video = videoEl();
    if (!app || !stage) {
      return;
    }
    var want = mode === 'video' && !!state.videoUrl;
    if (!want && video && !video.paused) {
      resumePlay = true;
      video.pause();
    }
    app.classList.toggle('is-video', want);
    stage.hidden = !want;
    paintViewSwitch(want);
    if (persist && global.GpsUiState) {
      global.GpsUiState.update(function (current) {
        current.view = want ? 'video' : 'map';
      });
    }
    if (!want) {
      stopLoop();
      if (global.GpsMapShell) {
        global.GpsMapShell.invalidate();
      }
      return;
    }
    syncMiniMap();
    paintVideo();
    if (video && resumePlay) {
      resumePlay = false;
      var pending = video.play();
      if (pending && typeof pending.catch === 'function') {
        pending.catch(function () {});
      }
    } else if (video && !video.paused) {
      startLoop();
    }
  }

  function releaseVideo() {
    stopLoop();
    resumePlay = false;
    var video = videoEl();
    if (video) {
      video.pause();
      video.removeAttribute('src');
      video.load();
    }
    if (state.videoUrl) {
      URL.revokeObjectURL(state.videoUrl);
      state.videoUrl = null;
    }
    showViewSwitch(false);
    applyView('map', false);
  }

  function attachVideoFile(file) {
    var video = videoEl();
    if (!video || !file) {
      return;
    }
    state.videoUrl = URL.createObjectURL(file);
    video.src = state.videoUrl;
  }

  function onTrackReady() {
    paintSeriesAvailability();
    paintOverlayToggles();
    drawMiniTrack();
    if (!state.videoUrl) {
      showViewSwitch(false);
      applyView('map', false);
      return;
    }
    showViewSwitch(true);
    var saved = global.GpsUiState && global.GpsUiState.load();
    applyView(saved && saved.view === 'video' ? 'video' : 'map', false);
  }

  function metricsLayout() {
    var saved = global.GpsUiState && global.GpsUiState.load();
    return saved && saved.metricsLayout === 'column' ? 'column' : 'row';
  }

  function paintMetricsLayout() {
    var metrics = document.getElementById('video-metrics');
    var layout = metricsLayout();
    if (metrics) {
      metrics.classList.toggle('is-column', layout === 'column');
    }
    var buttons = document.querySelectorAll('[data-metrics-layout]');
    var i;
    for (i = 0; i < buttons.length; i++) {
      var on = buttons[i].getAttribute('data-metrics-layout') === layout;
      buttons[i].setAttribute('aria-pressed', on ? 'true' : 'false');
      buttons[i].classList.toggle('is-active', on);
    }
  }

  function setMetricsLayout(layout) {
    var next = layout === 'column' ? 'column' : 'row';
    if (global.GpsUiState) {
      global.GpsUiState.update(function (current) {
        current.metricsLayout = next;
      });
    }
    paintMetricsLayout();
  }

  function setOverlay(key, on) {
    if (global.GpsUiState) {
      global.GpsUiState.update(function (current) {
        current.videoOverlay[key] = !!on;
      });
    }
    paintOverlayToggles();
    if (key === 'miniMap') {
      syncMiniMap();
    }
    paintVideo();
  }

  function fullscreenTarget() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
  }

  function paintFullscreenButton() {
    var button = document.getElementById('video-fullscreen');
    var stage = document.getElementById('video-stage');
    if (!button) {
      return;
    }
    var on = !!(stage && fullscreenTarget() === stage);
    button.textContent = on ? 'Exit fullscreen' : 'Fullscreen';
    button.setAttribute('aria-pressed', on ? 'true' : 'false');
  }

  function toggleFullscreen() {
    var stage = document.getElementById('video-stage');
    if (!stage) {
      return;
    }
    if (fullscreenTarget() === stage) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
      return;
    }
    if (stage.requestFullscreen) {
      stage.requestFullscreen();
    } else if (stage.webkitRequestFullscreen) {
      stage.webkitRequestFullscreen();
    }
  }

  function setVideoMenu(open) {
    var menu = document.getElementById('video-menu');
    var button = document.getElementById('video-menu-btn');
    if (!menu || !button) {
      return;
    }
    menu.hidden = !open;
    button.classList.toggle('is-active', open);
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  function mountVideo() {
    var host = document.getElementById('topbar-tools');
    var toggles = document.getElementById('video-toggles');
    var metrics = document.getElementById('video-metrics');
    var video = videoEl();
    if (!host || !toggles || !metrics || !video || host.querySelector('#view-switch')) {
      return;
    }
    host.innerHTML =
      '<div id="view-switch" class="view-switch" role="group" aria-label="View">' +
      '<button type="button" id="view-map" aria-pressed="true">Map</button>' +
      '<button type="button" id="view-video" aria-pressed="false">Video</button>' +
      '</div>';
    document.getElementById('view-map').addEventListener('click', function () {
      applyView('map', true);
    });
    document.getElementById('view-video').addEventListener('click', function () {
      if (state.videoUrl) {
        applyView('video', true);
      }
    });

    var i;
    for (i = 0; i < OVERLAYS.length; i++) {
      var item = OVERLAYS[i];
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'chip';
      button.setAttribute('data-overlay', item.key);
      button.textContent = item.label;
      button.addEventListener('click', function (event) {
        var key = event.currentTarget.getAttribute('data-overlay');
        setOverlay(key, !overlayOn(key));
      });
      toggles.appendChild(button);
      if (item.key === 'miniMap') {
        continue;
      }
      var chip = document.createElement('div');
      chip.className = 'metric';
      chip.setAttribute('data-metric', item.key);
      var label = document.createElement('span');
      label.className = 'metric-label';
      label.textContent = item.label;
      var value = document.createElement('span');
      value.className = 'metric-value';
      value.textContent = '—';
      chip.appendChild(label);
      chip.appendChild(value);
      metrics.appendChild(chip);
    }
    paintOverlayToggles();
    paintMetricsLayout();
    bindMiniFrame();

    var menuBtn = document.getElementById('video-menu-btn');
    if (menuBtn) {
      menuBtn.addEventListener('click', function () {
        var menu = document.getElementById('video-menu');
        setVideoMenu(!menu || menu.hidden);
      });
    }
    var layoutButtons = document.querySelectorAll('[data-metrics-layout]');
    for (i = 0; i < layoutButtons.length; i++) {
      layoutButtons[i].addEventListener('click', function (event) {
        setMetricsLayout(event.currentTarget.getAttribute('data-metrics-layout'));
      });
    }
    document.addEventListener('click', function (event) {
      var menu = document.getElementById('video-menu');
      var wrap = document.querySelector('.video-menu-wrap');
      if (!menu || menu.hidden || !wrap || wrap.contains(event.target)) {
        return;
      }
      setVideoMenu(false);
    });
    global.addEventListener('resize', function () {
      applyMiniFrame();
      if (mini.map) {
        mini.map.invalidateSize();
      }
    });

    var fs = document.getElementById('video-fullscreen');
    if (fs) {
      fs.addEventListener('click', toggleFullscreen);
    }
    document.addEventListener('fullscreenchange', function () {
      paintFullscreenButton();
      syncMiniMap();
    });
    document.addEventListener('webkitfullscreenchange', function () {
      paintFullscreenButton();
      syncMiniMap();
    });

    video.addEventListener('play', startLoop);
    video.addEventListener('pause', function () {
      stopLoop();
      paintVideo();
    });
    video.addEventListener('seeked', paintVideo);
    video.addEventListener('ratechange', paintVideo);
    video.addEventListener('ended', function () {
      stopLoop();
      resumePlay = false;
      paintVideo();
    });
    video.addEventListener('timeupdate', function () {
      if (!loopOn) {
        paintVideo();
      }
    });
    global.addEventListener('pagehide', releaseVideo);
  }

  function bindLandingDrop() {
    if (!document.getElementById('tool-landing') || !global.GpsFileDrop || global.GpsFileDrop.bound) {
      return;
    }
    global.GpsFileDrop.init({
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
    mountCharts();
    mountPanels();
    mountProgress();
    mountVideo();
    bindLandingDrop();
    bindUi();
    paintUnits();
    selfCheckSync();
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
})(window);
