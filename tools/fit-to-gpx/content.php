<?php
declare(strict_types=1);

/**
 * FIT to GPX: page copy.
 * Expects $route (config/tools.php entry merged with meta.php).
 */

$faq = $route['faq'];
$convertCardTitle = 'Convert a file';
$convertDropTitle = 'Drop a FIT file here';
$convertDropNote = 'or choose a file. Nothing is uploaded.';
$convertChoose = 'Choose FIT';
$convertAccept = '.fit,application/vnd.ant.fit';
$convertDownload = 'Download GPX';
$convertView = 'View on the map';
?>
<main class="tool-landing" id="tool-landing">
  <div id="landing-overlay" class="landing-overlay" hidden>
    <p>Drop a FIT file. Nothing is uploaded.</p>
  </div>

  <section class="tool-hero">
    <div class="tool-wrap tool-hero-grid">
      <div>
        <h1>FIT to GPX</h1>
        <p class="tool-lead">Convert a FIT file to GPX in the browser. The file stays on your device.</p>
        <ul class="tool-pills">
          <li>FIT to GPX</li>
          <li>Watch and bike computer</li>
          <li>Nothing uploaded</li>
        </ul>
        <p class="tool-copy">FIT is the activity file saved by many watches and bike computers, including a Garmin export. Drop the .fit file here. This page reads the GPS positions and writes a GPX file you can open on a map or in another app.</p>
      </div>
      <?php require APP_ROOT . '/includes/partials/converter-card.php'; ?>
    </div>
  </section>

  <?php render_ad('ad-converter-mid'); ?>

  <section class="tool-section">
    <div class="tool-wrap">
      <h2>How to convert FIT to GPX</h2>
      <ol class="tool-steps">
        <li class="tool-step">
          <span class="tool-step-num">1</span>
          <h3>Export the activity</h3>
          <p>Save the activity as a .fit file from the watch or its app. If the app already offers GPX, you can open that in the GPX viewer instead.</p>
        </li>
        <li class="tool-step">
          <span class="tool-step-num">2</span>
          <h3>Read it here</h3>
          <p>Drop the FIT file. The browser reads the positions, times, elevation, and speed. Nothing is sent to a server.</p>
        </li>
        <li class="tool-step">
          <span class="tool-step-num">3</span>
          <h3>Save or view</h3>
          <p>Download the GPX, or open it on the map. The original FIT file on your device is left as it was.</p>
        </li>
      </ol>
    </div>
  </section>

  <section class="tool-section">
    <div class="tool-wrap tool-prose">
      <h2>What the GPX contains</h2>
      <ul>
        <li>The GPS path becomes a track. Time, elevation, and speed are kept when the FIT file recorded them.</li>
        <li>If the file contains more than one sport and marks where each one starts, each sport becomes its own track.</li>
        <li>Heart rate, cadence, and power stay in the FIT file. They are not written into the GPX.</li>
        <li>An indoor activity with no GPS positions cannot be drawn. The page will say so.</li>
      </ul>
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
      <p>Open the GPX in the <a href="/gpx-viewer">GPX viewer</a> to see the track or edit it. A KML or KMZ file converts on the <a href="/kml-to-gpx">KML to GPX converter</a>, and the other direction is the <a href="/gpx-to-kml">GPX to KML converter</a>.</p>
    </div>
  </section>
</main>
