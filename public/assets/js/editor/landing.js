/**
 * Editor landing boot (ES module).
 * /gpx-editor is the SEO page. This file parses one or more files
 * through the format registry, then hands the document to the editor.
 */
import * as fileDrop from '../core/file-drop.js';
import { acceptAttr, exportChoices, hasGeometry, parseFile } from '../core/formats.js';
import { take } from '../core/file-handoff.js';
import * as editor from './app.js';

var job = 0;

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

function combine(results) {
  var segments = [];
  var waypoints = [];
  var name = '';
  var i;
  var j;
  for (i = 0; i < results.length; i++) {
    var doc = results[i].doc;
    if (!name) {
      name = doc.name;
    }
    for (j = 0; j < doc.segments.length; j++) {
      segments.push(doc.segments[j]);
    }
    for (j = 0; j < doc.waypoints.length; j++) {
      waypoints.push(doc.waypoints[j]);
    }
  }
  if (results.length > 1) {
    name = name ? name + ' and ' + (results.length - 1) + ' more' : 'Tracks';
  }
  return { name: name || 'track', segments: segments, waypoints: waypoints };
}

function labelFor(files) {
  if (!files.length) {
    return 'track';
  }
  if (files.length === 1) {
    return files[0].name || 'track';
  }
  return (files[0].name || 'track') + ' + ' + (files.length - 1);
}

function ingest(files) {
  var list = files || [];
  var mine = ++job;
  if (!list.length) {
    return;
  }
  showError('');
  setBusy(true, list.length > 1 ? 'Reading ' + list.length + ' files…' : 'Reading the file…');
  var chain = Promise.resolve([]);
  list.forEach(function (file) {
    chain = chain.then(function (results) {
      return parseFile(file).then(function (result) {
        results.push(result);
        return results;
      });
    });
  });
  chain.then(function (results) {
    if (mine !== job) {
      return;
    }
    var doc = combine(results);
    if (!hasGeometry(doc)) {
      throw new Error('No track in that file.');
    }
    setBusy(false);
    var label = labelFor(list);
    if (editor.hasDocument()) {
      editor.add(doc);
    } else {
      editor.open(doc, label);
    }
  }).catch(function (err) {
    if (mine !== job) {
      return;
    }
    setBusy(false);
    showError((err && err.message) || 'Couldn’t read that file.');
  });
}

function init() {
  editor.mount({
    noun: 'a file',
    exports: exportChoices()
  });
  var input = document.getElementById('file-input');
  if (input) {
    input.multiple = true;
    var accept = acceptAttr();
    if (accept) {
      input.setAttribute('accept', accept);
    }
  }
  fileDrop.init({
    stage: '#tool-landing',
    overlay: '#landing-overlay',
    onFiles: ingest
  });
  var cancel = document.getElementById('landing-cancel');
  if (cancel) {
    cancel.addEventListener('click', function () {
      job += 1;
      setBusy(false);
      showError('');
    });
  }
  take('gpx-editor').then(function (file) {
    if (file) {
      ingest([file]);
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
