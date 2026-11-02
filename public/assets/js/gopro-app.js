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
  var charts = { speed: null, altitude: null };
  var state = {
    points: [],
    smooth: [],
    idx: [],
    name: 'track',
    timed: false
  };

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

  function timeOf(sample) {
    if (!sample) {
      return null;
    }
    if (sample.date != null) {
      var date = sample.date instanceof Date ? sample.date : new Date(sample.date);
      var ms = date.getTime();
      if (isFinite(ms)) {
        return ms;
      }
    }
    if (typeof sample.cts === 'number' && isFinite(sample.cts)) {
      return sample.cts;
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
    if (openBtn) {
      openBtn.textContent = 'Replace file';
    }
    if (nameEl) {
      nameEl.hidden = false;
      nameEl.textContent = name;
    }
  }

  function showError(message) {
    var el = document.getElementById('empty-error');
    if (!el) {
      return;
    }
    el.hidden = !message;
    el.textContent = message || '';
  }

  function clearError() {
    showError('');
  }

  function setProgress(pct, label) {
    var box = document.getElementById('map-progress');
    var bar = document.getElementById('progress-bar');
    var text = document.getElementById('progress-label');
    var track = document.getElementById('progress-track');
    var clamped = Math.max(0, Math.min(100, Math.round(pct)));
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

  function hideProgress() {
    var box = document.getElementById('map-progress');
    if (box) {
      box.hidden = true;
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
    if (charts.speed) {
      charts.speed.destroy();
      charts.speed = null;
    }
    if (charts.altitude) {
      charts.altitude.destroy();
      charts.altitude = null;
    }
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
    var speedPane = document.getElementById('pane-speed');
    var altPane = document.getElementById('pane-altitude');
    if (charts.speed && speedPane && !speedPane.hidden) {
      charts.speed.resize();
    }
    if (charts.altitude && altPane && !altPane.hidden) {
      charts.altitude.resize();
    }
  }

  function renderCharts() {
    destroyCharts();
    var imperial = unitMode() === 'imperial';
    var speedSuffix = imperial ? 'mph' : 'km/h';
    var altSuffix = imperial ? 'ft' : 'm';
    var speedFactor = imperial ? 2.2369362920544 : 3.6;
    var altFactor = imperial ? 3.280839895013123 : 1;
    var speeds = state.smooth;
    var alts = state.points.map(function (point) {
      return point.ele;
    });

    if (anyNumber(speeds)) {
      var maxSpeed = maxOf(speeds);
      var meters = totalDistance(state.points);
      var elapsed = durationMs(state.points);
      var average = elapsed ? meters / (elapsed / 1000) : null;
      setSummary('speed-summary', 'Max ' + formatSpeed(maxSpeed) + ' · average ' + formatSpeed(average));
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
    var buttons = document.querySelectorAll('#stats-panel [data-units]');
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
    removeLayers();
    destroyCharts();
    setExportEnabled(false);
    renderStats();
    setSummary('speed-summary', 'Speed appears here after a video is opened.');
    setSummary('altitude-summary', 'Altitude appears here after a video is opened.');
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
      showError('No GPS track in this file. GPS has to be on in the camera while it records.');
      if (global.GpsMapShell) {
        global.GpsMapShell.setEmpty(true);
      }
      return;
    }
    state.points = points;
    state.name = name;
    state.timed = hasTimes(points);
    state.smooth = median(points.map(function (point) {
      return point.speed;
    }), 5);
    state.idx = thinIndices(points.length, CHART_POINTS);
    clearError();
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
  }

  function pointsFromTelemetry(result) {
    var samples = [];
    var devices = [];
    if (Array.isArray(result)) {
      devices = result;
    } else if (result && typeof result === 'object') {
      if (result.streams) {
        devices = [result];
      } else {
        var keys = Object.keys(result);
        var k;
        for (k = 0; k < keys.length; k++) {
          var device = result[keys[k]];
          if (device && typeof device === 'object' && device.streams) {
            devices.push(device);
          }
        }
      }
    }
    var d;
    for (d = 0; d < devices.length; d++) {
      var streams = devices[d].streams;
      var stream = streams.GPS9 || streams.GPS5 || streams.GPS;
      if (!stream || !stream.samples) {
        continue;
      }
      var s;
      for (s = 0; s < stream.samples.length; s++) {
        samples.push(stream.samples[s]);
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
        t: timeOf(sample)
      });
    }
    points.sort(function (a, b) {
      if (a.t == null && b.t == null) {
        return 0;
      }
      if (a.t == null) {
        return 1;
      }
      if (b.t == null) {
        return -1;
      }
      return a.t - b.t;
    });
    fillMissingSpeed(points);
    return points;
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
        stream: ['GPS'],
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
      var points = pointsFromTelemetry(telemetry);
      showTrack(id, points, stem(file.name));
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
      showError(message);
      if (global.GpsMapShell) {
        global.GpsMapShell.setEmpty(true);
      }
    });
  }

  function onPickedFile(file) {
    var id = nextJob();
    clearError();
    if (!acceptedFile(file)) {
      clearTrack();
      showError('Choose a GoPro video (.mp4 or .lrv).');
      if (global.GpsMapShell) {
        global.GpsMapShell.setEmpty(true);
      }
      return;
    }
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
        var chartName = canvasId === 'chart-speed' ? 'speed' : 'altitude';
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
    var buttons = document.querySelectorAll('#stats-panel [data-units]');
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
    document.addEventListener('gpstoolset:dock', function () {
      global.requestAnimationFrame(resizeCharts);
    });
    ['pane-speed', 'pane-altitude'].forEach(function (id) {
      var pane = document.getElementById(id);
      if (pane) {
        pane.addEventListener('mouseleave', hideScrub);
      }
    });
  }

  function init() {
    mountCharts();
    mountPanels();
    mountProgress();
    bindUi();
    paintUnits();
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
