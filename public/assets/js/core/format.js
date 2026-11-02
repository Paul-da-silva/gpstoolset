/**
 * Units and clock formatting (ES module). Metric or imperial is read from
 * the saved UI state (gpstoolset.ui.v1) each time, so a unit switch shows
 * on the next paint.
 */
import * as uiState from './ui-state.js';

var MPS_TO_MPH = 2.2369362920544;
var M_TO_FT = 3.280839895013123;

function pad(n) {
  return n < 10 ? '0' + n : String(n);
}

export function formatClock(seconds) {
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

export function formatDuration(ms) {
  if (ms == null || !isFinite(ms) || ms < 0) {
    return '—';
  }
  return formatClock(ms / 1000);
}

export function unitMode() {
  var saved = uiState.load();
  return saved && saved.units === 'imperial' ? 'imperial' : 'metric';
}

/** Chart factors and suffixes for the current unit mode. */
export function unitScale() {
  var imperial = unitMode() === 'imperial';
  return {
    imperial: imperial,
    speedSuffix: imperial ? 'mph' : 'km/h',
    altSuffix: imperial ? 'ft' : 'm',
    distSuffix: imperial ? 'mi' : 'km',
    speedFactor: imperial ? MPS_TO_MPH : 3.6,
    altFactor: imperial ? M_TO_FT : 1,
    distFactor: imperial ? 1 / 1609.344 : 0.001
  };
}

export function formatSpeed(mps) {
  if (mps == null || !isFinite(mps)) {
    return '—';
  }
  if (unitMode() === 'imperial') {
    return (mps * MPS_TO_MPH).toFixed(1) + ' mph';
  }
  return (mps * 3.6).toFixed(1) + ' km/h';
}

export function formatAlt(meters) {
  if (meters == null || !isFinite(meters)) {
    return '—';
  }
  if (unitMode() === 'imperial') {
    return Math.round(meters * M_TO_FT) + ' ft';
  }
  return Math.round(meters) + ' m';
}

export function formatDistance(meters) {
  if (meters == null || !isFinite(meters)) {
    return '—';
  }
  if (unitMode() === 'imperial') {
    var miles = meters / 1609.344;
    if (miles < 0.1) {
      return Math.round(meters * M_TO_FT) + ' ft';
    }
    return miles.toFixed(2) + ' mi';
  }
  if (meters < 1000) {
    return Math.round(meters) + ' m';
  }
  return (meters / 1000).toFixed(2) + ' km';
}
