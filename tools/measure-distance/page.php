<?php
declare(strict_types=1);

/**
 * Measure distance page. Routed by includes/router.php.
 *
 * The map is the tool, so this page does not use layout/map-app.php
 * (that shell is the file, graph, and export chrome). It does use the
 * same map stage, dock, and chip classes.
 *
 * Expects $page and $route.
 */

require APP_ROOT . '/includes/layout/head.php';
require APP_ROOT . '/includes/layout/topbar.php';
?>
<div class="map-app" id="map-app">
  <div class="map-stage" id="map-stage">
    <div id="map" role="region" aria-label="Map. Click to add a point and measure distance."></div>
  </div>

  <section id="measure-dock" class="graph-dock measure-dock" aria-label="Distance">
    <div
      id="measure-handle"
      class="dock-handle"
      role="separator"
      tabindex="0"
      aria-orientation="horizontal"
      aria-label="Resize distance readout"
      aria-valuemin="120"
      aria-valuenow="300"
      aria-valuemax="300"
    ></div>
    <div class="measure-body">
      <div class="measure-head">
        <div>
          <h1>Measure distance on a map</h1>
          <p class="measure-kicker">Total</p>
          <p id="measure-total" class="measure-total">0 m</p>
        </div>
        <div class="unit-switch" role="group" aria-label="Units">
          <button type="button" class="chip" data-units="metric" aria-pressed="true">Metric</button>
          <button type="button" class="chip" data-units="imperial" aria-pressed="false">Imperial</button>
        </div>
      </div>
      <p id="measure-next" class="measure-next" hidden></p>
      <div class="measure-actions">
        <button type="button" class="chip" id="measure-undo" disabled>Undo</button>
        <button type="button" class="chip" id="measure-clear" disabled>Clear</button>
        <button type="button" class="chip" id="measure-fit" disabled>Fit</button>
        <button type="button" class="chip" id="measure-done" disabled>Done</button>
        <button type="button" class="chip" id="measure-locate">My location</button>
        <button type="button" class="chip" id="measure-copy" disabled>Copy</button>
        <button type="button" class="chip" id="measure-guide">Guide</button>
      </div>
      <p class="measure-note">Click or tap to add a point. Two points finish the leg. Click again to continue, then Done or Escape. Long legs curve with the earth.</p>
      <p id="measure-status" class="measure-status" role="status"></p>
      <ol id="measure-legs" class="measure-legs" aria-label="Points"></ol>
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
