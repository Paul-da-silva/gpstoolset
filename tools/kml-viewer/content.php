<?php
declare(strict_types=1);

/** KML viewer landing copy. Expects $route. */

$faq = $route['faq'];
?>
<main class="tool-landing" id="tool-landing" data-format="kml" data-slug="kml-viewer">
  <div id="landing-overlay" class="landing-overlay" hidden>
    <p>Drop a KML file. Nothing is uploaded.</p>
  </div>

  <section class="tool-hero">
    <div class="tool-wrap tool-hero-grid">
      <div>
        <h1>KML Viewer</h1>
        <p class="tool-lead">Open a KML file on a map. Lines and point placemarks stay on your device.</p>
        <ul class="tool-pills">
          <li>KML viewer online</li>
          <li>Lines and placemarks</li>
          <li>Nothing uploaded</li>
        </ul>
        <p class="tool-copy">KML is the map file used by Google Earth and many other maps. Drop a .kml file and the paths draw on the map. Point placemarks stay as waypoints. A zipped KMZ file belongs on the <a href="/kmz-viewer">KMZ viewer</a>.</p>
      </div>

      <div class="tool-card">
        <h2>Open a KML file</h2>
        <button type="button" class="tool-drop" data-file-pick>
          <span class="tool-drop-title">Drop a KML file here</span>
          <span class="tool-drop-note">or choose a file. Nothing is uploaded.</span>
        </button>
        <p id="landing-file" class="tool-file" hidden></p>
        <p id="landing-error" class="tool-error" role="alert" hidden></p>
        <div id="landing-progress" class="tool-progress" hidden>
          <p id="landing-progress-label">Reading the KML…</p>
          <div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="Reading the KML">
            <div id="landing-progress-bar" class="progress-bar"></div>
          </div>
          <button type="button" class="tool-btn tool-btn-quiet" id="landing-cancel">Cancel</button>
        </div>
        <div class="tool-actions">
          <button type="button" class="tool-btn" data-file-pick>Choose KML</button>
          <p class="tool-privacy">Your file never leaves your device.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="tool-section">
    <div class="tool-wrap">
      <h2>How to view a KML file</h2>
      <ol class="tool-steps">
        <li class="tool-step">
          <span class="tool-step-num">1</span>
          <h3>Open the file</h3>
          <p>Drop a .kml file, or choose one. A file from Google Earth, a phone, or another map all open the same way.</p>
        </li>
        <li class="tool-step">
          <span class="tool-step-num">2</span>
          <h3>Read it here</h3>
          <p>The browser draws each line and each point. Nothing is sent to a server.</p>
        </li>
        <li class="tool-step">
          <span class="tool-step-num">3</span>
          <h3>Save or edit</h3>
          <p>Export GPX, KML, KMZ, or CSV. To change the path, open the <a href="/gpx-editor">GPX editor</a>.</p>
        </li>
      </ol>
    </div>
  </section>

  <section class="tool-section">
    <div class="tool-wrap tool-prose">
      <h2>What you see</h2>
      <ul>
        <li>A line becomes the track on the map. Several lines are listed, and you pick one.</li>
        <li>A point placemark stays a waypoint. It is not joined into the line.</li>
        <li>Time and elevation show in the graphs when the file has them.</li>
        <li>Photos, network links, and ground overlays are skipped. They are not a GPS track.</li>
      </ul>
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
      <p>A zipped file opens in the <a href="/kmz-viewer">KMZ viewer</a>. Turn KML into GPX on <a href="/convert/kml-to-gpx">KML to GPX</a>, or the other way on <a href="/convert/gpx-to-kml">GPX to KML</a>. Edit the path in the <a href="/gpx-editor">GPX editor</a>.</p>
    </div>
  </section>
</main>
