<?php
declare(strict_types=1);

/** KML to GPX pair copy. Expects $route. */

$faq = $route['faq'];
$convertCardTitle = 'Convert a file';
$convertDropTitle = 'Drop a KML file here';
$convertDropNote = 'or choose a file. Nothing is uploaded.';
$convertChoose = 'Choose KML';
$convertAccept = '.kml,.kmz,.gpx,.fit';
$convertDownload = 'Download GPX';
$convertView = 'View on the map';
?>
<main class="tool-landing" id="tool-landing" data-from="kml" data-to="gpx">
  <div id="landing-overlay" class="landing-overlay" hidden>
    <p>Drop a KML file. Nothing is uploaded.</p>
  </div>

  <section class="tool-hero">
    <div class="tool-wrap tool-hero-grid">
      <div>
        <h1>KML to GPX</h1>
        <p class="tool-lead">Convert a KML file to GPX in the browser. The file stays on your device.</p>
        <ul class="tool-pills">
          <li>KML to GPX</li>
          <li>Tracks and waypoints</li>
          <li>Nothing uploaded</li>
        </ul>
        <p class="tool-copy">KML is the map file used by Google Earth and many other maps. This page reads it and writes a GPX file: one track for each line, and a waypoint for each point. Time and elevation are kept when the file has them.</p>
      </div>
      <?php require APP_ROOT . '/includes/partials/converter-card.php'; ?>
    </div>
  </section>

  <?php render_ad('ad-converter-mid'); ?>

  <section class="tool-section">
    <div class="tool-wrap">
      <h2>How to convert KML to GPX</h2>
      <ol class="tool-steps">
        <li class="tool-step">
          <span class="tool-step-num">1</span>
          <h3>Open the file</h3>
          <p>Drop a .kml file, or choose one. A file from Google Earth, a phone, or another map all work the same way.</p>
        </li>
        <li class="tool-step">
          <span class="tool-step-num">2</span>
          <h3>Read it here</h3>
          <p>The browser reads the paths and the points. Nothing is sent to a server.</p>
        </li>
        <li class="tool-step">
          <span class="tool-step-num">3</span>
          <h3>Save or view</h3>
          <p>Download the GPX, or open it on the map. The original KML on your device is left as it was.</p>
        </li>
      </ol>
    </div>
  </section>

  <section class="tool-section">
    <div class="tool-wrap tool-prose">
      <h2>What the GPX contains</h2>
      <ul>
        <li>A line becomes a GPX track. Several lines become several tracks in the one file.</li>
        <li>A track that has a time for each point keeps those times.</li>
        <li>A point placemark becomes a waypoint. It is not joined into the line.</li>
        <li>Photos, network links, and ground overlays are skipped.</li>
      </ul>
      <p>A KMZ file is the zipped form of KML. Convert that on <a href="/convert/kmz-to-gpx">KMZ to GPX</a>. You can also drop a KMZ here and the format list will follow the file.</p>
    </div>
  </section>

  <section class="tool-section">
    <div class="tool-wrap tool-prose">
      <h2>Privacy</h2>
      <p>Your file never leaves your device. There is no upload and no account. Closing the tab drops the file from this page. The GPX is saved only when you download it.</p>
    </div>
  </section>

  <section class="tool-section">
    <div class="tool-wrap tool-prose">
      <h2>Questions</h2>
      <div class="faq">
        <?php foreach ($faq as $item) : ?>
        <details class="faq-item">
          <summary><?= e($item['q']) ?></summary>
          <p><?= e($item['a']) ?></p>
        </details>
        <?php endforeach; ?>
      </div>
    </div>
  </section>

  <section class="tool-section">
    <div class="tool-wrap tool-prose">
      <h2>More on GPS Toolset</h2>
      <p>Open the GPX in the <a href="/gpx-viewer">GPX viewer</a>. Edit it in the <a href="/gpx-editor">GPX editor</a>. The other direction is <a href="/convert/gpx-to-kml">GPX to KML</a>. A FIT activity file converts on <a href="/convert/fit-to-gpx">FIT to GPX</a>.</p>
    </div>
  </section>
</main>
