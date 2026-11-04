<?php
declare(strict_types=1);

/**
 * Measure distance: guide HTML. The map is the first view (body.is-map).
 * This block stays in the page for readers and for the Guide button.
 * Expects $route (config/tools.php entry merged with meta.php).
 */

$faq = $route['faq'];
?>
<main class="tool-landing tool-guide" id="tool-guide">
  <noscript>
    <p class="tool-wrap tool-lead">The map needs JavaScript. Turn it on to measure distance.</p>
  </noscript>

  <section class="tool-hero">
    <div class="tool-wrap tool-hero-grid">
      <div>
        <h1>Measure distance on a map</h1>
        <p class="tool-lead">Click points on the map and read the distance. Each leg and the total update as you go.</p>
        <ul class="tool-pills">
          <li>Straight-line distance</li>
          <li>Kilometres or miles</li>
          <li>Nothing uploaded</li>
        </ul>
        <p class="tool-copy">Use it as a distance calculator on a map: a fence line, a walk, or the gap between two places. Add a point at each bend and it works as a route distance calculator for a path you trace yourself.</p>
      </div>

      <div class="tool-card measure-card">
        <h2>Open the map</h2>
        <p>The map fills the page. Distances sit under the map, and you can drag that panel taller.</p>
        <button type="button" class="tool-btn" id="measure-open">Measure on the map</button>
      </div>
    </div>
  </section>

  <section class="tool-section">
    <div class="tool-wrap">
      <h2>How to measure distance on a map</h2>
      <ol class="tool-steps">
        <li class="tool-step">
          <span class="tool-step-num">1</span>
          <h3>Open the map</h3>
          <p>The map is ready when the page loads. Zoom with the buttons or your scroll wheel, then find the place you want.</p>
        </li>
        <li class="tool-step">
          <span class="tool-step-num">2</span>
          <h3>Click each point</h3>
          <p>Two clicks measure one leg, and the line stops there. Click again to add another point. Done, or Escape, ends a longer line. A long leg bends with the earth.</p>
        </li>
        <li class="tool-step">
          <span class="tool-step-num">3</span>
          <h3>Read the total</h3>
          <p>The dock under the map shows the total and each leg. Switch between metric and imperial, or copy the figures.</p>
        </li>
      </ol>
    </div>
  </section>

  <section class="tool-section">
    <div class="tool-wrap tool-prose">
      <h2>Shortest path, not a driving route</h2>
      <p>Each leg is the shortest distance over the earth between two points, so a long leg curves on the map. It is not a driving route. To follow a road, add a point at each bend.</p>
      <p>Drag a point to move it. Undo removes the last point. Clear removes the whole line. My location adds a point where this browser says you are, and only if you allow it.</p>
    </div>
  </section>

  <section class="tool-section">
    <div class="tool-wrap tool-prose">
      <h2>Privacy</h2>
      <p>There is no account and no upload. The points stay in this browser tab. Closing the tab drops them. The map pictures load so the map can draw; the line is not sent as a saved route.</p>
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
      <p>If the track is already in a GoPro video, the <a href="/gopro-gps-extract">GoPro GPS extractor</a> reads it in the browser and can save GPX, CSV, or KML. The <a href="/antipodes">antipodes calculator</a> shows the point on the other side of the Earth.</p>
    </div>
  </section>
</main>
