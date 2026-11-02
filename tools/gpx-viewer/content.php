<?php
declare(strict_types=1);

/**
 * GPX viewer: pre-upload landing HTML only.
 * Hidden by public/assets/js/tools/gpx-viewer.js once a file loads.
 * Expects $route (config/tools.php entry merged with meta.php).
 */

$faq = $route['faq'];
?>
<main class="tool-landing" id="tool-landing">
  <div id="landing-overlay" class="landing-overlay" hidden>
    <p>Drop a GPX file. Nothing is uploaded.</p>
  </div>

  <section class="tool-hero">
    <div class="tool-wrap tool-hero-grid">
      <div>
        <h1>GPX Viewer &amp; Editor</h1>
        <p class="tool-lead">Open a GPX file on a map, check the speed and altitude, and edit the track. The file stays on your device.</p>
        <ul class="tool-pills">
          <li>GPX viewer online</li>
          <li>Edit the track</li>
          <li>GPX to CSV</li>
        </ul>
        <p class="tool-copy">This GPX viewer reads a track, a route, or waypoints. After it loads, the map fills the page. Speed, altitude, distance, and time sit under the map. Trim, simplify, reverse, or fix elevation spikes, then download GPX, CSV, or KML.</p>
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
          <h3>Edit or export</h3>
          <p>Trim the ends, thin a dense line, reverse it, or fix a bad elevation spike. The map shows the change before you keep it. Save GPX, a CSV for a spreadsheet, or KML.</p>
        </li>
      </ol>
    </div>
  </section>

  <section class="tool-section">
    <div class="tool-wrap tool-prose">
      <h2>A GPX viewer online, with the editor on the same map</h2>
      <p>Drop the file and the route fills the map. Start and end are marked. Open Graphs for speed, altitude, distance, and time. If the file has several tracks, each one is listed and the map shows the one you pick.</p>
      <p>Waypoints stay as points on the map. They are not joined into a line. A route with no track is drawn as the line you can edit.</p>
    </div>
  </section>

  <section class="tool-section">
    <div class="tool-wrap tool-prose">
      <h2>What you can edit</h2>
      <ul>
        <li>Trim keeps the points between two handles on one bar. The bright line on the map is the part you keep.</li>
        <li>Simplify drops points that sit close to a straight line. Drag the distance and the map shows the points that would remain.</li>
        <li>Reverse flips the direction. The timestamps still run forward, so the graphs stay readable.</li>
        <li>Fix elevation replaces isolated spikes and fills short gaps from nearby points in the file. It does not download new heights.</li>
      </ul>
      <p>Undo puts the last edit back. The original file on your device is left as it was until you download a new one.</p>
    </div>
  </section>

  <section class="tool-section">
    <div class="tool-wrap tool-prose">
      <h2>GPX to CSV, or back to GPX and KML</h2>
      <p>Export writes a file on this device. GPX is the track you are viewing. If the file already has several tracks, the GPX download keeps every part. CSV is one row per point: time, latitude, longitude, altitude in metres, and speed in metres per second. KML is the line for an earth-style map.</p>
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
      <p>A video from a GoPro camera that recorded GPS can be read on the <a href="/gopro-gps-extract">GoPro GPS extractor</a>, then opened here if you download the GPX. A KML or KMZ file can be turned into GPX on the <a href="/kml-to-gpx">KML to GPX converter</a>. The other way is the <a href="/gpx-to-kml">GPX to KML converter</a>. A FIT activity file converts on the <a href="/fit-to-gpx">FIT to GPX converter</a>.</p>
    </div>
  </section>
</main>
