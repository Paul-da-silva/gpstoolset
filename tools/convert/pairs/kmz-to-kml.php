<?php
declare(strict_types=1);

/** KMZ to KML pair copy. Expects $route. */

$faq = $route['faq'];
$convertCardTitle = 'Convert a file';
$convertDropTitle = 'Drop a KMZ file here';
$convertDropNote = 'or choose a file. Nothing is uploaded.';
$convertChoose = 'Choose KMZ';
$convertAccept = '.kmz,.kml,.gpx,.fit';
$convertDownload = 'Download KML';
$convertView = 'View on the map';
?>
<main class="tool-landing" id="tool-landing" data-from="kmz" data-to="kml">
  <div id="landing-overlay" class="landing-overlay" hidden>
    <p>Drop a KMZ file. Nothing is uploaded.</p>
  </div>

  <section class="tool-hero">
    <div class="tool-wrap tool-hero-grid">
      <div>
        <h1>KMZ to KML</h1>
        <p class="tool-lead">Convert a KMZ file to KML in the browser. Paths and points are written as a KML file on your device.</p>
        <ul class="tool-pills">
          <li>KMZ to KML</li>
          <li>Paths and points</li>
          <li>Nothing uploaded</li>
        </ul>
        <p class="tool-copy">KMZ is a zip. This page reads the map inside it and writes a KML file you can open in a map that wants the plain file. Lines stay lines. Point placemarks stay points. Pictures packed in the KMZ are not copied across.</p>
      </div>
      <?php require APP_ROOT . '/includes/partials/converter-card.php'; ?>
    </div>
  </section>

  <?php render_ad('ad-converter-mid'); ?>

  <section class="tool-section">
    <div class="tool-wrap">
      <h2>How to convert KMZ to KML</h2>
      <ol class="tool-steps">
        <li class="tool-step">
          <span class="tool-step-num">1</span>
          <h3>Open the KMZ</h3>
          <p>Drop a .kmz file, or choose one. The browser unzips it here.</p>
        </li>
        <li class="tool-step">
          <span class="tool-step-num">2</span>
          <h3>Read the paths</h3>
          <p>Each line and each point placemark is kept. Photos and ground overlays are skipped. Nothing is sent to a server.</p>
        </li>
        <li class="tool-step">
          <span class="tool-step-num">3</span>
          <h3>Download the KML</h3>
          <p>Save the KML, or open it on the map. The original KMZ on your device is left as it was.</p>
        </li>
      </ol>
    </div>
  </section>

  <section class="tool-section">
    <div class="tool-wrap tool-prose">
      <h2>Not a byte-for-byte unzip</h2>
      <p>The result is the GPS paths and points, written as KML. If you need the original pictures as well, unzip the KMZ on your device and use the files inside it. To turn the same KMZ into GPX, use <a href="/convert/kmz-to-gpx">KMZ to GPX</a>.</p>
    </div>
  </section>

  <section class="tool-section">
    <div class="tool-wrap tool-prose">
      <h2>Privacy</h2>
      <p>Your file never leaves your device. There is no upload and no account. Closing the tab drops the file from this page.</p>
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
      <p>Open the KML in the <a href="/kml-viewer">KML viewer</a> or the KMZ in the <a href="/kmz-viewer">KMZ viewer</a>. The other direction, from a GPX file, is <a href="/convert/gpx-to-kml">GPX to KML</a>.</p>
    </div>
  </section>
</main>
