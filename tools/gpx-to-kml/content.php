<?php
declare(strict_types=1);

/**
 * GPX to KML: page copy.
 * Expects $route (config/tools.php entry merged with meta.php).
 */

$faq = $route['faq'];
$convertCardTitle = 'Convert a file';
$convertDropTitle = 'Drop a GPX file here';
$convertDropNote = 'or choose a file. Nothing is uploaded.';
$convertChoose = 'Choose GPX';
$convertAccept = '.gpx,application/gpx+xml';
$convertDownload = 'Download KML';
$convertView = 'View the GPX';
?>
<main class="tool-landing" id="tool-landing">
  <div id="landing-overlay" class="landing-overlay" hidden>
    <p>Drop a GPX file. Nothing is uploaded.</p>
  </div>

  <section class="tool-hero">
    <div class="tool-wrap tool-hero-grid">
      <div>
        <h1>GPX to KML</h1>
        <p class="tool-lead">Convert a GPX file to KML in the browser. The file stays on your device.</p>
        <ul class="tool-pills">
          <li>GPX to KML</li>
          <li>Tracks and waypoints</li>
          <li>Nothing uploaded</li>
        </ul>
        <p class="tool-copy">GPX is the usual file from a watch, a phone, or a GPS logger. KML is the file many maps open, including Google Earth. Each GPX track becomes a line. If the points have times, those times are written into the KML. Waypoints become placemarks.</p>
      </div>
      <?php require APP_ROOT . '/includes/partials/converter-card.php'; ?>
    </div>
  </section>

  <?php render_ad('ad-converter-mid'); ?>

  <section class="tool-section">
    <div class="tool-wrap">
      <h2>How to convert GPX to KML</h2>
      <ol class="tool-steps">
        <li class="tool-step">
          <span class="tool-step-num">1</span>
          <h3>Open the GPX</h3>
          <p>Drop a .gpx file, or choose one. A track, a route, or a file that is only waypoints all open the same way.</p>
        </li>
        <li class="tool-step">
          <span class="tool-step-num">2</span>
          <h3>Read it here</h3>
          <p>The browser reads the positions. Nothing is sent to a server.</p>
        </li>
        <li class="tool-step">
          <span class="tool-step-num">3</span>
          <h3>Download the KML</h3>
          <p>One KML file covers every track in the GPX. The original GPX on your device is left as it was.</p>
        </li>
      </ol>
    </div>
  </section>

  <section class="tool-section">
    <div class="tool-wrap tool-prose">
      <h2>What the KML contains</h2>
      <ul>
        <li>Each track becomes its own line.</li>
        <li>A route, when the file has no track, becomes a line.</li>
        <li>Waypoints become points, with the names from the GPX.</li>
        <li>Elevation is kept when the GPX has it.</li>
        <li>If every point on a track has a time, the KML keeps those times.</li>
      </ul>
    </div>
  </section>

  <section class="tool-section">
    <div class="tool-wrap tool-prose">
      <h2>Privacy</h2>
      <p>Your file never leaves your device. There is no upload and no account. Closing the tab drops the file from this page. The KML is saved only when you download it.</p>
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
      <p>Open the same GPX in the <a href="/gpx-viewer">GPX viewer</a> to see it on a map or edit the track. The other direction is the <a href="/kml-to-gpx">KML to GPX converter</a>. A FIT activity file converts on the <a href="/fit-to-gpx">FIT to GPX converter</a>.</p>
    </div>
  </section>
</main>
