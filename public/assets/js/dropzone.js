/**
 * Home drop zone. Detects a GPS file and opens its viewer.
 * GoPro video (.mp4 / .lrv) still opens the GoPro page.
 * The File is handed off in this browser. It is not uploaded.
 */
import { stash } from './core/file-handoff.js';
import { detect, extensionOf } from './core/detect.js';

var zone = document.querySelector('.dropzone');
var input = document.getElementById('home-file');
var errorEl = document.getElementById('home-drop-error');
var titleEl = zone ? zone.querySelector('.dropzone-title') : null;
var busy = false;

function hasFiles(event) {
  var types = event.dataTransfer && event.dataTransfer.types;
  if (!types) {
    return false;
  }
  for (var i = 0; i < types.length; i++) {
    if (types[i] === 'Files') {
      return true;
    }
  }
  return false;
}

function showError(message) {
  if (!errorEl) {
    return;
  }
  errorEl.hidden = !message;
  errorEl.textContent = message || '';
}

function setBusy(on, label) {
  busy = on;
  if (!zone) {
    return;
  }
  zone.disabled = on;
  zone.classList.toggle('is-busy', on);
  if (titleEl) {
    titleEl.textContent = on ? (label || 'Opening…') : 'Drop a file here';
  }
}

function go(file, slug, path) {
  setBusy(true, 'Opening…');
  stash(file, slug).then(function () {
    window.location.assign(path);
  }).catch(function (err) {
    setBusy(false);
    showError((err && err.message) || 'Couldn’t open that file. Try the tool page instead.');
  });
}

function send(file) {
  if (!file || busy) {
    return;
  }
  showError('');
  var ext = extensionOf(file);
  if (ext === 'mp4' || ext === 'lrv') {
    go(file, 'gopro-gps-extract', '/gopro-gps-extract');
    return;
  }
  setBusy(true, 'Checking the file…');
  detect(file).then(function (format) {
    if (!format || !format.landing || !format.slug) {
      setBusy(false);
      showError('Drop a GPX, KML, KMZ, or FIT file, or a GoPro .MP4 or .LRV.');
      return;
    }
    go(file, format.slug, format.landing);
  }).catch(function () {
    setBusy(false);
    showError('Couldn’t read that file. Try the tool page instead.');
  });
}

function bind() {
  if (!zone) {
    return;
  }

  function enter(event) {
    if (busy || !hasFiles(event)) {
      return;
    }
    event.preventDefault();
    zone.classList.add('is-dragover');
  }

  zone.addEventListener('dragenter', enter);
  zone.addEventListener('dragover', enter);

  zone.addEventListener('dragleave', function (event) {
    if (!zone.contains(event.relatedTarget)) {
      zone.classList.remove('is-dragover');
    }
  });

  zone.addEventListener('drop', function (event) {
    event.preventDefault();
    event.stopPropagation();
    zone.classList.remove('is-dragover');
    var files = event.dataTransfer && event.dataTransfer.files;
    if (files && files.length) {
      send(files[0]);
    }
  });

  zone.addEventListener('click', function () {
    if (!busy && input) {
      input.click();
    }
  });

  if (input) {
    input.addEventListener('change', function () {
      var file = input.files && input.files[0];
      input.value = '';
      if (file) {
        send(file);
      }
    });
  }
}

bind();
