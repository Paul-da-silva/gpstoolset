<?php
declare(strict_types=1);

/** KMZ to GPX pair copy. Expects $route. */

$faq = $route['faq'];
$convertCardTitle = 'Convert a file';
$convertDropTitle = 'Drop a KMZ file here';
$convertDropNote = 'or choose a file. Nothing is uploaded.';
$convertChoose = 'Choose KMZ';
$convertAccept = '.kmz,.kml,.gpx,.fit';
$convertDownload = 'Download GPX';
$convertView = 'View on the map';
?>
<main class="tool-landing" id="tool-landing" data-from="kmz" data-to="gpx">
  <div id="landing-overlay" class="landing-overlay" hidden>
    <p>Drop a KMZ file. Nothing is uploaded.</p>
  </div>

  <section class="tool-hero">
    <div class="tool-wrap tool-hero-grid">
      <div>
        <h1>KMZ to GPX</h1>
        <p class="tool-lead">Convert a KMZ file to GPX in the browser. The zip is read on your device.</p>
        <ul class="tool-pills">
          <li>KMZ to GPX</li>
          <li>Zipped KML</li>
          <li>Nothing uploaded</li>
        </ul>
        <p class="tool-copy">KMZ is a KML map packed into a zip. This page finds the KML inside, usually doc.kml, and writes a GPX file. Each line becomes a track. Point placemarks become waypoints. Pictures in the zip are skipped.</p>
      </div>
      <?php require APP_ROOT . '/includes/partials/converter-card.php'; ?>
    </div>
  </section>

  <?php render_ad('ad-converter-mid'); ?>

  <section class="tool-section">
    <div class="tool-wrap">
      <h2>How to convert KMZ to GPX</h2>
      <ol class="tool-steps">
        <li class="tool-step">
          <span class="tool-step-num">1</span>
          <h3>Open the KMZ</h3>
          <p>Drop a .kmz file, or choose one. The page unzips it in the browser.</p>
        </li>
        <li class="tool-step">
          <span class="tool-step-num">2</span>
          <h3>Read the map inside</h3>
          <p>Paths and points are kept. Pictures, network links, and ground overlays are not. Nothing is sent to a server.</p>
        </li>
        <li class="tool-step">
          <span class="tool-step-num">3</span>
          <h3>Save the GPX</h3>
          <p>Download it, or open it on the map. The original KMZ on your device is left as it was.</p>
        </li>
      </ol>
    </div>
  </section>

  <section class="tool-section">
    <div class="tool-wrap tool-prose">
      <h2>KMZ, not a plain KML</h2>
      <p>A .kml file is already unzipped. Convert that on <a href="/convert/kml-to-gpx">KML to GPX</a>. If this page cannot read the zip, unzip it on your device and drop the .kml file.</p>
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
      <p>Open the GPX in the <a href="/gpx-viewer">GPX viewer</a> or look at the KMZ itself in the <a href="/kmz-viewer">KMZ viewer</a>. Unpack to KML on <a href="/convert/kmz-to-kml">KMZ to KML</a>.</p>
    </div>
  </section>
</main>
