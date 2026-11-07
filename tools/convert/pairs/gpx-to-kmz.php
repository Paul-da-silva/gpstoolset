<?php
declare(strict_types=1);

/** GPX to KMZ pair copy. Expects $route. */

$faq = $route['faq'];
$convertCardTitle = 'Convert a file';
$convertDropTitle = 'Drop a GPX file here';
$convertDropNote = 'or choose a file. Nothing is uploaded.';
$convertChoose = 'Choose GPX';
$convertAccept = '.gpx,.kml,.kmz,.fit,.ubx';
$convertDownload = 'Download KMZ';
$convertView = 'View on the map';
?>
<main class="tool-landing" id="tool-landing" data-from="gpx" data-to="kmz">
  <div id="landing-overlay" class="landing-overlay" hidden>
    <p>Drop a GPX file. Nothing is uploaded.</p>
  </div>

  <section class="tool-hero">
    <div class="tool-wrap tool-hero-grid">
      <div>
        <h1>GPX to KMZ</h1>
        <p class="tool-lead">Convert a GPX file to KMZ in the browser. The tracks are packed into one file on your device.</p>
        <ul class="tool-pills">
          <li>GPX to KMZ</li>
          <li>One packed map file</li>
          <li>Nothing uploaded</li>
        </ul>
        <p class="tool-copy">KMZ is a KML file zipped, which is what many maps ask for when they want a single download. Each GPX track becomes a line inside doc.kml. Waypoints become placemarks. Time and elevation are kept when the GPX has them.</p>
      </div>
      <?php require APP_ROOT . '/includes/partials/converter-card.php'; ?>
    </div>
  </section>

  <?php render_ad('ad-converter-mid'); ?>

  <section class="tool-section">
    <div class="tool-wrap">
      <h2>How to convert GPX to KMZ</h2>
      <ol class="tool-steps">
        <li class="tool-step">
          <span class="tool-step-num">1</span>
          <h3>Open the GPX</h3>
          <p>Drop a .gpx file, or choose one. A track, a route, or waypoints all open the same way.</p>
        </li>
        <li class="tool-step">
          <span class="tool-step-num">2</span>
          <h3>Read it here</h3>
          <p>The browser reads the positions and packs them into a KMZ. Nothing is sent to a server.</p>
        </li>
        <li class="tool-step">
          <span class="tool-step-num">3</span>
          <h3>Download the KMZ</h3>
          <p>One file holds every track. The original GPX on your device is left as it was.</p>
        </li>
      </ol>
    </div>
  </section>

  <section class="tool-section">
    <div class="tool-wrap tool-prose">
      <h2>KMZ or KML</h2>
      <p>KMZ is the packed file. If you want the plain XML, use <a href="/convert/gpx-to-kml">GPX to KML</a>. Both keep the same paths and points.</p>
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
      <p>Open the KMZ in the <a href="/kmz-viewer">KMZ viewer</a>. The other direction is <a href="/convert/kmz-to-gpx">KMZ to GPX</a>. Edit the track first in the <a href="/gpx-editor">GPX editor</a> if you need to trim it.</p>
    </div>
  </section>
</main>
