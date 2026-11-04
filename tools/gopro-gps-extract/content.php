<?php
declare(strict_types=1);

/**
 * GoPro GPS Extractor: pre-upload landing HTML only (hero, how it works, FAQ).
 * Hidden by public/assets/js/tools/gopro-gps-extract.js once a video loads.
 * Expects $route (config/tools.php entry merged with meta.php).
 */

$faq = $route['faq'];
?>
<main class="tool-landing" id="tool-landing">
  <div id="landing-overlay" class="landing-overlay" hidden>
    <p>Drop a GoPro video. Nothing is uploaded.</p>
  </div>

  <section class="tool-hero">
    <div class="tool-wrap tool-hero-grid">
      <div>
        <h1>GoPro GPS Extractor</h1>
        <p class="tool-lead">Extract GPS from a GoPro video and download a GPX, CSV, or KML file. Your video stays on your device.</p>
        <ul class="tool-pills">
          <li>MP4 or LRV</li>
          <li>Map view</li>
          <li>Video view</li>
        </ul>
        <p class="tool-copy">Works with GoPro HERO video that recorded GPS. An .MP4 or the smaller .LRV proxy both work. GPS has to be on in the camera while it records. “GoPro” here is compatibility: the camera writes the track, and this page reads it.</p>
      </div>

      <div class="tool-card">
        <h2>Open a GoPro video</h2>
        <button type="button" class="tool-drop" data-file-pick>
          <span class="tool-drop-title">Drop a video here</span>
          <span class="tool-drop-note">or choose a file. Nothing is uploaded.</span>
        </button>
        <p id="landing-file" class="tool-file" hidden></p>
        <p id="landing-error" class="tool-error" role="alert" hidden></p>
        <div id="landing-progress" class="tool-progress" hidden>
          <p id="landing-progress-label">Reading GPS from the video…</p>
          <div id="landing-progress-track" class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" aria-label="Reading GPS from the video">
            <div id="landing-progress-bar" class="progress-bar"></div>
          </div>
          <button type="button" class="tool-btn tool-btn-quiet" id="landing-cancel">Cancel</button>
        </div>
        <div class="tool-actions">
          <button type="button" class="tool-btn" data-file-pick>Choose video</button>
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
          <h3>Open a video</h3>
          <p>Choose a GoPro .MP4 or .LRV, or drop it on this page. The .LRV proxy is smaller and usually faster, with the same GPS.</p>
        </li>
        <li class="tool-step">
          <span class="tool-step-num">2</span>
          <h3>Read the GPS here</h3>
          <p>The browser reads the GoPro GPS data stored in the file. That read stays on your device. Nothing is sent to a server.</p>
        </li>
        <li class="tool-step">
          <span class="tool-step-num">3</span>
          <h3>Use the track</h3>
          <p>See the path on a map, open speed and altitude, and download GPX, CSV, or KML. You can also play the clip with a live map and speed overlay.</p>
        </li>
      </ol>
    </div>
  </section>

  <section class="tool-section">
    <div class="tool-wrap tool-prose">
      <h2>Extract GPS from a GoPro video</h2>
      <p>This GoPro GPS extractor is for a clip you already have on your computer or phone. It reads the GPS data in the video and draws the path. When you want a file for another app, download a GoPro GPX, or take CSV or KML instead.</p>
      <p>After the track loads, the map fills the page. Speed, altitude, distance, and time sit under the map. Video view plays your clip from this device: a small map follows the camera, and you can turn each number on or off.</p>
    </div>
  </section>

  <section class="tool-section">
    <div class="tool-wrap tool-prose">
      <h2>What you get</h2>
      <ul>
        <li>The track on a street map, fitted to the route.</li>
        <li>Speed and altitude graphs under the map.</li>
        <li>A download of the path as GPX, CSV, or KML.</li>
        <li>Video view: the clip, a live map, and a speed overlay, synced to the video clock.</li>
      </ul>
    </div>
  </section>

  <section class="tool-section">
    <div class="tool-wrap tool-prose">
      <h2>Cameras this can read</h2>
      <p>It works with GoPro HERO models that embed GPS in the video (often called GPMF). HERO5 and newer cameras that record GPS do that, including MAX. HERO12 has no GPS, and Session cameras do not. GPS has to be on while the camera records. This is not a GoPro product, and it does not sign in to a camera account or a cloud library.</p>
    </div>
  </section>

  <section class="tool-section">
    <div class="tool-wrap tool-prose">
      <h2>Privacy</h2>
      <p>Your file never leaves your device. There is no upload and no account. Closing the tab drops the video from this page.</p>
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
      <p>Open a track you already have in the <a href="/gpx-viewer">GPX viewer</a>. Short guides to GPS files will live with the other tools.</p>
      <p class="tool-credit">GPS reading uses the open-source libraries <a href="https://github.com/JuanIrache/gpmf-extract">gpmf-extract</a> and <a href="https://github.com/JuanIrache/gopro-telemetry">gopro-telemetry</a> by Juan Irache, under the ISC license.</p>
    </div>
  </section>
</main>
