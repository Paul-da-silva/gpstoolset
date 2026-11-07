<?php
declare(strict_types=1);

/** UBX viewer landing copy. Expects $route. */

$faq = $route['faq'];
?>
<main class="tool-landing" id="tool-landing" data-format="ubx" data-slug="ubx-viewer">
  <div id="landing-overlay" class="landing-overlay" hidden>
    <p>Drop a UBX file. Nothing is uploaded.</p>
  </div>

  <section class="tool-hero">
    <div class="tool-wrap tool-hero-grid">
      <div>
        <h1>Online UBX Viewer, Reader &amp; 3D</h1>
        <p class="tool-lead">Open and read a u-blox UBX log on a map. The GPS track stays on your device. Switch Map / 3D to see the track in 3D over the street map. A free UBX reader; nothing is uploaded.</p>
        <ul class="tool-pills">
          <li>UBX viewer online</li>
          <li>u-blox GNSS logs</li>
          <li>Nothing uploaded</li>
        </ul>
        <p class="tool-copy">UBX is a binary log from u-blox GNSS receivers. Drop the .ubx file. This page reads NAV-PVT positions and draws the track, with time, elevation, and speed when those fields were recorded.</p>
      </div>

      <div class="tool-card">
        <h2>Open a UBX file</h2>
        <button type="button" class="tool-drop" data-file-pick>
          <span class="tool-drop-title">Drop a UBX file here</span>
          <span class="tool-drop-note">or choose a file. Nothing is uploaded.</span>
        </button>
        <p id="landing-file" class="tool-file" hidden></p>
        <p id="landing-error" class="tool-error" role="alert" hidden></p>
        <div id="landing-progress" class="tool-progress" hidden>
          <p id="landing-progress-label">Reading the UBX file…</p>
          <div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="Reading the UBX file">
            <div id="landing-progress-bar" class="progress-bar"></div>
          </div>
          <button type="button" class="tool-btn tool-btn-quiet" id="landing-cancel">Cancel</button>
        </div>
        <div class="tool-actions">
          <button type="button" class="tool-btn" data-file-pick>Choose UBX</button>
          <p class="tool-privacy">Your file never leaves your device.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="tool-section">
    <div class="tool-wrap">
      <h2>How to view a UBX file</h2>
      <ol class="tool-steps">
        <li class="tool-step">
          <span class="tool-step-num">1</span>
          <h3>Save the log</h3>
          <p>Record a .ubx file from the receiver with NAV-PVT output turned on.</p>
        </li>
        <li class="tool-step">
          <span class="tool-step-num">2</span>
          <h3>Read it here</h3>
          <p>Drop the file. The browser reads the positions. After it loads, use Map / 3D for a UBX 3D viewer over the street map. Nothing is sent to a server.</p>
        </li>
        <li class="tool-step">
          <span class="tool-step-num">3</span>
          <h3>Save or edit</h3>
          <p>Export GPX, KML, KMZ, or CSV. UBX is not written back. To change the path, convert to GPX and open the <a href="/gpx-editor">GPX editor</a>.</p>
        </li>
      </ol>
    </div>
  </section>

  <section class="tool-section">
    <div class="tool-wrap tool-prose">
      <h2>What the map shows</h2>
      <ul>
        <li>The GPS path from NAV-PVT, with time, elevation, and speed when the log recorded them.</li>
        <li>If the log has no NAV-PVT, NAV-POSLLH positions are used as a fallback (without time).</li>
        <li>Raw measurement messages are skipped. This page does not post-process RXM data.</li>
        <li>A log with no usable positions cannot be drawn. The page will say so.</li>
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
      <p>Save a GPX on <a href="/convert/ubx-to-gpx">UBX to GPX</a>. Edit the path in the <a href="/gpx-editor">GPX editor</a>. A GPX file you already have opens in the <a href="/gpx-viewer">GPX viewer</a>. More on the format in the <a href="/guides/ubx-file">UBX file guide</a>.</p>
    </div>
  </section>
</main>
