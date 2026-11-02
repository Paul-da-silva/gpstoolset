/**
 * Coordinate converter (ES module). Glue only.
 *
 * Decimal, DMS, DDM, UTM, and MGRS stay in this tab. The preview map
 * uses the shared tile module. Nothing is uploaded.
 *
 * Page: tools/coordinate-converter/
 */
import { createTileLayer } from '../map/tiles.js';
import { parseCoordinate, formatsFromLatLon, dmsParts, ddmParts } from '../core/coords.js';

var format = 'decimal';
var point = null;
var accuracy = 1;
var view = null;
var map = null;
var marker = null;
var lock = false;
var mapTimer = 0;
var copyTimer = 0;

function $(id) {
  return document.getElementById(id);
}

function hemi(value, isLat) {
  if (isLat) return value < 0 ? 'S' : 'N';
  return value < 0 ? 'W' : 'E';
}

function field(id) {
  var el = $(id);
  return el ? el.value.trim() : '';
}

function setField(id, value) {
  var el = $(id);
  if (el) el.value = value;
}

function showError(message) {
  var el = $('coord-error');
  if (!el) return;
  el.hidden = !message;
  el.textContent = message || '';
}

function setFormat(next) {
  format = next;
  var buttons = document.querySelectorAll('[data-format]');
  var panels = document.querySelectorAll('[data-panel]');
  var i;
  for (i = 0; i < buttons.length; i++) {
    var on = buttons[i].getAttribute('data-format') === next;
    buttons[i].setAttribute('aria-pressed', on ? 'true' : 'false');
  }
  for (i = 0; i < panels.length; i++) {
    panels[i].hidden = panels[i].getAttribute('data-panel') !== next;
  }
}

function readAngle(prefix, withSeconds) {
  var latIds = withSeconds
    ? [prefix + '-lat-d', prefix + '-lat-m', prefix + '-lat-s']
    : [prefix + '-lat-d', prefix + '-lat-m'];
  var lonIds = withSeconds
    ? [prefix + '-lon-d', prefix + '-lon-m', prefix + '-lon-s']
    : [prefix + '-lon-d', prefix + '-lon-m'];
  var bits = latIds.concat(lonIds);
  var any = false;
  var full = true;
  var i;
  for (i = 0; i < bits.length; i++) {
    if (field(bits[i]) !== '') any = true;
    else full = false;
  }
  if (!any) return { empty: true };
  if (!full) return { partial: true };
  var latText = latIds.map(field).join(' ') + ' ' + field(prefix + '-lat-h');
  var lonText = lonIds.map(field).join(' ') + ' ' + field(prefix + '-lon-h');
  return parseCoordinate(latText + ', ' + lonText);
}

function readActive() {
  if (format === 'decimal') {
    var lat = field('dec-lat');
    var lon = field('dec-lon');
    if (lat === '' && lon === '') return { empty: true };
    if (lat === '' || lon === '') return { partial: true };
    return parseCoordinate(lat + ', ' + lon);
  }
  if (format === 'dms') return readAngle('dms', true);
  if (format === 'ddm') return readAngle('ddm', false);
  if (format === 'utm') {
    var zone = field('utm-zone');
    var band = field('utm-band');
    var east = field('utm-e');
    var north = field('utm-n');
    if (zone === '' && band === '' && east === '' && north === '') return { empty: true };
    if (zone === '' || band === '' || east === '' || north === '') return { partial: true };
    return parseCoordinate(zone + band + ' ' + east + ' ' + north);
  }
  var mgrs = field('mgrs-text');
  if (mgrs === '') return { empty: true };
  return parseCoordinate(mgrs);
}

function fillForm(lat, lon) {
  var current = formatsFromLatLon(lat, lon);
  lock = true;
  if (format === 'decimal') {
    setField('dec-lat', lat.toFixed(7));
    setField('dec-lon', lon.toFixed(7));
  } else if (format === 'dms') {
    var latDms = dmsParts(lat);
    var lonDms = dmsParts(lon);
    setField('dms-lat-d', String(latDms.deg));
    setField('dms-lat-m', String(latDms.min));
    setField('dms-lat-s', latDms.sec.toFixed(2));
    setField('dms-lat-h', hemi(lat, true));
    setField('dms-lon-d', String(lonDms.deg));
    setField('dms-lon-m', String(lonDms.min));
    setField('dms-lon-s', lonDms.sec.toFixed(2));
    setField('dms-lon-h', hemi(lon, false));
  } else if (format === 'ddm') {
    var latDdm = ddmParts(lat);
    var lonDdm = ddmParts(lon);
    setField('ddm-lat-d', String(latDdm.deg));
    setField('ddm-lat-m', latDdm.min.toFixed(4));
    setField('ddm-lat-h', hemi(lat, true));
    setField('ddm-lon-d', String(lonDdm.deg));
    setField('ddm-lon-m', lonDdm.min.toFixed(4));
    setField('ddm-lon-h', hemi(lon, false));
  } else if (format === 'utm') {
    if (!current.utmRaw) {
      setField('utm-zone', '');
      setField('utm-band', '');
      setField('utm-e', '');
      setField('utm-n', '');
    } else {
      setField('utm-zone', String(current.utmRaw.zone));
      setField('utm-band', current.utmRaw.band);
      setField('utm-e', current.utmRaw.easting.toFixed(2));
      setField('utm-n', current.utmRaw.northing.toFixed(2));
    }
  } else {
    setField('mgrs-text', current.mgrs);
  }
  lock = false;
}

function squareLabel(meters) {
  if (meters >= 1000) return (meters / 1000) + ' km';
  return meters + ' m';
}

function showResults(lat, lon) {
  view = formatsFromLatLon(lat, lon);
  $('out-decimal').textContent = view.decimal;
  $('out-dms').textContent = view.dms;
  $('out-ddm').textContent = view.ddm;
  $('out-utm').textContent = view.utm || 'Not used past 80°S or 84°N.';
  $('out-utm-note').textContent = view.utm ? view.utmNote : '';
  $('out-mgrs').textContent = view.mgrs || view.mgrsNote;
  var mgrsNote = view.mgrs ? '1 m square.' : '';
  if (view.mgrs && accuracy > 1) {
    mgrsNote = 'Centre of the ' + squareLabel(accuracy) + ' square you entered. The line above is the 1 m square.';
  }
  $('out-mgrs-note').textContent = mgrsNote;
  $('coord-results').hidden = false;
  $('coord-empty').hidden = true;
  var buttons = document.querySelectorAll('[data-copy]');
  var i;
  for (i = 0; i < buttons.length; i++) {
    var key = buttons[i].getAttribute('data-copy');
    var enabled = key === 'all' || key === 'decimal' || key === 'dms' || key === 'ddm';
    if (key === 'utm') enabled = !!view.utm;
    if (key === 'mgrs') enabled = !!view.mgrs;
    buttons[i].disabled = !enabled;
  }
}

function hideResults() {
  view = null;
  point = null;
  accuracy = 1;
  var results = $('coord-results');
  var empty = $('coord-empty');
  if (results) results.hidden = true;
  if (empty) empty.hidden = false;
}

function writeUrl() {
  var url = new URL(window.location.href);
  if (!point) url.searchParams.delete('ll');
  else url.searchParams.set('ll', point.lat.toFixed(7) + ',' + point.lon.toFixed(7));
  var next = url.pathname + url.search + url.hash;
  var current = window.location.pathname + window.location.search + window.location.hash;
  if (next !== current) history.replaceState(null, '', next);
}

function clearMarker() {
  clearTimeout(mapTimer);
  if (marker && map) {
    map.removeLayer(marker);
    marker = null;
  }
}

function moveMarker(lat, lon, immediate) {
  if (!map || !window.L) return;
  var draw = function () {
    if (!point) return;
    var ll = [lat, lon];
    if (!marker) {
      marker = window.L.circleMarker(ll, {
        radius: 7,
        color: '#ffffff',
        weight: 3,
        fillColor: '#115e59',
        fillOpacity: 1
      }).addTo(map);
      map.setView(ll, 14);
    } else {
      marker.setLatLng(ll);
      if (!map.getBounds().contains(ll)) map.panTo(ll);
    }
  };
  clearTimeout(mapTimer);
  if (immediate) draw();
  else mapTimer = setTimeout(draw, 120);
}

function setPoint(lat, lon, options) {
  options = options || {};
  point = { lat: lat, lon: lon };
  accuracy = options.accuracy || 1;
  showError('');
  showResults(lat, lon);
  moveMarker(lat, lon, !!options.immediate);
  if (!options.keepForm) fillForm(lat, lon);
  writeUrl();
}

function clearPoint() {
  hideResults();
  showError('');
  clearMarker();
  writeUrl();
}

function applyForm() {
  var parsed = readActive();
  if (parsed.empty) {
    clearPoint();
    return;
  }
  if (parsed.partial) {
    showError('');
    hideResults();
    clearMarker();
    writeUrl();
    return;
  }
  if (!parsed.ok) {
    showError(parsed.error);
    hideResults();
    clearMarker();
    writeUrl();
    return;
  }
  setPoint(parsed.lat, parsed.lon, {
    keepForm: true,
    accuracy: parsed.accuracy || 1
  });
}

function clearPaste() {
  var paste = $('coord-paste');
  if (!paste || paste.value === '') return;
  lock = true;
  paste.value = '';
  lock = false;
}

function onPaste() {
  if (lock) return;
  var parsed = parseCoordinate($('coord-paste').value);
  if (parsed.empty || parsed.partial) {
    showError('');
    return;
  }
  if (!parsed.ok) {
    showError(parsed.error);
    return;
  }
  setFormat(parsed.format);
  setPoint(parsed.lat, parsed.lon, {
    accuracy: parsed.accuracy || 1,
    immediate: true
  });
}

function allText() {
  if (!view) return '';
  var lines = [
    'Decimal: ' + view.decimal,
    'DMS: ' + view.dms,
    'DDM: ' + view.ddm
  ];
  if (view.utm) lines.push('UTM: ' + view.utm);
  if (view.mgrs) lines.push('MGRS: ' + view.mgrs);
  return lines.join('\n');
}

function copyValue(key) {
  if (!view) return '';
  if (key === 'all') return allText();
  return view[key] || '';
}

function fallbackCopy(text) {
  var area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.left = '-9999px';
  document.body.appendChild(area);
  area.select();
  var ok = false;
  try {
    ok = document.execCommand('copy');
  } catch (error) {
    ok = false;
  }
  document.body.removeChild(area);
  return ok;
}

function copyText(text, button) {
  var done = function () {
    var previous = button.textContent;
    button.textContent = 'Copied';
    clearTimeout(copyTimer);
    copyTimer = setTimeout(function () {
      button.textContent = previous;
    }, 1200);
  };
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(done).catch(function () {
      if (fallbackCopy(text)) done();
    });
    return;
  }
  if (fallbackCopy(text)) done();
}

function initMap() {
  var host = $('coord-map');
  if (!host || !window.L) return;
  map = window.L.map(host, {
    scrollWheelZoom: false,
    attributionControl: true
  }).setView([20, 0], 2);
  createTileLayer(window.L).addTo(map);
  map.on('click', function (event) {
    clearPaste();
    setPoint(event.latlng.lat, event.latlng.lng, { immediate: true, accuracy: 1 });
  });
  window.addEventListener('resize', function () {
    map.invalidateSize();
  });
  setTimeout(function () {
    map.invalidateSize();
  }, 0);
}

function boot() {
  var form = $('coord-form');
  if (!form) return;
  form.addEventListener('submit', function (event) {
    event.preventDefault();
  });
  form.addEventListener('input', function (event) {
    if (lock) return;
    if (event.target && event.target.id === 'coord-paste') {
      onPaste();
      return;
    }
    clearPaste();
    applyForm();
  });
  form.addEventListener('change', function () {
    if (lock) return;
    clearPaste();
    applyForm();
  });

  var buttons = document.querySelectorAll('[data-format]');
  var i;
  for (i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', function (event) {
      var next = event.currentTarget.getAttribute('data-format');
      setFormat(next);
      clearPaste();
      if (point) fillForm(point.lat, point.lon);
      var panel = document.querySelector('[data-panel="' + format + '"] input');
      if (panel) panel.focus();
    });
  }

  var copies = document.querySelectorAll('[data-copy]');
  for (i = 0; i < copies.length; i++) {
    copies[i].addEventListener('click', function (event) {
      var key = event.currentTarget.getAttribute('data-copy');
      var text = copyValue(key);
      if (text) copyText(text, event.currentTarget);
    });
  }

  try {
    initMap();
  } catch (error) {
    var hint = $('coord-map-hint');
    if (hint) hint.textContent = 'The map did not start. You can still type a coordinate.';
  }

  var params = new URLSearchParams(window.location.search);
  var ll = params.get('ll');
  if (ll) {
    var parsed = parseCoordinate(ll);
    if (parsed.ok) {
      setFormat('decimal');
      setPoint(parsed.lat, parsed.lon, { immediate: true, accuracy: 1 });
    }
  }
}

boot();
