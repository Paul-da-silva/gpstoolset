<?php
declare(strict_types=1);

/** Home page body. Routed by includes/router.php (config/tools.php: home). */

$faq = isset($route['faq']) && is_array($route['faq']) ? $route['faq'] : [];

require APP_ROOT . '/includes/layout/head.php';
require APP_ROOT . '/includes/layout/topbar.php';

echo seo_json_ld([
    '@context' => 'https://schema.org',
    '@type' => 'WebSite',
    'name' => site('name'),
    'url' => base_url('/'),
    'description' => (string) ($page['description'] ?? ''),
]);
if ($faq !== []) {
    echo seo_json_ld([
        '@context' => 'https://schema.org',
        '@type' => 'FAQPage',
        'mainEntity' => seo_faq_entities($faq),
    ]);
}
?>
<main class="home">
  <h1>GPS Toolset</h1>
  <p class="home-lead">Free browser tools for GPS files. View a track on a map, convert formats, or edit a route — without uploading.</p>
  <p class="privacy-line">Your file never leaves your device.</p>
  <button type="button" class="dropzone" id="home-drop">
    <span class="dropzone-title">Drop a file here</span>
    <span class="dropzone-note">or choose one. GPX, KML, KMZ, or FIT.</span>
  </button>
  <p class="dropzone-error" id="home-drop-error" hidden></p>
  <p class="home-gopro">GoPro video? Open the <a href="/gopro-gps-extract">GoPro GPS extractor</a> and drop it there.</p>
  <input type="file" id="home-file" accept=".gpx,.kml,.kmz,.fit,application/gpx+xml,application/vnd.google-earth.kml+xml,application/vnd.google-earth.kmz" hidden>
  <?php render_ad('ad-home-mid'); ?>

  <section class="home-section" aria-labelledby="home-tools-heading">
    <h2 id="home-tools-heading">GPS file viewers</h2>
    <p>Open a track, route, or waypoints on a map. Speed and altitude graphs sit under the map. Switch Map / 3D when you want a 3D view over the street map.</p>
    <ul class="home-link-list">
      <li><a href="/gpx-viewer">GPX viewer</a> — open and read <code>.gpx</code> tracks online</li>
      <li><a href="/kml-viewer">KML viewer</a> — lines and placemarks from Google Earth / Maps</li>
      <li><a href="/kmz-viewer">KMZ viewer</a> — zipped KML packages</li>
      <li><a href="/fit-viewer">FIT viewer</a> — sports-watch and bike-computer activity files</li>
    </ul>
  </section>

  <section class="home-section" aria-labelledby="home-convert-heading">
    <h2 id="home-convert-heading">Convert and edit</h2>
    <p>Change format or clean up a path, then download the result. Everything runs in this browser.</p>
    <ul class="home-link-list">
      <li><a href="/convert">GPS file converter</a> — GPX, KML, KMZ, and FIT</li>
      <li><a href="/convert/kml-to-gpx">KML to GPX</a> · <a href="/convert/gpx-to-kml">GPX to KML</a> · <a href="/convert/fit-to-gpx">FIT to GPX</a></li>
      <li><a href="/convert/kmz-to-gpx">KMZ to GPX</a> · <a href="/convert/gpx-to-kmz">GPX to KMZ</a> · <a href="/convert/kmz-to-kml">KMZ to KML</a></li>
      <li><a href="/gpx-editor">GPX editor</a> — trim, simplify, reverse, merge, or split a track</li>
    </ul>
  </section>

  <section class="home-section" aria-labelledby="home-map-heading">
    <h2 id="home-map-heading">Map tools</h2>
    <ul class="home-link-list">
      <li><a href="/coordinate-converter">Coordinate converter</a> — decimal, DMS, UTM, and MGRS</li>
      <li><a href="/measure-distance">Measure distance</a> — click points on a map</li>
      <li><a href="/antipodes">Antipodes</a> — the point on the opposite side of Earth</li>
    </ul>
  </section>

  <section class="home-section" aria-labelledby="home-how-heading">
    <h2 id="home-how-heading">How it works</h2>
    <p>Drop a GPX, KML, KMZ, or FIT file above. The browser detects the format and opens the matching tool. Parsing stays on your device — there is no account and no upload. Map pictures load from OpenStreetMap so the path can be drawn; your GPS file is not sent with those tile requests.</p>
    <p>For a GoPro clip that recorded GPS, use the <a href="/gopro-gps-extract">GoPro GPS extractor</a>. That page reads the track in the video and can save GPX, CSV, or KML.</p>
  </section>

  <?php if ($faq !== []) : ?>
  <section class="home-section" aria-labelledby="home-faq-heading">
    <h2 id="home-faq-heading">Questions</h2>
    <div class="faq">
      <?php foreach ($faq as $item) : ?>
      <details class="faq-item">
        <summary><?= e((string) $item['q']) ?></summary>
        <p><?= e((string) $item['a']) ?></p>
      </details>
      <?php endforeach; ?>
    </div>
  </section>
  <?php endif; ?>

  <section class="home-guides" aria-labelledby="home-guides-heading">
    <h2 id="home-guides-heading">Guides</h2>
    <p>Short explainers for common GPS formats.</p>
    <ul class="home-guides-list">
      <li><a href="/guides">All guides</a></li>
      <li><a href="/guides/gpx-file">GPX</a></li>
      <li><a href="/guides/kml-file">KML</a></li>
      <li><a href="/guides/kmz-file">KMZ</a></li>
      <li><a href="/guides/fit-file">FIT</a></li>
      <li><a href="/guides/gpx-vs-kml">GPX vs KML</a></li>
      <li><a href="/guides/gps-file-formats">GPS file formats</a></li>
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
