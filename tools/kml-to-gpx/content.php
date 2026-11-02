<?php
declare(strict_types=1);

/**
 * KML / KMZ to GPX: page copy.
 * Expects $route (config/tools.php entry merged with meta.php).
 */

$faq = $route['faq'];
$convertCardTitle = 'Convert a file';
$convertDropTitle = 'Drop a KML or KMZ file here';
$convertDropNote = 'or choose a file. Nothing is uploaded.';
$convertChoose = 'Choose KML or KMZ';
$convertAccept = '.kml,.kmz,application/vnd.google-earth.kml+xml,application/vnd.google-earth.kmz';
$convertDownload = 'Download GPX';
$convertView = 'View on the map';
?>
<main class="tool-landing" id="tool-landing">
  <div id="landing-overlay" class="landing-overlay" hidden>
    <p>Drop a KML or KMZ file. Nothing is uploaded.</p>
  </div>

  <section class="tool-hero">
    <div class="tool-wrap tool-hero-grid">
      <div>
        <h1>KML to GPX</h1>
        <p class="tool-lead">Convert a KML or KMZ file to GPX in the browser. The file stays on your device.</p>
        <ul class="tool-pills">
          <li>KML to GPX</li>
          <li>KMZ to GPX</li>
          <li>Nothing uploaded</li>
        </ul>
        <p class="tool-copy">KML is the map file used by Google Earth and many other maps. KMZ is that same KML, zipped. This page reads either one and writes a GPX file: one track for each line, and a waypoint for each point. Time and elevation are kept when the file has them.</p>
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
          <p>Drop a .kml or .kmz file, or choose one. A file from Google Earth, a phone, or another map all work the same way.</p>
        </li>
        <li class="tool-step">
          <span class="tool-step-num">2</span>
          <h3>Read it here</h3>
          <p>The browser reads the paths and the points. A KMZ file is unzipped here too. Nothing is sent to a server.</p>
        </li>
        <li class="tool-step">
          <span class="tool-step-num">3</span>
          <h3>Save or view</h3>
          <p>Download the GPX, or open it on the map. The original KML or KMZ on your device is left as it was.</p>
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
        <li>A polygon outline is kept as a line. The filled area is not a track.</li>
        <li>Photos, network links, and ground overlays are skipped. They are not a GPS track.</li>
      </ul>
    </div>
  </section>

  <section class="tool-section">
    <div class="tool-wrap tool-prose">
      <h2>KMZ to GPX</h2>
      <p>A KMZ file is a zip. The page looks for the KML inside it, usually named doc.kml, and converts that. Pictures packed next to the KML are ignored. If the KMZ uses a compression this browser cannot read, unzip it and drop the .kml file instead.</p>
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
      <p>Open the GPX in the <a href="/gpx-viewer">GPX viewer</a> to see the track, trim it, or save CSV. The other direction is the <a href="/gpx-to-kml">GPX to KML converter</a>. A FIT activity file converts on the <a href="/fit-to-gpx">FIT to GPX converter</a>.</p>
    </div>
  </section>
</main>
