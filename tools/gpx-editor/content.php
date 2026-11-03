<?php
declare(strict_types=1);

/** GPX / track editor landing copy. Expects $route. */

$faq = $route['faq'];
?>
<main class="tool-landing" id="tool-landing">
  <div id="landing-overlay" class="landing-overlay" hidden>
    <p>Drop a GPS file. Nothing is uploaded.</p>
  </div>

  <section class="tool-hero">
    <div class="tool-wrap tool-hero-grid">
      <div>
        <h1>GPX Editor</h1>
        <p class="tool-lead">Edit a GPS track on the map. Open GPX, KML, KMZ, or FIT. The file stays on your device.</p>
        <ul class="tool-pills">
          <li>GPX editor online</li>
          <li>Merge and split</li>
          <li>Nothing uploaded</li>
        </ul>
        <p class="tool-copy">Drop one file or several. The map and the graphs update as you edit. Merge tracks, split one track in two, trim the ends, simplify a dense line, reverse the direction, or fix an elevation spike. Then download GPX, KML, KMZ, or CSV.</p>
      </div>

      <div class="tool-card">
        <h2>Open a track</h2>
        <button type="button" class="tool-drop" data-file-pick>
          <span class="tool-drop-title">Drop a GPS file here</span>
          <span class="tool-drop-note">GPX, KML, KMZ, or FIT. One file or several. Nothing is uploaded.</span>
        </button>
        <p id="landing-file" class="tool-file" hidden></p>
        <p id="landing-error" class="tool-error" role="alert" hidden></p>
        <div id="landing-progress" class="tool-progress" hidden>
          <p id="landing-progress-label">Reading the file…</p>
          <div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="Reading the file">
            <div id="landing-progress-bar" class="progress-bar"></div>
          </div>
          <button type="button" class="tool-btn tool-btn-quiet" id="landing-cancel">Cancel</button>
        </div>
        <div class="tool-actions">
          <button type="button" class="tool-btn" data-file-pick>Choose files</button>
          <p class="tool-privacy">Your file never leaves your device.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="tool-section">
    <div class="tool-wrap">
      <h2>How to edit a track</h2>
      <ol class="tool-steps">
        <li class="tool-step">
          <span class="tool-step-num">1</span>
          <h3>Open the files</h3>
          <p>Drop GPX, KML, KMZ, or FIT. Several files become several parts on the same map.</p>
        </li>
        <li class="tool-step">
          <span class="tool-step-num">2</span>
          <h3>Edit on the map</h3>
          <p>Merge, split, trim, simplify, reverse, or fix elevation. The bright line is the preview. The track changes only when you apply the edit.</p>
        </li>
        <li class="tool-step">
          <span class="tool-step-num">3</span>
          <h3>Download</h3>
          <p>Save GPX, KML, KMZ, or CSV. The original file on your device is left as it was.</p>
        </li>
      </ol>
    </div>
  </section>

  <section class="tool-section">
    <div class="tool-wrap tool-prose">
      <h2>What you can change</h2>
      <ul>
        <li>Merge joins every part into one track, in the order listed.</li>
        <li>Split cuts the part you are editing into two. Each side keeps at least two points.</li>
        <li>Trim keeps the points between two handles. The bright line is the part you keep.</li>
        <li>Simplify drops points that sit close to a straight line.</li>
        <li>Reverse flips the direction. The timestamps still run forward.</li>
        <li>Fix elevation replaces isolated spikes and fills short gaps from nearby points. It does not download new heights.</li>
      </ul>
      <p>Undo puts the last edit back.</p>
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
      <p>View a file without editing in the <a href="/gpx-viewer">GPX viewer</a>, <a href="/kml-viewer">KML viewer</a>, <a href="/kmz-viewer">KMZ viewer</a>, or <a href="/fit-viewer">FIT viewer</a>. Convert a file on the <a href="/convert">converter</a>.</p>
    </div>
  </section>
</main>
