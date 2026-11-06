<?php
declare(strict_types=1);

/** KMZ viewer landing copy. Expects $route. */

$faq = $route['faq'];
?>
<main class="tool-landing" id="tool-landing" data-format="kmz" data-slug="kmz-viewer">
  <div id="landing-overlay" class="landing-overlay" hidden>
    <p>Drop a KMZ file. Nothing is uploaded.</p>
  </div>

  <section class="tool-hero">
    <div class="tool-wrap tool-hero-grid">
      <div>
        <h1>Online KMZ Viewer, Reader &amp; 3D</h1>
        <p class="tool-lead">Open a KMZ file on a map. The browser reads the KML inside the zip. Switch Map / 3D to see the track in 3D over the street map. A free KMZ reader; nothing is uploaded.</p>
        <ul class="tool-pills">
          <li>KMZ viewer online</li>
          <li>Zipped KML</li>
          <li>Nothing uploaded</li>
        </ul>
        <p class="tool-copy">KMZ is a KML file packed into a zip, sometimes with pictures beside it. This page unzips it in the browser and draws the paths. A plain .kml file belongs on the <a href="/kml-viewer">KML viewer</a>.</p>
      </div>

      <div class="tool-card">
        <h2>Open a KMZ file</h2>
        <button type="button" class="tool-drop" data-file-pick>
          <span class="tool-drop-title">Drop a KMZ file here</span>
          <span class="tool-drop-note">or choose a file. Nothing is uploaded.</span>
        </button>
        <p id="landing-file" class="tool-file" hidden></p>
        <p id="landing-error" class="tool-error" role="alert" hidden></p>
        <div id="landing-progress" class="tool-progress" hidden>
          <p id="landing-progress-label">Reading the KMZ…</p>
          <div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="Reading the KMZ">
            <div id="landing-progress-bar" class="progress-bar"></div>
          </div>
          <button type="button" class="tool-btn tool-btn-quiet" id="landing-cancel">Cancel</button>
        </div>
        <div class="tool-actions">
          <button type="button" class="tool-btn" data-file-pick>Choose KMZ</button>
          <p class="tool-privacy">Your file never leaves your device.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="tool-section">
    <div class="tool-wrap">
      <h2>How to view a KMZ file</h2>
      <ol class="tool-steps">
        <li class="tool-step">
          <span class="tool-step-num">1</span>
          <h3>Open the zip</h3>
          <p>Drop a .kmz file, or choose one. The page looks for the KML inside, usually named doc.kml.</p>
        </li>
        <li class="tool-step">
          <span class="tool-step-num">2</span>
          <h3>Read it here</h3>
          <p>Paths and point placemarks are drawn on the map. After it loads, use Map / 3D for a KMZ 3D viewer over the street map. Pictures in the zip are skipped. Nothing is sent to a server.</p>
        </li>
        <li class="tool-step">
          <span class="tool-step-num">3</span>
          <h3>Save or edit</h3>
          <p>Export GPX, KML, KMZ, or CSV. Change the path in the <a href="/gpx-editor">GPX editor</a>.</p>
        </li>
      </ol>
    </div>
  </section>

  <section class="tool-section">
    <div class="tool-wrap tool-prose">
      <h2>KMZ and KML</h2>
      <p>KMZ is the packed file. KML is the map inside it. If this page cannot read the zip, unzip it on your device and open the .kml file in the <a href="/kml-viewer">KML viewer</a>.</p>
    </div>
  </section>

  <section class="tool-section">
    <div class="tool-wrap tool-prose">
      <h2>Privacy</h2>
      <p>Your file never leaves your device. There is no upload and no account. Closing the tab drops the track from this page.</p>
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
      <p>Convert the file on <a href="/convert/kmz-to-gpx">KMZ to GPX</a> or <a href="/convert/kmz-to-kml">KMZ to KML</a>. A plain KML file opens in the <a href="/kml-viewer">KML viewer</a>. Edit the path in the <a href="/gpx-editor">GPX editor</a>.</p>
    </div>
  </section>
</main>
