/**
 * Whole-map file drop. Drag-over is a background tint only.
 * The File is handed to onFile and is not uploaded.
 */
(function (global) {
  'use strict';

  function node(ref) {
    if (!ref) {
      return null;
    }
    if (typeof ref === 'string') {
      return document.querySelector(ref);
    }
    return ref;
  }

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

  function init(options) {
    var opts = options || {};
    var stage = node(opts.stage || '#map-stage');
    var overlay = node(opts.overlay || '#file-overlay');
    var input = node(opts.input || '#file-input');
    if (!stage) {
      return;
    }

    var depth = 0;

    function show() {
      stage.classList.add('is-dragover');
      if (overlay) {
        overlay.hidden = false;
      }
    }

    function hide() {
      depth = 0;
      stage.classList.remove('is-dragover');
      if (overlay) {
        overlay.hidden = true;
      }
    }

    function deliver(file) {
      if (!file || typeof opts.onFile !== 'function') {
        return;
      }
      opts.onFile(file);
    }

    stage.addEventListener('dragenter', function (event) {
      if (!hasFiles(event)) {
        return;
      }
      event.preventDefault();
      depth += 1;
      show();
    });

    stage.addEventListener('dragover', function (event) {
      if (!hasFiles(event)) {
        return;
      }
      event.preventDefault();
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'copy';
      }
      show();
    });

    stage.addEventListener('dragleave', function (event) {
      if (!hasFiles(event) && depth === 0) {
        return;
      }
      depth -= 1;
      if (depth <= 0) {
        hide();
      }
    });

    stage.addEventListener('drop', function (event) {
      event.preventDefault();
      var files = event.dataTransfer && event.dataTransfer.files;
      hide();
      if (files && files.length) {
        deliver(files[0]);
      }
    });

    document.addEventListener('dragover', function (event) {
      if (hasFiles(event)) {
        event.preventDefault();
      }
    });

    document.addEventListener('drop', function (event) {
      if (!hasFiles(event)) {
        return;
      }
      if (stage.contains(event.target)) {
        return;
      }
      event.preventDefault();
      var files = event.dataTransfer && event.dataTransfer.files;
      hide();
      if (files && files.length) {
        deliver(files[0]);
      }
    });

    document.addEventListener('dragend', hide);

    if (input) {
      input.addEventListener('change', function () {
        var file = input.files && input.files[0];
        input.value = '';
        if (file) {
          deliver(file);
        }
      });
    }

    var picks = document.querySelectorAll(opts.pick || '[data-file-pick]');
    for (var i = 0; i < picks.length; i++) {
      picks[i].addEventListener('click', function () {
        if (input) {
          input.click();
        }
      });
    }
  }

  global.GpsFileDrop = {
    init: init
  };
})(window);
