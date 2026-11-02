/**
 * Shared converter page (ES module). Glue only.
 *
 * Drop a file, parse it in the browser, then download the result or
 * open the GPX on the map. Nothing is uploaded.
 *
 * options: {
 *   slug, extensions, reject, reading,
 *   output: 'gpx' | 'kml',
 *   download, view,
 *   viewMode: 'output' | 'source',
 *   parse(file) → { name, segments, waypoints }
 * }
 */
import * as fileDrop from '../core/file-drop.js';
import { download, stem, toGpxDocument, toKmlDocument } from '../core/exporters.js';
import { stash, take } from '../core/file-handoff.js';

var job = 0;
var ready = null;

function byId(id) {
  return document.getElementById(id);
}

function extension(file) {
  var name = String(file && file.name || '').toLowerCase();
  var dot = name.lastIndexOf('.');
  return dot >= 0 ? name.slice(dot + 1) : '';
}

function showError(message) {
  var el = byId('landing-error');
  if (!el) {
    return;
  }
  el.hidden = !message;
  el.textContent = message || '';
}

function showStatus(message) {
  var el = byId('convert-status');
  if (!el) {
    return;
  }
  el.hidden = !message;
  el.textContent = message || '';
}

function showFile(name) {
  var el = byId('landing-file');
  if (!el) {
    return;
  }
  el.hidden = !name;
  el.textContent = name || '';
}

function hideResult() {
  var el = byId('convert-result');
  if (el) {
    el.hidden = true;
  }
  ready = null;
}

function grouped(n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function countLabel(n, one, many) {
  return n === 1 ? '1 ' + one : grouped(n) + ' ' + many;
}

function summary(doc) {
  var tracks = 0;
  var points = 0;
  var i;
  for (i = 0; i < doc.tracks.length; i++) {
    var part = doc.tracks[i];
    if (part.points && part.points.length) {
      tracks += 1;
      points += part.points.length;
    }
  }
  var marks = doc.waypoints.length;
  var bits = [];
  if (tracks) {
    bits.push(countLabel(tracks, 'track', 'tracks'));
    bits.push(countLabel(points, 'point', 'points'));
  }
  if (marks) {
    bits.push(countLabel(marks, 'waypoint', 'waypoints'));
  }
  return bits.join(' · ');
}

function documentFrom(parsed, file) {
  return {
    name: parsed.name || stem(file.name),
    tracks: parsed.segments || [],
    waypoints: parsed.waypoints || []
  };
}

function hasOutput(doc) {
  var i;
  if (doc.waypoints.length) {
    return true;
  }
  for (i = 0; i < doc.tracks.length; i++) {
    if (doc.tracks[i].points && doc.tracks[i].points.length) {
      return true;
    }
  }
  return false;
}

function outputText(options, doc) {
  if (options.output === 'kml') {
    return {
      text: toKmlDocument(doc),
      ext: '.kml',
      mime: 'application/vnd.google-earth.kml+xml'
    };
  }
  return {
    text: toGpxDocument(doc),
    ext: '.gpx',
    mime: 'application/gpx+xml'
  };
}

function showResult(options, file, doc, built) {
  var box = byId('convert-result');
  var text = byId('convert-summary');
  if (text) {
    text.textContent = summary(doc);
  }
  if (box) {
    box.hidden = false;
  }
  ready = {
    file: file,
    doc: doc,
    built: built,
    options: options
  };
  if (box && box.scrollIntoView) {
    box.scrollIntoView({ block: 'nearest' });
  }
}

function convert(file, options) {
  var mine = ++job;
  hideResult();
  showError('');
  if (!file) {
    return;
  }
  var ext = extension(file);
  if (options.extensions.indexOf(ext) === -1) {
    showFile('');
    showStatus('');
    showError(options.reject);
    return;
  }
  showFile(file.name || 'File');
  showStatus(options.reading);
  var card = document.querySelector('.tool-card');
  if (card) {
    card.setAttribute('aria-busy', 'true');
  }
  Promise.resolve().then(function () {
    return options.parse(file);
  }).then(function (parsed) {
    if (mine !== job) {
      return;
    }
    var doc = documentFrom(parsed || {}, file);
    if (!hasOutput(doc)) {
      throw new Error('Nothing to convert in that file.');
    }
    var built = outputText(options, doc);
    showStatus('');
    showResult(options, file, doc, built);
  }).catch(function (err) {
    if (mine !== job) {
      return;
    }
    hideResult();
    showStatus('');
    showError(err && err.message ? err.message : 'Couldn’t read that file.');
  }).then(function () {
    if (card && mine === job) {
      card.removeAttribute('aria-busy');
    }
  });
}

function save() {
  if (!ready) {
    return;
  }
  var built = ready.built;
  download(stem(ready.file.name) + built.ext, built.mime, built.text);
}

function viewOnMap() {
  if (!ready) {
    return;
  }
  var button = byId('convert-view');
  if (button) {
    button.disabled = true;
  }
  var outgoing = ready.file;
  if (ready.options.viewMode === 'output') {
    outgoing = new File([ready.built.text], stem(ready.file.name) + '.gpx', {
      type: 'application/gpx+xml'
    });
  }
  stash(outgoing, 'gpx-viewer').then(function () {
    window.location.assign('/gpx-viewer');
  }).catch(function () {
    if (button) {
      button.disabled = false;
    }
    showError('Couldn’t open the map. Download the file instead.');
  });
}

export function start(options) {
  var downloadBtn = byId('convert-download');
  var viewBtn = byId('convert-view');
  var anotherBtn = byId('convert-another');
  if (downloadBtn && options.download) {
    downloadBtn.textContent = options.download;
  }
  if (viewBtn && options.view) {
    viewBtn.textContent = options.view;
  }

  fileDrop.init({
    onFile: function (file) {
      convert(file, options);
    },
    stage: '#tool-landing',
    overlay: '#landing-overlay',
    input: '#file-input',
    pick: '[data-file-pick]'
  });

  if (downloadBtn) {
    downloadBtn.addEventListener('click', save);
  }
  if (viewBtn) {
    viewBtn.addEventListener('click', viewOnMap);
  }
  if (anotherBtn) {
    anotherBtn.addEventListener('click', function () {
      var input = byId('file-input');
      if (input) {
        input.click();
      }
    });
  }

  take(options.slug).then(function (file) {
    if (file) {
      convert(file, options);
    }
  });
}
