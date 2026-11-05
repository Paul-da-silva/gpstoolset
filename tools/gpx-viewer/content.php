<?php
declare(strict_types=1);

/**
 * GPX viewer: pre-upload landing HTML only.
 * Hidden once a file loads. Expects $route.
 */

$faq = $route['faq'];
?>
<main class="tool-landing" id="tool-landing" data-format="gpx" data-slug="gpx-viewer">
  <div id="landing-overlay" class="landing-overlay" hidden>
    <p>Drop a GPX file. Nothing is uploaded.</p>
  </div>

  <section class="tool-hero">
    <div class="tool-wrap tool-hero-grid">
      <div>
        <h1>Online GPX Viewer &amp; Reader</h1>
        <p class="tool-lead">View and read GPX files online — drop a .gpx to open the track, see waypoints, and check the route. A free GPX reader; nothing is uploaded to our servers.</p>
        <ul class="tool-pills">
          <li>GPX viewer online</li>
          <li>Speed and altitude</li>
          <li>Nothing uploaded</li>
        </ul>
        <p class="tool-copy">This page reads a track, a route, or waypoints. After it loads, the map fills the page. Speed, altitude, distance, and time sit under the map. Heart rate appears there when the file recorded it. To change the track, open the <a href="/gpx-editor">GPX editor</a>.</p>
      </div>

      <div class="tool-card">
        <h2>Open a GPX file</h2>
        <button type="button" class="tool-drop" data-file-pick>
          <span class="tool-drop-title">Drop a GPX file here</span>
          <span class="tool-drop-note">or choose a file. Nothing is uploaded.</span>
        </button>
        <p id="landing-file" class="tool-file" hidden></p>
        <p id="landing-error" class="tool-error" role="alert" hidden></p>
        <div id="landing-progress" class="tool-progress" hidden>
          <p id="landing-progress-label">Reading the GPX…</p>
          <div id="landing-progress-track" class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="Reading the GPX">
            <div id="landing-progress-bar" class="progress-bar"></div>
          </div>
          <button type="button" class="tool-btn tool-btn-quiet" id="landing-cancel">Cancel</button>
        </div>
        <div class="tool-actions">
          <button type="button" class="tool-btn" data-file-pick>Choose GPX</button>
          <p class="tool-privacy">Your file never leaves your device.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="tool-section">
    <div class="tool-wrap">
      <h2>How it works</h2>
      <ol class="tool-steps">
        <li class="tool-step">
          <span class="tool-step-num">1</span>
          <h3>Open the file</h3>
          <p>Drop a .gpx file, or choose one. A track from a watch, a phone, a logger, or a camera export all open the same way.</p>
        </li>
        <li class="tool-step">
          <span class="tool-step-num">2</span>
          <h3>Read it here</h3>
          <p>The browser draws the path and the graphs. That read stays on your device. Nothing is sent to a server.</p>
        </li>
        <li class="tool-step">
          <span class="tool-step-num">3</span>
          <h3>Export, or edit</h3>
          <p>Save GPX, KML, KMZ, or a CSV. To trim, simplify, reverse, merge, or split the track, continue in the <a href="/gpx-editor">GPX editor</a>.</p>
        </li>
      </ol>
    </div>
  </section>

  <section class="tool-section">
    <div class="tool-wrap tool-prose">
      <h2>A GPX file viewer online</h2>
      <p>Drop the file and the route fills the map. Start and end are marked. This GPX reader online shows speed, altitude, distance, and time under Graphs. Heart rate is listed when the file includes it. If the file has several tracks, each one is listed and the map shows the one you pick.</p>
      <p>Waypoints stay as points on the map. They are not joined into a line. A route with no track is drawn as the line.</p>
    </div>
  </section>

  <section class="tool-section">
    <div class="tool-wrap tool-prose">
      <h2>GPX, KML, KMZ, or CSV</h2>
      <p>Export writes a file on this device. GPX, KML, and KMZ keep every part. CSV is one row per point for the part you are viewing: time, latitude, longitude, altitude in metres, and speed in metres per second.</p>
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
      <p>Edit the track in the <a href="/gpx-editor">GPX editor</a>. Convert it with <a href="/convert/gpx-to-kml">GPX to KML</a> or <a href="/convert/gpx-to-kmz">GPX to KMZ</a>. Open a <a href="/kml-viewer">KML file</a>, a <a href="/kmz-viewer">KMZ file</a>, or a <a href="/fit-viewer">FIT file</a> in the same viewer. A GoPro video that recorded GPS can be read on the <a href="/gopro-gps-extract">GoPro GPS extractor</a>.</p>
    </div>
  </section>
</main>
