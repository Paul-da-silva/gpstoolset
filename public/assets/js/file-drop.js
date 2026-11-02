/**
 * File drop. Drag-over is a background tint only.
 * The File is handed to onFile and is not uploaded.
 *
 * init() binds once. addStage() watches another region with the same handler.
 */
(function (global) {
  'use strict';

  var bound = false;
  var stages = [];
  var onFile = null;

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

  function deliver(file) {
    if (!file || typeof onFile !== 'function') {
      return;
    }
    onFile(file);
  }

  function hideAll() {
    var i;
    for (i = 0; i < stages.length; i++) {
      stages[i].hide();
    }
  }

  function stageContains(target) {
    var i;
    for (i = 0; i < stages.length; i++) {
      if (stages[i].stage.contains(target)) {
        return true;
      }
    }
    return false;
  }

  function watch(stage, overlay) {
    if (!stage || stage.getAttribute('data-drop-stage') === '1') {
      return;
    }
    stage.setAttribute('data-drop-stage', '1');

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

    stages.push({ stage: stage, hide: hide });
  }

  function bindDocument() {
    document.addEventListener('dragover', function (event) {
      if (hasFiles(event)) {
        event.preventDefault();
      }
    });

    document.addEventListener('drop', function (event) {
      if (!hasFiles(event)) {
        return;
      }
      if (stageContains(event.target)) {
        return;
      }
      event.preventDefault();
      var files = event.dataTransfer && event.dataTransfer.files;
      hideAll();
      if (files && files.length) {
        deliver(files[0]);
      }
    });

    document.addEventListener('dragend', hideAll);
  }

  function init(options) {
    var opts = options || {};
    if (typeof opts.onFile === 'function' && !bound) {
      onFile = opts.onFile;
    }
    if (opts.stage) {
      watch(node(opts.stage), node(opts.overlay));
    }
    if (bound) {
      return;
    }
    bound = true;
    if (!opts.stage) {
      watch(node('#map-stage'), node('#file-overlay'));
    }

    var input = node(opts.input || '#file-input');
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
    var i;
    for (i = 0; i < picks.length; i++) {
      picks[i].addEventListener('click', function () {
        if (input) {
          input.click();
        }
      });
    }

    bindDocument();
  }

  function addStage(stage, overlay) {
    watch(node(stage), node(overlay));
  }

  global.GpsFileDrop = {
    init: init,
    addStage: addStage,
    get bound() {
      return bound;
    }
  };
})(window);
