<?php
declare(strict_types=1);

/** Converter hub copy. Pair pages use tools/convert/pairs/. Expects $route. */

$faq = $route['faq'];
$convertCardTitle = 'Convert a file';
$convertDropTitle = 'Drop a GPS file here';
$convertDropNote = 'GPX, KML, KMZ, FIT, or UBX. Nothing is uploaded.';
$convertChoose = 'Choose a file';
$convertAccept = '.gpx,.kml,.kmz,.fit,.ubx';
$convertDownload = 'Download';
$convertView = 'View on the map';
?>
<main class="tool-landing" id="tool-landing">
  <div id="landing-overlay" class="landing-overlay" hidden>
    <p>Drop a GPS file. Nothing is uploaded.</p>
  </div>

  <section class="tool-hero">
    <div class="tool-wrap tool-hero-grid">
      <div>
        <h1>GPS file converter</h1>
        <p class="tool-lead">Convert GPX, KML, KMZ, FIT, and UBX in the browser. Pick the formats. The file stays on your device.</p>
        <ul class="tool-pills">
          <li>Any GPS file in</li>
          <li>GPX, KML, or KMZ out</li>
          <li>Nothing uploaded</li>
        </ul>
        <p class="tool-copy">Choose a source and a result, then drop the file. A link can preselect the formats, for example <a href="/convert?from=kml&amp;to=gpx">KML to GPX</a>. Named pages such as <a href="/convert/fit-to-gpx">FIT to GPX</a> open the same converter with those formats already chosen.</p>
      </div>
      <?php require APP_ROOT . '/includes/partials/converter-card.php'; ?>
    </div>
  </section>

  <?php render_ad('ad-converter-mid'); ?>

  <section class="tool-section">
    <div class="tool-wrap">
      <h2>How to convert a GPS file</h2>
      <ol class="tool-steps">
        <li class="tool-step">
          <span class="tool-step-num">1</span>
          <h3>Choose the formats</h3>
          <p>From is the file you have. To is the file you want. FIT and UBX can be read. GPX, KML, and KMZ can be saved.</p>
        </li>
        <li class="tool-step">
          <span class="tool-step-num">2</span>
          <h3>Open the file</h3>
          <p>Drop it or choose it. The browser reads the tracks and the points. Nothing is sent to a server.</p>
        </li>
        <li class="tool-step">
          <span class="tool-step-num">3</span>
          <h3>Download or view</h3>
          <p>Save the file, or open it on the map. The original file on your device is left as it was.</p>
        </li>
      </ol>
    </div>
  </section>

  <section class="tool-section">
    <div class="tool-wrap tool-prose">
      <h2>Common conversions</h2>
      <ul>
        <li><a href="/convert/kml-to-gpx">KML to GPX</a></li>
        <li><a href="/convert/gpx-to-kml">GPX to KML</a></li>
        <li><a href="/convert/fit-to-gpx">FIT to GPX</a></li>
        <li><a href="/convert/ubx-to-gpx">UBX to GPX</a></li>
        <li><a href="/convert/kmz-to-gpx">KMZ to GPX</a></li>
        <li><a href="/convert/gpx-to-kmz">GPX to KMZ</a></li>
        <li><a href="/convert/kmz-to-kml">KMZ to KML</a></li>
      </ul>
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
      <p>Open the result in the <a href="/gpx-viewer">GPX viewer</a>, <a href="/kml-viewer">KML viewer</a>, or <a href="/kmz-viewer">KMZ viewer</a>. Edit the path in the <a href="/gpx-editor">GPX editor</a>.</p>
    </div>
  </section>
</main>
