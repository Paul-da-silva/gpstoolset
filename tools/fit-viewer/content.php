<?php
declare(strict_types=1);

/** FIT viewer landing copy. Expects $route. */

$faq = $route['faq'];
?>
<main class="tool-landing" id="tool-landing" data-format="fit" data-slug="fit-viewer">
  <div id="landing-overlay" class="landing-overlay" hidden>
    <p>Drop a FIT file. Nothing is uploaded.</p>
  </div>

  <section class="tool-hero">
    <div class="tool-wrap tool-hero-grid">
      <div>
        <h1>FIT Viewer</h1>
        <p class="tool-lead">Open a FIT activity file on a map. The GPS path stays on your device.</p>
        <ul class="tool-pills">
          <li>FIT viewer online</li>
          <li>Watch and bike computer</li>
          <li>Nothing uploaded</li>
        </ul>
        <p class="tool-copy">FIT is the activity file saved by many watches and bike computers. Drop the .fit file. This page reads the GPS positions and draws the path, with time, elevation, speed, and heart rate when the file recorded them.</p>
      </div>

      <div class="tool-card">
        <h2>Open a FIT file</h2>
        <button type="button" class="tool-drop" data-file-pick>
          <span class="tool-drop-title">Drop a FIT file here</span>
          <span class="tool-drop-note">or choose a file. Nothing is uploaded.</span>
        </button>
        <p id="landing-file" class="tool-file" hidden></p>
        <p id="landing-error" class="tool-error" role="alert" hidden></p>
        <div id="landing-progress" class="tool-progress" hidden>
          <p id="landing-progress-label">Reading the FIT file…</p>
          <div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="Reading the FIT file">
            <div id="landing-progress-bar" class="progress-bar"></div>
          </div>
          <button type="button" class="tool-btn tool-btn-quiet" id="landing-cancel">Cancel</button>
        </div>
        <div class="tool-actions">
          <button type="button" class="tool-btn" data-file-pick>Choose FIT</button>
          <p class="tool-privacy">Your file never leaves your device.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="tool-section">
    <div class="tool-wrap">
      <h2>How to view a FIT file</h2>
      <ol class="tool-steps">
        <li class="tool-step">
          <span class="tool-step-num">1</span>
          <h3>Export the activity</h3>
          <p>Save the activity as a .fit file from the watch or its app.</p>
        </li>
        <li class="tool-step">
          <span class="tool-step-num">2</span>
          <h3>Read it here</h3>
          <p>Drop the file. The browser reads the positions. Nothing is sent to a server.</p>
        </li>
        <li class="tool-step">
          <span class="tool-step-num">3</span>
          <h3>Save or edit</h3>
          <p>Export GPX, KML, KMZ, or CSV. FIT is not written back. To change the path, open the <a href="/gpx-editor">GPX editor</a>.</p>
        </li>
      </ol>
    </div>
  </section>

  <section class="tool-section">
    <div class="tool-wrap tool-prose">
      <h2>What the map shows</h2>
      <ul>
        <li>The GPS path, with time, elevation, and speed when the file recorded them.</li>
        <li>Each sport, when the file marks them separately, is its own part.</li>
        <li>Heart rate is a graph when the file recorded it. Cadence and power stay in the FIT file.</li>
        <li>An indoor activity with no GPS positions cannot be drawn. The page will say so.</li>
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
      <p>Save a GPX on <a href="/convert/fit-to-gpx">FIT to GPX</a>. Edit the path in the <a href="/gpx-editor">GPX editor</a>. A GPX file you already have opens in the <a href="/gpx-viewer">GPX viewer</a>.</p>
    </div>
  </section>
</main>
