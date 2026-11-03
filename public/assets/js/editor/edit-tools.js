/**
 * Edit popover for the editor (ES module).
 * The markup lives in includes/layout/map-app.php. This wires the controls.
 * The editor owns the track and passes the result of each edit back in.
 */

var actions = null;
var pointCount = 0;
var mode = '';

var MODE_PANELS = {
  simplify: 'edit-mode-simplify',
  trim: 'edit-mode-trim',
  reverse: 'edit-mode-reverse',
  elevation: 'edit-mode-elevation',
  merge: 'edit-mode-merge',
  split: 'edit-mode-split'
};

function byId(id) {
  return document.getElementById(id);
}

function enable(id, on) {
  var el = byId(id);
  if (el) {
    el.disabled = !on;
  }
}

function readNumber(id) {
  var el = byId(id);
  if (!el) {
    return 0;
  }
  return Number(el.value);
}

function setRange(id, min, max, value) {
  var el = byId(id);
  if (!el) {
    return;
  }
  el.min = String(min);
  el.max = String(Math.max(min, max));
  var next = value;
  if (next < min) {
    next = min;
  }
  if (next > max) {
    next = max;
  }
  el.value = String(next);
}

function trimRange() {
  var start = readNumber('edit-trim-start');
  var end = readNumber('edit-trim-end');
  if (end < start) {
    var swap = start;
    start = end;
    end = swap;
  }
  return { start: start, end: end };
}

function paintTrimFill() {
  var fill = byId('edit-trim-fill');
  if (!fill) {
    return;
  }
  if (pointCount < 2) {
    fill.style.left = '0';
    fill.style.width = '0';
    return;
  }
  var range = trimRange();
  var span = Math.max(1, pointCount - 1);
  var left = (range.start / span) * 100;
  var width = ((range.end - range.start) / span) * 100;
  fill.style.left = left + '%';
  fill.style.width = width + '%';
}

function enableMode(name, on) {
  var buttons = document.querySelectorAll('[data-edit-mode="' + name + '"]');
  var i;
  for (i = 0; i < buttons.length; i++) {
    buttons[i].disabled = !on;
  }
}

function paintMode() {
  var buttons = document.querySelectorAll('[data-edit-mode]');
  var i;
  for (i = 0; i < buttons.length; i++) {
    var on = buttons[i].getAttribute('data-edit-mode') === mode;
    buttons[i].classList.toggle('is-active', on);
    buttons[i].setAttribute('aria-pressed', on ? 'true' : 'false');
  }
  Object.keys(MODE_PANELS).forEach(function (name) {
    var panel = byId(MODE_PANELS[name]);
    if (panel) {
      panel.hidden = name !== mode;
    }
  });
}

function chooseMode(next) {
  mode = mode === next ? '' : next;
  paintMode();
  if (actions && actions.clearPreview) {
    actions.clearPreview();
  }
  if (mode === 'simplify' && readNumber('edit-simplify') > 0 && actions && actions.previewSimplify) {
    actions.previewSimplify(readNumber('edit-simplify'));
  }
  if (mode === 'trim' && actions && actions.previewTrim) {
    actions.previewTrim();
  }
  if (mode === 'split' && actions && actions.previewSplit) {
    actions.previewSplit();
  }
}

function refreshApply() {
  var canShape = pointCount >= 3;
  var meters = readNumber('edit-simplify');
  var range = trimRange();
  var trimming = pointCount > 1 && (range.start > 0 || range.end < pointCount - 1);
  enable('edit-simplify', canShape);
  enable('edit-simplify-apply', canShape && meters > 0);
  enable('edit-trim-start', canShape);
  enable('edit-trim-end', canShape);
  enable('edit-trim-apply', canShape && trimming);
  enable('edit-split', pointCount >= 4);
  enable('edit-split-apply', pointCount >= 4);
}

function paintReadouts() {
  var trim = byId('edit-trim-label');
  if (trim) {
    if (pointCount < 2) {
      trim.textContent = '—';
    } else {
      var range = trimRange();
      if (range.start === 0 && range.end === pointCount - 1) {
        trim.textContent = 'Whole track';
      } else {
        trim.textContent = 'Points ' + (range.start + 1) + '–' + (range.end + 1) + ' of ' + pointCount;
      }
    }
  }
  paintTrimFill();
  paintSplit();
}

function paintSplit() {
  var el = byId('edit-split-label');
  if (!el) {
    return;
  }
  if (pointCount < 4) {
    el.textContent = '—';
    return;
  }
  var at = readNumber('edit-split');
  var left = at + 1;
  var right = pointCount - left;
  el.textContent = left + ' points, then ' + right;
}

export function setSimplifyLabel(text) {
  var el = byId('edit-simplify-label');
  if (el && text) {
    el.textContent = text;
  }
}

function paintParts(parts, active) {
  var box = byId('edit-parts');
  if (!box) {
    return;
  }
  box.textContent = '';
  if (!parts || parts.length < 2) {
    box.hidden = true;
    return;
  }
  box.hidden = false;
  var i;
  for (i = 0; i < parts.length; i++) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'chip';
    button.setAttribute('aria-pressed', i === active ? 'true' : 'false');
    if (i === active) {
      button.classList.add('is-active');
    }
    var count = parts[i].count;
    button.textContent = parts[i].name + ' (' + count + ')';
    button.setAttribute('data-part', String(i));
    box.appendChild(button);
  }
}

function onClick(id, fn) {
  var el = byId(id);
  if (!el) {
    return;
  }
  el.addEventListener('click', function () {
    if (el.disabled || !actions) {
      return;
    }
    fn();
  });
}

/** Attach the edit controls once. actions receives the slider values. */
export function bind(next) {
  actions = next;
  if (byId('edit-panel') && byId('edit-panel').getAttribute('data-bound') === '1') {
    return;
  }
  var panel = byId('edit-panel');
  if (!panel) {
    return;
  }
  panel.setAttribute('data-bound', '1');
  panel.addEventListener('click', function (event) {
    var node = event.target;
    while (node && node !== panel) {
      if (node.getAttribute && node.getAttribute('data-edit-mode')) {
        if (!node.disabled) {
          chooseMode(node.getAttribute('data-edit-mode'));
        }
        return;
      }
      node = node.parentNode;
    }
  });
  onClick('edit-undo', function () {
    actions.undo();
  });
  onClick('edit-reverse', function () {
    actions.reverse();
  });
  onClick('edit-elev', function () {
    actions.elevation();
  });
  onClick('edit-simplify-apply', function () {
    actions.simplify(readNumber('edit-simplify'));
  });
  onClick('edit-trim-apply', function () {
    var range = trimRange();
    actions.trim(range.start, range.end);
  });
  onClick('edit-merge', function () {
    actions.merge();
  });
  onClick('edit-split-apply', function () {
    actions.split(readNumber('edit-split'));
  });
  var parts = byId('edit-parts');
  if (parts) {
    parts.addEventListener('click', function (event) {
      var node = event.target;
      while (node && node !== parts) {
        if (node.getAttribute && node.getAttribute('data-part') != null) {
          actions.selectPart(Number(node.getAttribute('data-part')));
          return;
        }
        node = node.parentNode;
      }
    });
  }
  var simplify = byId('edit-simplify');
  if (simplify) {
    simplify.addEventListener('input', function () {
      refreshApply();
      if (mode === 'simplify' && actions && actions.previewSimplify) {
        actions.previewSimplify(readNumber('edit-simplify'));
      }
    });
  }
  ['edit-trim-start', 'edit-trim-end'].forEach(function (id) {
    var el = byId(id);
    if (!el) {
      return;
    }
    el.addEventListener('pointerdown', function () {
      var startEl = byId('edit-trim-start');
      var endEl = byId('edit-trim-end');
      if (startEl) {
        startEl.style.zIndex = '1';
      }
      if (endEl) {
        endEl.style.zIndex = '1';
      }
      el.style.zIndex = '2';
    });
    el.addEventListener('input', function () {
      paintReadouts();
      refreshApply();
      if (mode === 'trim' && actions && actions.previewTrim) {
        actions.previewTrim();
      }
    });
  });
  var split = byId('edit-split');
  if (split) {
    split.addEventListener('input', function () {
      paintSplit();
      if (mode === 'split' && actions && actions.previewSplit) {
        actions.previewSplit();
      }
    });
  }
  paintReadouts();
}

/**
 * Refresh buttons, sliders, and the part list.
 * state: { count, parts: [{ name, count }], active, canUndo, hasElevation, note }
 * Sliders reset only when the point count changes.
 */
export function setState(state) {
  var next = state || {};
  var count = next.count || 0;
  var countChanged = count !== pointCount;
  pointCount = count;
  if (!count) {
    mode = '';
  }
  if (countChanged) {
    var last = Math.max(0, count - 1);
    setRange('edit-trim-start', 0, last, 0);
    setRange('edit-trim-end', 0, last, last);
    setRange('edit-simplify', 0, 200, 0);
    setRange('edit-split', 1, Math.max(1, count - 3), 1);
    setSimplifyLabel('Off');
  }
  var canShape = count >= 3;
  enable('edit-undo', !!next.canUndo);
  enable('edit-reverse', count >= 2);
  enable('edit-elev', !!(next.hasElevation && canShape));
  enableMode('simplify', canShape);
  enableMode('trim', canShape);
  enableMode('reverse', count >= 2);
  enableMode('elevation', !!(next.hasElevation && canShape));
  enableMode('merge', !!next.canMerge);
  enableMode('split', count >= 4);
  enable('edit-merge', !!next.canMerge);
  refreshApply();
  paintMode();
  paintReadouts();
  paintParts(next.parts, next.active || 0);
  if (next.note) {
    setNote(next.note);
  }
}

export function setNote(text) {
  var note = byId('edit-note');
  if (note) {
    note.textContent = text || '';
  }
}
