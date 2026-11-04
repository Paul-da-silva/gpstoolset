<?php
declare(strict_types=1);

/**
 * Antipodes calculator: guide HTML. The maps are the first view (body.is-map).
 * This block stays in the page for readers and for the Guide button.
 * Expects $route (config/tools.php entry merged with meta.php).
 */

$faq = $route['faq'];
?>
<main class="tool-landing tool-guide" id="tool-guide">
  <noscript>
    <p class="tool-wrap tool-lead">The maps need JavaScript. Turn it on to find the opposite point.</p>
  </noscript>

  <section class="tool-hero">
    <div class="tool-wrap tool-hero-grid">
      <div>
        <h1>Antipodes calculator</h1>
        <p class="tool-lead">Pick a point on the left map. The right map shows the place on the other side of the Earth.</p>
        <ul class="tool-pills">
          <li>Two maps, one point</li>
          <li>Opposite through the Earth</li>
          <li>Nothing uploaded</li>
        </ul>
        <p class="tool-copy">An antipode is the point you would reach by drilling straight through the centre of the planet. This antipodes calculator marks that point and moves the map so you can see what is there: coast, city, or open ocean.</p>
      </div>

      <div class="tool-card antipodes-card">
        <h2>Open the maps</h2>
        <p>The screen is split in two. Click the left map. The right map moves to the opposite point.</p>
        <button type="button" class="tool-btn" id="antipodes-open">Find the other side</button>
      </div>
    </div>
  </section>

  <section class="tool-section">
    <div class="tool-wrap">
      <h2>How to find the other side of a point</h2>
      <ol class="tool-steps">
        <li class="tool-step">
          <span class="tool-step-num">1</span>
          <h3>Click the left map</h3>
          <p>Zoom to the place you care about, then click. The left map centres on that point and marks it. Drag the marker if you want to nudge it.</p>
        </li>
        <li class="tool-step">
          <span class="tool-step-num">2</span>
          <h3>Read the opposite point</h3>
          <p>The right map pans to the antipode and marks it. The coordinates of both points sit under the maps.</p>
        </li>
        <li class="tool-step">
          <span class="tool-step-num">3</span>
          <h3>Look at what is there</h3>
          <p>Zoom the right map to see the coast, a city, or empty ocean. My location uses this browser’s position, and only if you allow it.</p>
        </li>
      </ol>
    </div>
  </section>

  <section class="tool-section">
    <div class="tool-wrap tool-prose">
      <h2>How the opposite point is calculated</h2>
      <p>Latitude changes sign, so north becomes south and south becomes north. Longitude moves halfway around the planet, by 180°. A place just east of Greenwich has its opposite just west of the date line.</p>
      <p>The Eiffel Tower is 48.8584° N, 2.2945° E. Its antipode is 48.8584° S, 177.7055° W, in the South Pacific, south-east of New Zealand. Most of Europe and Africa land in that ocean. Eastern China more often lands in South America, because the Pacific is narrower there.</p>
      <p>The two maps use the same zoom when you pick a point, so a city-scale click shows the other side at city scale, and a wide view stays wide.</p>
    </div>
  </section>

  <section class="tool-section">
    <div class="tool-wrap tool-prose">
      <h2>Privacy</h2>
      <p>There is no account and no upload. The point stays in this browser tab. Closing the tab drops it. The map pictures load so the maps can draw. The coordinates are not saved as a place on a server.</p>
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
      <p><a href="/coordinate-converter">Convert the coordinates</a> between decimal degrees, DMS, UTM, and MGRS. <a href="/measure-distance">Measure distance on a map</a> when you want the length between two places instead of the point opposite one of them.</p>
    </div>
  </section>
</main>
