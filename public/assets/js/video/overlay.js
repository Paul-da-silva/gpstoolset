/**
 * Video view for a Track (ES module): the clip from this device, a small
 * Leaflet map, metric overlays and fullscreen. Everything stays in the browser.
 *
 * The tool app only calls:
 *   init()                  once, to build the toggles and bind the controls
 *   attach(file, track?)    play a File (object URL); track may follow later
 *   setTrack(track)         a Track is ready: show the Map | Video switch
 *   clearTrack()            drop the track but keep the video
 *   detach()                release the video and go back to the map
 *   refresh()               repaint (for example after a unit change)
 *   closeMenu()             close the overlay menu (Escape)
 *
 * Video time is matched to GPS with video/sync.js (GPMF-relative cts).
 * Overlay choices persist in gpstoolset.ui.v1 (videoOverlay, videoMiniMap,
 * view, metricsLayout). The mini map layer comes from map/tiles.js only.
 */
import * as uiState from '../core/ui-state.js';
import * as viewSwitch from '../map/view-switch.js';
import { createTileLayer } from '../map/tiles.js';
import { displayLatLngs } from '../core/track.js';
import {
  formatAlt, formatClock, formatDistance, formatSpeed
} from '../core/format.js';
import { gAt, sampleAt, selfCheckSync } from './sync.js';

var track = null;
var videoUrl = null;
var mini = { map: null, halo: null, line: null, marker: null, fitted: false };
var rafId = 0;
var loopOn = false;
var resumePlay = false;

function pts() {
  return track ? track.points : [];
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
  var saved = uiState.load();
  var overlay = saved && saved.videoOverlay;
  return !!(overlay && overlay[key]);
}

function videoEl() {
  return document.getElementById('gopro-video');
}

function stopLoop() {
  loopOn = false;
  if (rafId) {
    window.cancelAnimationFrame(rafId);
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
    rafId = window.requestAnimationFrame(tick);
  };
  rafId = window.requestAnimationFrame(tick);
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
  if (!mini.map || !window.L || !pts().length) {
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
  var latlngs = displayLatLngs(pts());
  if (latlngs.length < 2) {
    return;
  }
  mini.halo = window.L.polyline(latlngs, {
    color: '#ffffff',
    weight: 7,
    opacity: 0.95,
    lineJoin: 'round',
    lineCap: 'round',
    interactive: false
  }).addTo(mini.map);
  mini.line = window.L.polyline(latlngs, {
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
  var saved = uiState.load().videoMiniMap;
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
  if (!frame || !rect) {
    return;
  }
  var box = frame.getBoundingClientRect();
  uiState.update(function (current) {
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
  if (!el || mini.map || !window.L) {
    return;
  }
  mini.map = window.L.map(el, {
    attributionControl: true,
    zoomControl: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    boxZoom: false,
    keyboard: false,
    touchZoom: true
  });
  createTileLayer(window.L).addTo(mini.map);
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
      window.requestAnimationFrame(fit);
      return;
    }
    if (mini.fitted || !size || size.x < 20) {
      return;
    }
    if (mini.line) {
      mini.map.fitBounds(mini.line.getBounds(), { padding: [18, 18], maxZoom: 16 });
      mini.fitted = true;
    } else if (pts().length) {
      mini.map.setView([pts()[0].lat, pts()[0].lon], 15);
      mini.fitted = true;
    }
  };
  window.requestAnimationFrame(fit);
}

function showMiniMarker(lat, lon) {
  if (!mini.map || !window.L) {
    return;
  }
  var latlng = [lat, lon];
  if (!mini.marker) {
    mini.marker = window.L.circleMarker(latlng, {
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
    var g = gAt(track ? track.acc : [], (video.currentTime || 0) * 1000);
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
    var available = !item.needs || !!(track && track.meta[item.needs]);
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
  var fix = sampleAt(pts(), ms);
  var wait = document.getElementById('video-wait');
  if (wait) {
    if (!pts().length || !fix.timed) {
      wait.hidden = !videoUrl;
      wait.textContent = pts().length ? 'No video timing on this track.' : 'Waiting for GPS fix';
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
    var available = !item.needs || !!(track && track.meta[item.needs]);
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

function pauseLeavingVideo() {
  var video = videoEl();
  if (video && !video.paused) {
    resumePlay = true;
    video.pause();
  }
  stopLoop();
}

function leaveVideoStage() {
  var stage = document.getElementById('video-stage');
  if (stage) {
    stage.hidden = true;
  }
  stopLoop();
}

function enterVideoStage() {
  var stage = document.getElementById('video-stage');
  var video = videoEl();
  if (stage) {
    stage.hidden = false;
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

function applyView(mode, persist) {
  viewSwitch.applyView(mode, persist);
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
  if (videoUrl) {
    URL.revokeObjectURL(videoUrl);
    videoUrl = null;
  }
  viewSwitch.setVideoAttached(false);
  viewSwitch.applyView('map', false);
}

function attachVideoFile(file) {
  var video = videoEl();
  if (!video || !file) {
    return;
  }
  videoUrl = URL.createObjectURL(file);
  video.src = videoUrl;
}

/** A Track is ready: draw it on the mini map and show the Map | Video | 3D switch. */
export function setTrack(next) {
  track = next;
  paintOverlayToggles();
  drawMiniTrack();
  viewSwitch.setTrack(next);
  viewSwitch.setVideoAttached(!!videoUrl);
  if (!videoUrl) {
    viewSwitch.applyView('map', false);
    return;
  }
  viewSwitch.restoreSaved();
}

function metricsLayout() {
  var saved = uiState.load();
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
  uiState.update(function (current) {
    current.metricsLayout = next;
  });
  paintMetricsLayout();
}

function setOverlay(key, on) {
  uiState.update(function (current) {
    current.videoOverlay[key] = !!on;
  });
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

/** Build the overlay toggles and bind the video controls (once). */
export function init() {
  selfCheckSync();
  var toggles = document.getElementById('video-toggles');
  var metrics = document.getElementById('video-metrics');
  var video = videoEl();
  if (!toggles || !metrics || !video || toggles.getAttribute('data-bound')) {
    return;
  }
  toggles.setAttribute('data-bound', 'true');
  viewSwitch.init();
  viewSwitch.registerVideo({
    canEnter: function () {
      return !!videoUrl;
    },
    pauseLeaving: pauseLeavingVideo,
    onLeave: leaveVideoStage,
    onEnter: enterVideoStage
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
  window.addEventListener('resize', function () {
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
  window.addEventListener('pagehide', releaseVideo);
}

/** Play a File from this device. The track may arrive later through setTrack(). */
export function attach(file, next) {
  attachVideoFile(file);
  if (next) {
    setTrack(next);
  }
}

/** Release the video and go back to the map view. */
export function detach() {
  releaseVideo();
}

/** Forget the track (the video stays attached). */
export function clearTrack() {
  track = null;
  clearMiniTrack();
  viewSwitch.setTrack(null);
}

/** Repaint the overlays, for example after a unit change. */
export function refresh() {
  paintVideo();
}

/** Close the overlay menu, if open. */
export function closeMenu() {
  setVideoMenu(false);
}
