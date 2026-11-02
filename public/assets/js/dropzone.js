/**
 * Placeholder drop zone. Drag-over is a background change only.
 * Files are not read and not uploaded.
 */
(function () {
  'use strict';

  var zone = document.querySelector('.dropzone');
  if (!zone) {
    return;
  }

  function enter(event) {
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
    zone.classList.remove('is-dragover');
  });
})();
