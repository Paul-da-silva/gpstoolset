/**
 * Shared converter (ES module).
 * open(doc, target) takes a document and a target format descriptor.
 * It does not detect a format, read a File, or import a parser.
 */
import { buildExport, saveBuilt, stem } from '../core/exporters.js';
import { stash } from '../core/file-handoff.js';

var ready = null;

function byId(id) {
  return document.getElementById(id);
}

function grouped(n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function countLabel(n, one, many) {
  return n === 1 ? '1 ' + one : grouped(n) + ' ' + many;
}

export function summary(doc) {
  var tracks = 0;
  var points = 0;
  var segments = doc && doc.segments ? doc.segments : [];
  var i;
  for (i = 0; i < segments.length; i++) {
    var part = segments[i];
    if (part.points && part.points.length) {
      tracks += 1;
      points += part.points.length;
    }
  }
  var marks = doc && doc.waypoints ? doc.waypoints.length : 0;
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

function paint() {
  var box = byId('convert-result');
  var text = byId('convert-summary');
  var button = byId('convert-download');
  if (text && ready) {
    text.textContent = summary(ready.doc);
  }
  if (button && ready && ready.target) {
    button.textContent = 'Download ' + ready.target.label;
  }
  if (box) {
    box.hidden = !ready;
  }
}

/**
 * target: { id, label, ext, mime, slug, landing }
 * id is the exporter id (gpx, kml, kmz).
 */
export function open(doc, target, sourceName) {
  var built = buildExport(target.id, doc, sourceName || (doc && doc.name));
  if (!built) {
    ready = null;
    paint();
    return false;
  }
  ready = {
    doc: doc,
    built: built,
    target: target,
    sourceName: sourceName || (doc && doc.name) || 'track'
  };
  paint();
  var box = byId('convert-result');
  if (box && box.scrollIntoView) {
    box.scrollIntoView({ block: 'nearest' });
  }
  return true;
}

export function reset() {
  ready = null;
  paint();
}

function fileFromBuilt() {
  var built = ready.built;
  if (built.bytes) {
    return new File([built.bytes], built.filename, { type: built.mime });
  }
  return new File([built.text], built.filename, { type: built.mime });
}

export function bind() {
  var downloadBtn = byId('convert-download');
  var viewBtn = byId('convert-view');
  var anotherBtn = byId('convert-another');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', function () {
      if (ready) {
        saveBuilt(ready.built);
      }
    });
  }
  if (viewBtn) {
    viewBtn.addEventListener('click', function () {
      if (!ready || !ready.target || !ready.target.landing) {
        return;
      }
      viewBtn.disabled = true;
      var file = fileFromBuilt();
      stash(file, ready.target.slug).then(function () {
        window.location.assign(ready.target.landing);
      }).catch(function (err) {
        viewBtn.disabled = false;
        var el = byId('landing-error');
        if (el) {
          el.hidden = false;
          el.textContent = (err && err.message) || 'Couldn’t open the map. Download the file instead.';
        }
      });
    });
  }
  if (anotherBtn) {
    anotherBtn.addEventListener('click', function () {
      var input = byId('file-input');
      if (input) {
        input.click();
      }
    });
  }
}

export function sourceStem() {
  return stem(ready && ready.sourceName);
}
