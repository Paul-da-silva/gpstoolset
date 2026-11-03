/**
 * Converter landing boot (ES module).
 * /convert and every /convert/<pair> page share this file.
 * It parses the dropped file, then hands the document to the converter.
 */
import * as fileDrop from '../core/file-drop.js';
import { acceptAttr, all, byId, hasGeometry, parseFile, writable } from '../core/formats.js';
import * as converter from './app.js';

var current = null;

function byEl(id) {
  return document.getElementById(id);
}

function showError(message) {
  var el = byEl('landing-error');
  if (!el) {
    return;
  }
  el.hidden = !message;
  el.textContent = message || '';
}

function showStatus(message) {
  var el = byEl('convert-status');
  if (!el) {
    return;
  }
  el.hidden = !message;
  el.textContent = message || '';
}

function showFile(name) {
  var el = byEl('landing-file');
  if (!el) {
    return;
  }
  el.hidden = !name;
  el.textContent = name || '';
}

function queryValue(key) {
  var query = new URLSearchParams(window.location.search);
  return query.get(key) || '';
}

function pageDefault(name) {
  var el = document.getElementById('tool-landing');
  if (!el) {
    return '';
  }
  return el.getAttribute(name) || '';
}

function fillSelect(select, formats, selected) {
  if (!select) {
    return;
  }
  select.textContent = '';
  var i;
  for (i = 0; i < formats.length; i++) {
    var option = document.createElement('option');
    option.value = formats[i].id;
    option.textContent = formats[i].label;
    if (formats[i].id === selected) {
      option.selected = true;
    }
    select.appendChild(option);
  }
}

function selectedId(select) {
  return select && select.value ? select.value : '';
}

function otherWritable(exceptId) {
  var list = writable();
  var i;
  for (i = 0; i < list.length; i++) {
    if (list[i].id !== exceptId) {
      return list[i].id;
    }
  }
  return list.length ? list[0].id : '';
}

function targetFrom(id) {
  var format = byId(id);
  if (!format || !format.writable) {
    return null;
  }
  return {
    id: format.exporter,
    label: format.label,
    ext: format.ext,
    mime: format.mime,
    slug: format.slug,
    landing: format.landing
  };
}

function syncTo(prefer) {
  var from = byEl('convert-from');
  var to = byEl('convert-to');
  var fromId = selectedId(from);
  var toId = prefer || selectedId(to);
  if (!toId || toId === fromId || !byId(toId) || !byId(toId).writable) {
    toId = otherWritable(fromId);
  }
  fillSelect(to, writable(), toId);
}

function applyParsed(file) {
  if (!current) {
    return;
  }
  var to = byEl('convert-to');
  var target = targetFrom(selectedId(to));
  if (!target) {
    showError('Choose a format to save.');
    return;
  }
  if (!converter.open(current.doc, target, file ? file.name : current.doc.name)) {
    showError('Nothing to convert in that file.');
  }
}

function onPicked(file) {
  showError('');
  converter.reset();
  if (!file) {
    return;
  }
  showFile(file.name || 'File');
  showStatus('Reading the file…');
  var card = document.querySelector('.tool-card');
  if (card) {
    card.setAttribute('aria-busy', 'true');
  }
  parseFile(file).then(function (result) {
    if (!hasGeometry(result.doc)) {
      throw new Error('Nothing to convert in that file.');
    }
    current = { file: file, doc: result.doc, format: result.format };
    var from = byEl('convert-from');
    if (from && result.format) {
      from.value = result.format.id;
    }
    syncTo(selectedId(byEl('convert-to')));
    showStatus('');
    applyParsed(file);
  }).catch(function (err) {
    current = null;
    showStatus('');
    converter.reset();
    showError((err && err.message) || 'Couldn’t read that file.');
  }).then(function () {
    if (card) {
      card.removeAttribute('aria-busy');
    }
  });
}

function init() {
  var from = byEl('convert-from');
  var to = byEl('convert-to');
  var fromId = pageDefault('data-from') || queryValue('from');
  var toId = pageDefault('data-to') || queryValue('to');
  if (!byId(fromId)) {
    fromId = all().length ? all()[0].id : '';
  }
  fillSelect(from, all(), fromId);
  syncTo(toId);
  converter.bind();
  if (from) {
    from.addEventListener('change', function () {
      syncTo('');
      if (current) {
        applyParsed(current.file);
      }
    });
  }
  if (to) {
    to.addEventListener('change', function () {
      if (selectedId(to) === selectedId(from)) {
        syncTo('');
      }
      if (current) {
        applyParsed(current.file);
      }
    });
  }
  var input = byEl('file-input');
  if (input) {
    var accept = acceptAttr();
    if (accept) {
      input.setAttribute('accept', accept);
    }
  }
  fileDrop.init({
    onFile: onPicked,
    stage: '#tool-landing',
    overlay: '#landing-overlay',
    input: '#file-input',
    pick: '[data-file-pick]'
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
