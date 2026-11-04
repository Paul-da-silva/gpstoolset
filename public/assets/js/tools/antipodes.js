/**
 * Antipodes calculator (ES module).
 *
 * The left map is the point you pick. The right map is the opposite
 * side of the Earth: latitude flips sign, longitude shifts by 180°.
 * A click marks both points, centres the left map on the click, and
 * pans the right map to the antipode at the same zoom.
 * The point stays in this tab (sessionStorage gpstoolset.antipodes.v1).
 * Dock height uses gpstoolset.ui.v1. Nothing is uploaded.
 *
 * Tiles come from map/tiles.js only.
 * Page: tools/antipodes/
 */
import * as uiState from '../core/ui-state.js';
import { formatDms } from '../core/coords.js';
import { createTileLayer } from '../map/tiles.js';

var SESSION_KEY = 'gpstoolset.antipodes.v1';
var MIN_DOCK = 120;
var MIN_ZOOM = 4;
var WORLD = { lat: 20, lon: 0, zoom: 2 };

var point = null;
var pickMarker = null;
var antiMarker = null;
var mapPick = null;
var mapAnti = null;
var suppressClick = false;
var draggingPoint = false;
var draggingDock = false;
var dockHeight = 280;
var dockStartY = 0;
var dockStartH = 0;
var copyTimer = 0;

function $(id) {
  return document.getElementById(id);
}

function setStatus(message) {
  var el = $('antipodes-status');
  if (el) {
    el.textContent = message || '';
  }
}

function wrapLon(lon) {
  var x = lon;
  while (x > 180) {
    x -= 360;
  }
  while (x < -180) {
    x += 360;
  }
  return x;
}

function antipodeOf(here) {
  return {
    lat: -here.lat,
    lon: wrapLon(here.lon + 180)
  };
}

function hemi(value, positive, negative) {
  var abs = Math.abs(value);
  var text = abs.toFixed(5) + '°';
  if (value < 0) {
    return text + ' ' + negative;
  }
  return text + ' ' + positive;
}

function formatPoint(here) {
  return hemi(here.lat, 'N', 'S') + ', ' + hemi(here.lon, 'E', 'W');
}

function isMobile() {
  return window.matchMedia('(max-width: 720px)').matches;
}

function maxDock() {
  var ratio = isMobile() ? 0.4 : 0.45;
  var byRatio = Math.round(window.innerHeight * ratio);
  var header = document.querySelector('.topbar');
  var headerH = header ? header.offsetHeight : 0;
  var byRoom = window.innerHeight - headerH - 160;
  var max = Math.min(byRatio, byRoom);
  if (max < MIN_DOCK) {
    max = MIN_DOCK;
  }
  return max;
}

function clampDock(height) {
  var n = Math.round(Number(height));
  if (!isFinite(n)) {
    n = 280;
  }
  if (n < MIN_DOCK) {
    n = MIN_DOCK;
  }
  var max = maxDock();
  if (n > max) {
    n = max;
  }
  return n;
}

function applyDockHeight(height, save) {
  var dock = $('antipodes-dock');
  var handle = $('antipodes-handle');
  dockHeight = clampDock(height);
  if (dock) {
    dock.style.height = dockHeight + 'px';
  }
  if (handle) {
    handle.setAttribute('aria-valuemin', String(MIN_DOCK));
    handle.setAttribute('aria-valuenow', String(dockHeight));
    handle.setAttribute('aria-valuemax', String(maxDock()));
  }
  if (save) {
    uiState.update(function (current) {
      current.antipodes.height = dockHeight;
    });
  }
  invalidateMaps();
}

function pinIcon(kind) {
  return window.L.divIcon({
    className: 'leaflet-div-icon antipodes-pin antipodes-pin-' + kind,
    html: '<span></span>',
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });
}

function createMap(id, zoomPosition, attributionPosition, doubleClickZoom) {
  var el = $(id);
  if (!el || !window.L) {
    throw new Error('Leaflet is required before the antipodes maps start.');
  }
  var tiles = createTileLayer(window.L);
  var map = window.L.map(el, {
    attributionControl: false,
    zoomControl: false,
    scrollWheelZoom: true,
    doubleClickZoom: doubleClickZoom,
    maxZoom: tiles.options.maxZoom || 19
  });
  window.L.control.zoom({ position: zoomPosition }).addTo(map);
  window.L.control.attribution({ position: attributionPosition }).addTo(map);
  tiles.addTo(map);
  map.setView([WORLD.lat, WORLD.lon], WORLD.zoom);
  return map;
}

function invalidateMaps() {
  if (mapPick) {
    mapPick.invalidateSize();
  }
  if (mapAnti) {
    mapAnti.invalidateSize();
  }
}

function viewZoom(map) {
  var zoom = map.getZoom();
  if (zoom < MIN_ZOOM) {
    return MIN_ZOOM;
  }
  return zoom;
}

function showOn(map, here, zoom, animate) {
  map.setView([here.lat, here.lon], zoom, { animate: animate });
}

function placeMarkers(here, anti) {
  if (!pickMarker) {
    pickMarker = window.L.marker([here.lat, here.lon], {
      icon: pinIcon('pick'),
      draggable: true,
      autoPan: true,
      keyboard: false,
      title: 'Your point. Drag to move.'
    });
    pickMarker.on('dragstart', function () {
      draggingPoint = true;
      suppressClick = true;
    });
    pickMarker.on('drag', function (event) {
      var ll = event.target.getLatLng();
      var next = { lat: ll.lat, lon: ll.lng };
      var antiNow = antipodeOf(next);
      point = next;
      if (antiMarker) {
        antiMarker.setLatLng([antiNow.lat, antiNow.lon]);
      }
      paintReadout();
    });
    pickMarker.on('dragend', function () {
      draggingPoint = false;
      if (point) {
        showOn(mapAnti, antipodeOf(point), mapPick.getZoom(), true);
      }
      persist();
      window.setTimeout(function () {
        suppressClick = false;
      }, 40);
    });
    pickMarker.on('click', function (event) {
      window.L.DomEvent.stopPropagation(event);
      suppressClick = true;
      window.setTimeout(function () {
        suppressClick = false;
      }, 40);
    });
    pickMarker.addTo(mapPick);
  } else {
    pickMarker.setLatLng([here.lat, here.lon]);
  }

  if (!antiMarker) {
    antiMarker = window.L.marker([anti.lat, anti.lon], {
      icon: pinIcon('anti'),
      keyboard: false,
      interactive: false,
      title: 'Other side of the Earth'
    });
    antiMarker.addTo(mapAnti);
  } else {
    antiMarker.setLatLng([anti.lat, anti.lon]);
  }
}

function paintReadout() {
  var here = $('antipodes-here');
  var there = $('antipodes-there');
  var clearBtn = $('antipodes-clear');
  var copyBtn = $('antipodes-copy');
  var note = document.querySelector('.antipodes-note');
  var has = !!point;
  if (here) {
    here.textContent = has ? formatPoint(point) : 'Click the left map';
  }
  if (there) {
    there.textContent = has ? formatPoint(antipodeOf(point)) : '—';
  }
  if (note) {
    note.hidden = has;
  }
  if (clearBtn) {
    clearBtn.disabled = !has;
  }
  if (copyBtn) {
    copyBtn.disabled = !has;
  }
}

function summaryText() {
  var anti = antipodeOf(point);
  return [
    'Antipodes calculator',
    'Your point: ' + formatPoint(point),
    'Other side: ' + formatPoint(anti),
    'Your point (DMS): ' + formatDms(point.lat, point.lon),
    'Other side (DMS): ' + formatDms(anti.lat, anti.lon)
  ].join('\n');
}

function cleanPoint(raw) {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  var lat = Number(raw.lat);
  var lon = Number(raw.lon);
  if (!isFinite(lat) || !isFinite(lon)) {
    return null;
  }
  if (Math.abs(lat) > 90 || Math.abs(lon) > 180) {
    return null;
  }
  return { lat: lat, lon: lon };
}

function cleanView(raw) {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  var lat = Number(raw.lat);
  var lon = Number(raw.lon);
  var zoom = Number(raw.zoom);
  if (!isFinite(lat) || !isFinite(lon) || !isFinite(zoom)) {
    return null;
  }
  if (Math.abs(lat) > 90 || Math.abs(lon) > 180) {
    return null;
  }
  if (zoom < 1) {
    zoom = 1;
  }
  if (zoom > 19) {
    zoom = 19;
  }
  return { lat: lat, lon: lon, zoom: zoom };
}

function restore() {
  var empty = { point: null, pickView: null, antiView: null };
  try {
    var raw = window.sessionStorage.getItem(SESSION_KEY);
    if (!raw) {
      return empty;
    }
    var data = JSON.parse(raw);
    return {
      point: cleanPoint(data && data.point),
      pickView: cleanView(data && data.pickView),
      antiView: cleanView(data && data.antiView)
    };
  } catch (err) {
    return empty;
  }
}

function persist() {
  if (!mapPick || !mapAnti) {
    return;
  }
  var pickCenter = mapPick.getCenter();
  var antiCenter = mapAnti.getCenter();
  var payload = {
    point: point,
    pickView: {
      lat: pickCenter.lat,
      lon: pickCenter.lng,
      zoom: mapPick.getZoom()
    },
    antiView: {
      lat: antiCenter.lat,
      lon: antiCenter.lng,
      zoom: mapAnti.getZoom()
    }
  };
  try {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload));
  } catch (err) {
    /* Private mode still keeps the point until the tab closes. */
  }
}

function selectPoint(here, animate) {
  var anti = antipodeOf(here);
  var zoom = viewZoom(mapPick);
  point = { lat: here.lat, lon: here.lon };
  placeMarkers(point, anti);
  showOn(mapPick, point, zoom, animate);
  showOn(mapAnti, anti, zoom, animate);
  paintReadout();
  persist();
  setStatus('');
}

function clearPoint() {
  point = null;
  if (pickMarker && mapPick) {
    mapPick.removeLayer(pickMarker);
    pickMarker = null;
  }
  if (antiMarker && mapAnti) {
    mapAnti.removeLayer(antiMarker);
    antiMarker = null;
  }
  paintReadout();
  persist();
  setStatus('');
}

function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }
  return new Promise(function (resolve, reject) {
    var area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.left = '-9999px';
    document.body.appendChild(area);
    area.select();
    try {
      var ok = document.execCommand('copy');
      document.body.removeChild(area);
      if (ok) {
        resolve();
      } else {
        reject(new Error('copy'));
      }
    } catch (err) {
      document.body.removeChild(area);
      reject(err);
    }
  });
}

function markCopied() {
  var button = $('antipodes-copy');
  if (!button) {
    return;
  }
  button.textContent = 'Copied';
  if (copyTimer) {
    window.clearTimeout(copyTimer);
  }
  copyTimer = window.setTimeout(function () {
    button.textContent = 'Copy';
    copyTimer = 0;
  }, 1600);
}

function showGuide() {
  document.body.classList.remove('is-map');
  window.scrollTo(0, 0);
}

function showMap() {
  document.body.classList.add('is-map');
  window.scrollTo(0, 0);
  window.requestAnimationFrame(function () {
    invalidateMaps();
    window.requestAnimationFrame(function () {
      invalidateMaps();
    });
  });
}

function locate() {
  var button = $('antipodes-locate');
  if (!navigator.geolocation) {
    setStatus('Location is not available in this browser. Click the left map instead.');
    return;
  }
  if (button) {
    button.disabled = true;
  }
  navigator.geolocation.getCurrentPosition(function (pos) {
    if (button) {
      button.disabled = false;
    }
    selectPoint({
      lat: pos.coords.latitude,
      lon: pos.coords.longitude
    }, true);
    setStatus('Using your location.');
  }, function (err) {
    if (button) {
      button.disabled = false;
    }
    if (err && err.code === 1) {
      setStatus('Location blocked. Click the left map instead.');
      return;
    }
    setStatus('Location unavailable. Click the left map instead.');
  }, {
    enableHighAccuracy: true,
    timeout: 12000,
    maximumAge: 30000
  });
}

function bindDock() {
  var handle = $('antipodes-handle');
  if (!handle) {
    return;
  }
  applyDockHeight(uiState.load().antipodes.height, false);

  handle.addEventListener('pointerdown', function (event) {
    if (event.button != null && event.button !== 0) {
      return;
    }
    draggingDock = true;
    dockStartY = event.clientY;
    dockStartH = dockHeight;
    document.body.classList.add('is-resizing');
    if (handle.setPointerCapture) {
      handle.setPointerCapture(event.pointerId);
    }
    event.preventDefault();
  });

  handle.addEventListener('pointermove', function (event) {
    if (!draggingDock) {
      return;
    }
    applyDockHeight(dockStartH + (dockStartY - event.clientY), false);
  });

  function endDrag(event) {
    if (!draggingDock) {
      return;
    }
    draggingDock = false;
    document.body.classList.remove('is-resizing');
    if (handle.releasePointerCapture && event) {
      try {
        handle.releasePointerCapture(event.pointerId);
      } catch (err) {
        /* capture may already be gone */
      }
    }
    applyDockHeight(dockHeight, true);
  }

  handle.addEventListener('pointerup', endDrag);
  handle.addEventListener('pointercancel', endDrag);

  handle.addEventListener('keydown', function (event) {
    var step = event.shiftKey ? 40 : 16;
    if (event.key === 'ArrowUp') {
      applyDockHeight(dockHeight + step, true);
    } else if (event.key === 'ArrowDown') {
      applyDockHeight(dockHeight - step, true);
    } else {
      return;
    }
    event.preventDefault();
  });

  window.addEventListener('resize', function () {
    if (draggingDock) {
      return;
    }
    var next = clampDock(dockHeight);
    if (next !== dockHeight) {
      applyDockHeight(next, true);
      return;
    }
    handle.setAttribute('aria-valuemax', String(maxDock()));
    invalidateMaps();
  });
}

function bindKeys() {
  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') {
      return;
    }
    if (!document.body.classList.contains('is-map')) {
      event.preventDefault();
      showMap();
    }
  });
}

function boot() {
  mapPick = createMap('map-pick', 'topleft', 'bottomleft', false);
  mapAnti = createMap('map-anti', 'topright', 'bottomright', true);
  mapPick.getContainer().style.cursor = 'crosshair';

  var saved = restore();
  if (saved.pickView) {
    mapPick.setView([saved.pickView.lat, saved.pickView.lon], saved.pickView.zoom);
  }
  if (saved.antiView) {
    mapAnti.setView([saved.antiView.lat, saved.antiView.lon], saved.antiView.zoom);
  }
  if (saved.point) {
    point = saved.point;
    placeMarkers(point, antipodeOf(point));
    if (!saved.pickView || !saved.antiView) {
      selectPoint(point, false);
    }
  }
  paintReadout();

  mapPick.on('click', function (event) {
    if (suppressClick || draggingPoint) {
      return;
    }
    selectPoint({ lat: event.latlng.lat, lon: event.latlng.lng }, true);
  });
  mapPick.on('moveend', persist);
  mapAnti.on('moveend', persist);

  $('antipodes-clear').addEventListener('click', clearPoint);
  $('antipodes-locate').addEventListener('click', locate);
  $('antipodes-copy').addEventListener('click', function () {
    if (!point) {
      return;
    }
    copyText(summaryText()).then(function () {
      markCopied();
      setStatus('');
    }, function () {
      setStatus('Could not copy. The coordinates are shown above.');
    });
  });
  $('antipodes-guide').addEventListener('click', showGuide);
  var open = $('antipodes-open');
  if (open) {
    open.addEventListener('click', showMap);
  }

  bindDock();
  bindKeys();

  var stage = $('map-stage');
  if (stage && typeof window.ResizeObserver === 'function') {
    var observer = new window.ResizeObserver(function () {
      invalidateMaps();
    });
    observer.observe(stage);
  }

  window.requestAnimationFrame(function () {
    invalidateMaps();
  });
}

boot();
