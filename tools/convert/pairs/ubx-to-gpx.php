<?php
declare(strict_types=1);

/** UBX to GPX pair copy. Expects $route. */

$faq = $route['faq'];
$convertCardTitle = 'Convert a file';
$convertDropTitle = 'Drop a UBX file here';
$convertDropNote = 'or choose a file. Nothing is uploaded.';
$convertChoose = 'Choose UBX';
$convertAccept = '.ubx,.gpx,.kml,.kmz,.fit';
$convertDownload = 'Download GPX';
$convertView = 'View on the map';
?>
<main class="tool-landing" id="tool-landing" data-from="ubx" data-to="gpx">
  <div id="landing-overlay" class="landing-overlay" hidden>
    <p>Drop a UBX file. Nothing is uploaded.</p>
  </div>

  <section class="tool-hero">
    <div class="tool-wrap tool-hero-grid">
      <div>
        <h1>UBX to GPX</h1>
        <p class="tool-lead">Convert a u-blox UBX log to GPX in the browser. The file stays on your device.</p>
        <ul class="tool-pills">
          <li>UBX to GPX</li>
          <li>u-blox GNSS logs</li>
          <li>Nothing uploaded</li>
        </ul>
        <p class="tool-copy">UBX is a binary log from u-blox GNSS receivers. Drop the .ubx file here. This page reads NAV-PVT positions and writes a GPX file you can open on a map or in another app.</p>
      </div>
      <?php require APP_ROOT . '/includes/partials/converter-card.php'; ?>
    </div>
  </section>

  <?php render_ad('ad-converter-mid'); ?>

  <section class="tool-section">
    <div class="tool-wrap">
      <h2>How to convert UBX to GPX</h2>
      <ol class="tool-steps">
        <li class="tool-step">
          <span class="tool-step-num">1</span>
          <h3>Save the log</h3>
          <p>Record a .ubx file from the receiver with NAV-PVT output turned on.</p>
        </li>
        <li class="tool-step">
          <span class="tool-step-num">2</span>
          <h3>Read it here</h3>
          <p>Drop the UBX file. The browser reads the positions, times, elevation, and speed. Nothing is sent to a server.</p>
        </li>
        <li class="tool-step">
          <span class="tool-step-num">3</span>
          <h3>Save or view</h3>
          <p>Download the GPX, or open it on the map. The original UBX file on your device is left as it was.</p>
        </li>
      </ol>
    </div>
  </section>

  <section class="tool-section">
    <div class="tool-wrap tool-prose">
      <h2>What the GPX contains</h2>
      <ul>
        <li>The GPS path becomes a track. Time, elevation, and speed are kept when NAV-PVT recorded them.</li>
        <li>Other UBX messages, including raw measurements, are skipped.</li>
        <li>A log with no usable positions cannot be drawn. The page will say so.</li>
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
      <p>Open the GPX in the <a href="/gpx-viewer">GPX viewer</a> or edit it in the <a href="/gpx-editor">GPX editor</a>. View the raw log in the <a href="/ubx-viewer">UBX viewer</a>. Format notes: <a href="/guides/ubx-file">What is a UBX file?</a></p>
    </div>
  </section>
</main>
