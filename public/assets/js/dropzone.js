/**
 * Home drop zone. Routes a file to the matching viewer.
 * The File is handed off in this browser. It is not uploaded.
 */
import { stash } from './core/file-handoff.js';

var ROUTES = {
  gpx: { slug: 'gpx-viewer', path: '/gpx-viewer' },
  mp4: { slug: 'gopro-gps-extract', path: '/gopro-gps-extract' },
  lrv: { slug: 'gopro-gps-extract', path: '/gopro-gps-extract' }
};

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

function extension(file) {
  var name = String(file && file.name || '').toLowerCase();
  var dot = name.lastIndexOf('.');
  return dot >= 0 ? name.slice(dot + 1) : '';
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

function send(file) {
  if (!file || busy) {
    return;
  }
  var route = ROUTES[extension(file)];
  if (!route) {
    showError('Drop a GPX file, or a GoPro .MP4 or .LRV.');
    return;
  }
  showError('');
  setBusy(true, 'Opening…');
  stash(file, route.slug).then(function () {
    window.location.assign(route.path);
  }).catch(function () {
    setBusy(false);
    showError('Couldn’t open that file. Try the tool page instead.');
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

  document.addEventListener('dragover', function (event) {
    if (hasFiles(event)) {
      event.preventDefault();
    }
  });

  document.addEventListener('drop', function (event) {
    if (!hasFiles(event)) {
      return;
    }
    event.preventDefault();
  });
}

bind();
