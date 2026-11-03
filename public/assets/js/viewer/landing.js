/**
 * Format landing boot (ES module).
 * The page holds the SEO copy and the drop zone. This file parses with
 * the format named on the page, then hands the document to the viewer.
 */
import * as fileDrop from '../core/file-drop.js';
import { byId, parseWith, exportChoices } from '../core/formats.js';
import { detect } from '../core/detect.js';
import { take, stash } from '../core/file-handoff.js';
import * as viewer from './app.js';

var job = 0;
var sourceFile = null;

function landing() {
  return document.getElementById('tool-landing');
}

function formatId() {
  var el = landing();
  return el ? el.getAttribute('data-format') || '' : '';
}

function slug() {
  var el = landing();
  return el ? el.getAttribute('data-slug') || '' : '';
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

function setBusy(on, label) {
  var box = document.getElementById('landing-progress');
  var text = document.getElementById('landing-progress-label');
  var bar = document.getElementById('landing-progress-bar');
  if (box) {
    box.hidden = !on;
  }
  if (text && label) {
    text.textContent = label;
  }
  if (bar) {
    bar.style.width = on ? '70%' : '0';
  }
}

function onPicked(file) {
  var format = byId(formatId());
  var mine = ++job;
  showError('');
  if (!file || !format) {
    return;
  }
  sourceFile = file;
  setBusy(true, 'Reading the ' + format.label + '…');
  detect(file).then(function (found) {
    if (mine !== job) {
      return null;
    }
    if (!found || found.id !== format.id) {
      throw new Error('Choose a ' + format.label + ' file (.' + (format.ext || format.id) + ').');
    }
    return parseWith(format, file);
  }).then(function (result) {
    if (!result || mine !== job) {
      return;
    }
    setBusy(false);
    viewer.open(result.doc, file.name || result.doc.name);
  }).catch(function (err) {
    if (mine !== job) {
      return;
    }
    setBusy(false);
    sourceFile = null;
    showError((err && err.message) || 'Couldn’t read that file.');
  });
}

function bindEdit() {
  var link = document.getElementById('chip-edit');
  if (!link) {
    return;
  }
  link.addEventListener('click', function (event) {
    if (!sourceFile) {
      return;
    }
    event.preventDefault();
    link.setAttribute('aria-busy', 'true');
    stash(sourceFile, 'gpx-editor').then(function () {
      window.location.assign('/gpx-editor');
    }).catch(function (err) {
      link.removeAttribute('aria-busy');
      showError((err && err.message) || 'Couldn’t open the editor. Try the editor page and choose the file there.');
    });
  });
}

function init() {
  var format = byId(formatId());
  viewer.mount({
    noun: format ? 'a ' + format.label + ' file' : 'a file',
    exports: exportChoices()
  });
  fileDrop.init({
    stage: '#tool-landing',
    overlay: '#landing-overlay',
    onFile: onPicked
  });
  bindEdit();
  var cancel = document.getElementById('landing-cancel');
  if (cancel) {
    cancel.addEventListener('click', function () {
      job += 1;
      setBusy(false);
      showError('');
    });
  }
  take(slug()).then(function (file) {
    if (file) {
      onPicked(file);
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
