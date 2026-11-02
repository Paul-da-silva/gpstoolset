<?php
declare(strict_types=1);

/** Home page body. Routed by includes/router.php (config/tools.php: home). */

require APP_ROOT . '/includes/layout/head.php';
require APP_ROOT . '/includes/layout/topbar.php';
?>
<main class="home">
  <h1>GPS Toolset</h1>
  <p class="privacy-line">Your file never leaves your device.</p>
  <button type="button" class="dropzone" id="home-drop">
    <span class="dropzone-title">Drop a file here</span>
    <span class="dropzone-note">or choose one. GPX, or a GoPro .MP4 / .LRV.</span>
  </button>
  <p class="dropzone-error" id="home-drop-error" hidden></p>
  <input type="file" id="home-file" accept=".gpx,.mp4,.lrv,application/gpx+xml,video/mp4" hidden>
  <?php render_ad('ad-home-mid'); ?>
</main>
<?php
$dropzone = '/assets/js/dropzone.js';
$dropzoneFile = APP_ROOT . '/public' . $dropzone;
$dropzone .= '?v=' . (is_file($dropzoneFile) ? (string) filemtime($dropzoneFile) : '1');
?>
<script type="module" src="<?= e($dropzone) ?>"></script>
<?php require APP_ROOT . '/includes/layout/footer.php'; ?>
