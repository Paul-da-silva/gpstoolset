<?php
declare(strict_types=1);

/**
 * Antipodes calculator. Routed by includes/router.php.
 *
 * Two maps side by side. This page does not use layout/map-app.php
 * (that shell is the file, graph, and export chrome).
 *
 * Expects $page and $route.
 */

require APP_ROOT . '/includes/layout/head.php';
require APP_ROOT . '/includes/layout/topbar.php';
?>
<div class="map-app" id="map-app">
  <div class="map-stage antipodes-stage" id="map-stage">
    <div class="antipodes-pane">
      <div id="map-pick" class="antipodes-map" role="region" aria-label="Map. Click to pick a point."></div>
      <p class="antipodes-label">Your point</p>
    </div>
    <div class="antipodes-pane">
      <div id="map-anti" class="antipodes-map" role="region" aria-label="Map of the point on the other side of the Earth."></div>
      <p class="antipodes-label">Other side</p>
    </div>
  </div>

  <section id="antipodes-dock" class="graph-dock antipodes-dock" aria-label="Antipodes">
    <div
      id="antipodes-handle"
      class="dock-handle"
      role="separator"
      tabindex="0"
      aria-orientation="horizontal"
      aria-label="Resize antipodes readout"
      aria-valuemin="120"
      aria-valuenow="280"
      aria-valuemax="280"
    ></div>
    <div class="antipodes-body">
      <h1>Antipodes calculator</h1>
      <div class="antipodes-readout">
        <div>
          <p class="antipodes-kicker">Your point</p>
          <p id="antipodes-here" class="antipodes-coord" aria-live="polite">Click the left map</p>
        </div>
        <div>
          <p class="antipodes-kicker">Other side</p>
          <p id="antipodes-there" class="antipodes-coord">—</p>
        </div>
      </div>
      <p class="antipodes-note">Click the left map. The right map moves to the opposite side of the Earth.</p>
      <div class="antipodes-actions">
        <button type="button" class="chip" id="antipodes-clear" disabled>Clear</button>
        <button type="button" class="chip" id="antipodes-locate">My location</button>
        <button type="button" class="chip" id="antipodes-copy" disabled>Copy</button>
        <button type="button" class="chip" id="antipodes-guide">Guide</button>
      </div>
      <p id="antipodes-status" class="antipodes-status" role="status"></p>
    </div>
  </section>
</div>
<?php
require __DIR__ . '/content.php';

$footerClose = false;
require APP_ROOT . '/includes/layout/footer.php';
?>
<noscript>
  <style>
    body.is-map { height: auto; max-height: none; overflow: auto; }
    body.is-map .map-app { display: none !important; }
    body.is-map .tool-guide,
    body.is-map .site-footer { display: block !important; }
  </style>
</noscript>
<?php
require APP_ROOT . '/includes/partials/scripts-map.php';

echo seo_json_ld([
    '@context' => 'https://schema.org',
    '@graph' => [
        [
            '@type' => 'SoftwareApplication',
            'name' => $route['schemaName'],
            'applicationCategory' => 'UtilitiesApplication',
            'operatingSystem' => 'Web',
            'url' => base_url($route['path']),
            'description' => $page['description'],
            'offers' => [
                '@type' => 'Offer',
                'price' => '0',
                'priceCurrency' => 'USD',
            ],
        ],
        [
            '@type' => 'FAQPage',
            'url' => base_url($route['path']),
            'mainEntity' => seo_faq_entities($route['faq']),
        ],
    ],
]);

require APP_ROOT . '/includes/layout/close.php';
