/**
 * Stats and Export popovers, and the Metric / Imperial switch (ES module).
 * The map shell opens and closes the popovers. Units live on the map.
 */
import * as uiState from '../core/ui-state.js';
import {
  durationMs, maxOf, minOf, totalDistance
} from '../core/track.js';
import {
  formatAlt, formatDistance, formatDuration, formatSpeed, unitMode
} from '../core/format.js';

var idleExportNote = 'Open a file to export the track.';

function stat(id, text) {
  var el = document.getElementById(id);
  if (el) {
    el.textContent = text;
  }
}

/**
 * Fill #stats-panel and #export-panel. noun completes the export hint,
 * e.g. 'a video' gives "Open a video to export the track."
 */
export function mount(noun, exports) {
  var thing = noun || 'a file';
  var buttons = exports && exports.length ? exports : [
    { id: 'gpx', label: 'GPX' },
    { id: 'csv', label: 'CSV' },
    { id: 'kml', label: 'KML' }
  ];
  idleExportNote = 'Open ' + thing + ' to export the track.';
  var stats = document.getElementById('stats-panel');
  var exp = document.getElementById('export-panel');
  if (stats) {
    stats.innerHTML =
      '<p class="popover-kicker">Track</p>' +
      '<dl class="stat-list">' +
      '<div><dt>Points</dt><dd id="stat-points">—</dd></div>' +
      '<div><dt>Duration</dt><dd id="stat-duration">—</dd></div>' +
      '<div><dt>Distance</dt><dd id="stat-distance">—</dd></div>' +
      '<div><dt>Average speed</dt><dd id="stat-avg">—</dd></div>' +
      '<div><dt>Max speed</dt><dd id="stat-max">—</dd></div>' +
      '<div><dt>Max vertical speed</dt><dd id="stat-vmax">—</dd></div>' +
      '<div><dt>Lowest altitude</dt><dd id="stat-low">—</dd></div>' +
      '<div><dt>Highest altitude</dt><dd id="stat-high">—</dd></div>' +
      '</dl>' +
      '<p class="popover-note" id="stat-coverage" hidden></p>';
  }
  if (exp) {
    exp.innerHTML =
      '<p class="popover-kicker">Export</p>' +
      '<p class="popover-note" id="export-note"></p>' +
      '<div class="export-actions">' +
      buttons.map(function (item) {
        return '<button type="button" class="chip" data-export="' + item.id + '" disabled>' +
          item.label + '</button>';
      }).join('') +
      '</div>';
    var note = document.getElementById('export-note');
    if (note) {
      note.textContent = idleExportNote;
    }
  }
}

/**
 * One-line GPS coverage for a GoPro clip whose length is known.
 * Expected slots are duration × 5 Hz, the same spacing parsers/gpmf.js
 * keeps (GROUP_MS = 200). Other tracks leave this blank.
 */
function renderCoverage(track) {
  var el = document.getElementById('stat-coverage');
  if (!el) {
    return;
  }
  var duration = track && track.meta ? track.meta.videoDuration : null;
  var kept = track && track.points ? track.points.length : 0;
  var expected = typeof duration === 'number' && isFinite(duration) && duration > 0
    ? Math.round(duration * 5)
    : 0;
  if (!kept || expected < 1) {
    el.hidden = true;
    el.textContent = '';
    return;
  }
  var pct = Math.min(100, Math.round((kept / expected) * 100));
  el.hidden = false;
  el.textContent = 'GPS coverage: ' + pct + '% (' +
    kept.toLocaleString() + ' of about ' + expected.toLocaleString() + ' at 5 Hz).';
}

/** Fill the stat list from a Track, or reset it when track is null. */
export function renderStats(track) {
  var points = track ? track.points : [];
  if (!points.length) {
    stat('stat-points', '—');
    stat('stat-duration', '—');
    stat('stat-distance', '—');
    stat('stat-avg', '—');
    stat('stat-max', '—');
    stat('stat-vmax', '—');
    stat('stat-low', '—');
    stat('stat-high', '—');
    renderCoverage(null);
    return;
  }
  var meters = totalDistance(points);
  var elapsed = durationMs(points);
  var average = elapsed ? meters / (elapsed / 1000) : null;
  var eles = points.map(function (point) {
    return point.ele;
  });
  var vAbs = points.map(function (point) {
    return point.vspeed == null || !isFinite(point.vspeed) ? null : Math.abs(point.vspeed);
  });
  stat('stat-points', points.length.toLocaleString());
  stat('stat-duration', formatDuration(elapsed));
  stat('stat-distance', formatDistance(meters));
  stat('stat-avg', formatSpeed(average));
  stat('stat-max', formatSpeed(maxOf(track.smooth)));
  stat('stat-vmax', formatSpeed(maxOf(vAbs)));
  stat('stat-low', formatAlt(minOf(eles)));
  stat('stat-high', formatAlt(maxOf(eles)));
  renderCoverage(track);
}

/** Show which unit button is on. */
export function paintUnits() {
  var mode = unitMode();
  var buttons = document.querySelectorAll('[data-units]');
  var i;
  for (i = 0; i < buttons.length; i++) {
    var on = buttons[i].getAttribute('data-units') === mode;
    buttons[i].classList.toggle('is-active', on);
    buttons[i].setAttribute('aria-pressed', on ? 'true' : 'false');
  }
}

/** Enable or disable the export buttons and update the hint. */
export function setExportEnabled(on, noteText) {
  var buttons = document.querySelectorAll('#export-panel [data-export]');
  var i;
  for (i = 0; i < buttons.length; i++) {
    buttons[i].disabled = !on;
  }
  var note = document.getElementById('export-note');
  if (note) {
    if (!on) {
      note.textContent = idleExportNote;
    } else if (noteText) {
      note.textContent = noteText;
    } else {
      note.textContent = 'Saves a file on this device. Nothing is uploaded.';
    }
  }
}

/** Save the unit choice, repaint the buttons, then call onChange(). */
export function bindUnits(onChange) {
  var buttons = document.querySelectorAll('[data-units]');
  var i;
  for (i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', function (event) {
      var mode = event.currentTarget.getAttribute('data-units');
      if (mode !== 'metric' && mode !== 'imperial') {
        return;
      }
      uiState.update(function (current) {
        current.units = mode;
      });
      paintUnits();
      if (typeof onChange === 'function') {
        onChange(mode);
      }
    });
  }
}

/** Call onExport(id) when an enabled export button is clicked. */
export function bindExport(onExport) {
  var exp = document.getElementById('export-panel');
  if (!exp) {
    return;
  }
  exp.addEventListener('click', function (event) {
    var node = event.target;
    while (node && node !== exp) {
      if (node.getAttribute && node.getAttribute('data-export')) {
        if (!node.disabled) {
          onExport(node.getAttribute('data-export'));
        }
        return;
      }
      node = node.parentNode;
    }
  });
}
