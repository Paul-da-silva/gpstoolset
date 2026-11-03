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
    <span class="dropzone-note">or choose one. GPX, KML, KMZ, FIT, or a GoPro .MP4 / .LRV.</span>
  </button>
  <p class="dropzone-error" id="home-drop-error" hidden></p>
  <input type="file" id="home-file" accept=".gpx,.kml,.kmz,.fit,.mp4,.lrv,application/gpx+xml,application/vnd.google-earth.kml+xml,application/vnd.google-earth.kmz,video/mp4" hidden>
  <?php render_ad('ad-home-mid'); ?>
  <section class="home-guides" aria-labelledby="home-guides-heading">
    <h2 id="home-guides-heading">Guides</h2>
    <p>Short explainers for common GPS formats.</p>
    <ul class="home-guides-list">
      <li><a href="/guides">All guides</a></li>
      <li><a href="/guides/gpx-file">GPX</a></li>
      <li><a href="/guides/kml-file">KML</a></li>
      <li><a href="/guides/kmz-file">KMZ</a></li>
      <li><a href="/guides/fit-file">FIT</a></li>
    </ul>
  </section>
</main>
<?php
$dropzone = '/assets/js/dropzone.js';
$dropzoneFile = APP_ROOT . '/public' . $dropzone;
$dropzone .= '?v=' . (is_file($dropzoneFile) ? (string) filemtime($dropzoneFile) : '1');
require APP_ROOT . '/includes/partials/format-config.php';
?>
<script type="module" src="<?= e($dropzone) ?>"></script>
<?php require APP_ROOT . '/includes/layout/footer.php'; ?>
