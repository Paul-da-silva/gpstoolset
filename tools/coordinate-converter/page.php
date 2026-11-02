<?php
declare(strict_types=1);

/**
 * Coordinate converter page. Routed by includes/router.php.
 * Document layout. The preview map is not the full-screen map shell.
 *
 * Expects $page and $route.
 */

$bands = str_split('CDEFGHJKLMNPQRSTUVWX');

require APP_ROOT . '/includes/layout/head.php';
require APP_ROOT . '/includes/layout/topbar.php';
?>
<main class="tool-landing" id="coord-app">
  <section class="tool-hero">
    <div class="tool-wrap">
      <h1>Coordinate converter</h1>
      <p class="tool-lead">Turn a latitude and longitude into degrees, minutes and seconds, UTM, or MGRS. Paste a coordinate, or type one in.</p>
      <noscript><p class="tool-lead">This converter needs JavaScript.</p></noscript>
      <p class="tool-privacy">Your coordinate never leaves your device.</p>

      <div class="coord-tool">
        <div>
          <form id="coord-form" action="" autocomplete="off" novalidate>
            <label class="coord-label" for="coord-paste">Paste a coordinate
              <input class="coord-paste" id="coord-paste" type="text" inputmode="text" autocapitalize="characters" spellcheck="false" maxlength="80" placeholder="Latitude, longitude — or UTM, or MGRS">
            </label>
            <p class="coord-hint">Decimal degrees, degrees and minutes, UTM, or MGRS.</p>
            <p id="coord-error" class="tool-error" role="alert" hidden></p>

            <div class="coord-formats" role="group" aria-label="Input format">
              <button type="button" class="chip" data-format="decimal" aria-pressed="true">Decimal</button>
              <button type="button" class="chip" data-format="dms" aria-pressed="false">DMS</button>
              <button type="button" class="chip" data-format="ddm" aria-pressed="false">DDM</button>
              <button type="button" class="chip" data-format="utm" aria-pressed="false">UTM</button>
              <button type="button" class="chip" data-format="mgrs" aria-pressed="false">MGRS</button>
            </div>

            <div data-panel="decimal">
              <div class="coord-fields">
                <label class="coord-label">Latitude
                  <input id="dec-lat" type="text" inputmode="decimal" spellcheck="false" autocomplete="off">
                </label>
                <label class="coord-label">Longitude
                  <input id="dec-lon" type="text" inputmode="decimal" spellcheck="false" autocomplete="off">
                </label>
              </div>
            </div>

            <div data-panel="dms" hidden>
              <div class="coord-fields">
                <div class="coord-angle">
                  <p class="coord-axis">Latitude</p>
                  <label class="coord-label">Degrees <input id="dms-lat-d" type="text" inputmode="decimal" autocomplete="off"></label>
                  <label class="coord-label">Minutes <input id="dms-lat-m" type="text" inputmode="decimal" autocomplete="off"></label>
                  <label class="coord-label">Seconds <input id="dms-lat-s" type="text" inputmode="decimal" autocomplete="off"></label>
                  <label class="coord-label">Side
                    <select id="dms-lat-h">
                      <option value="N">N</option>
                      <option value="S">S</option>
                    </select>
                  </label>
                </div>
                <div class="coord-angle">
                  <p class="coord-axis">Longitude</p>
                  <label class="coord-label">Degrees <input id="dms-lon-d" type="text" inputmode="decimal" autocomplete="off"></label>
                  <label class="coord-label">Minutes <input id="dms-lon-m" type="text" inputmode="decimal" autocomplete="off"></label>
                  <label class="coord-label">Seconds <input id="dms-lon-s" type="text" inputmode="decimal" autocomplete="off"></label>
                  <label class="coord-label">Side
                    <select id="dms-lon-h">
                      <option value="E">E</option>
                      <option value="W">W</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>

            <div data-panel="ddm" hidden>
              <div class="coord-fields">
                <div class="coord-angle is-ddm">
                  <p class="coord-axis">Latitude</p>
                  <label class="coord-label">Degrees <input id="ddm-lat-d" type="text" inputmode="decimal" autocomplete="off"></label>
                  <label class="coord-label">Minutes <input id="ddm-lat-m" type="text" inputmode="decimal" autocomplete="off"></label>
                  <label class="coord-label">Side
                    <select id="ddm-lat-h">
                      <option value="N">N</option>
                      <option value="S">S</option>
                    </select>
                  </label>
                </div>
                <div class="coord-angle is-ddm">
                  <p class="coord-axis">Longitude</p>
                  <label class="coord-label">Degrees <input id="ddm-lon-d" type="text" inputmode="decimal" autocomplete="off"></label>
                  <label class="coord-label">Minutes <input id="ddm-lon-m" type="text" inputmode="decimal" autocomplete="off"></label>
                  <label class="coord-label">Side
                    <select id="ddm-lon-h">
                      <option value="E">E</option>
                      <option value="W">W</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>

            <div data-panel="utm" hidden>
              <div class="coord-fields">
                <div class="coord-grid-2">
                  <label class="coord-label">Zone
                    <input id="utm-zone" type="text" inputmode="numeric" maxlength="2" autocomplete="off">
                  </label>
                  <label class="coord-label">Band
                    <select id="utm-band">
                      <option value="">Band</option>
                      <?php foreach ($bands as $band) : ?>
                      <option value="<?= e($band) ?>"><?= e($band) ?></option>
                      <?php endforeach; ?>
                    </select>
                  </label>
                  <label class="coord-label">Easting (m)
                    <input id="utm-e" type="text" inputmode="decimal" autocomplete="off">
                  </label>
                  <label class="coord-label">Northing (m)
                    <input id="utm-n" type="text" inputmode="decimal" autocomplete="off">
                  </label>
                </div>
                <p class="coord-hint">The letter is the latitude band. Band S is north of the equator, not south.</p>
              </div>
            </div>

            <div data-panel="mgrs" hidden>
              <div class="coord-fields">
                <label class="coord-label">MGRS grid
                  <input id="mgrs-text" type="text" autocapitalize="characters" spellcheck="false" maxlength="24" autocomplete="off">
                </label>
              </div>
            </div>
          </form>

          <p id="coord-empty" class="coord-empty">Enter a coordinate to see the other forms.</p>
          <div id="coord-results" class="coord-results" hidden>
            <div class="coord-row">
              <div>
                <span class="coord-k">Decimal</span>
                <span class="coord-v" id="out-decimal"></span>
                <span class="coord-sub">Latitude, longitude. South and west are negative.</span>
              </div>
              <button type="button" class="chip" data-copy="decimal">Copy</button>
            </div>
            <div class="coord-row">
              <div>
                <span class="coord-k">DMS</span>
                <span class="coord-v" id="out-dms"></span>
                <span class="coord-sub">Degrees, minutes, and seconds.</span>
              </div>
              <button type="button" class="chip" data-copy="dms">Copy</button>
            </div>
            <div class="coord-row">
              <div>
                <span class="coord-k">DDM</span>
                <span class="coord-v" id="out-ddm"></span>
                <span class="coord-sub">Degrees and decimal minutes.</span>
              </div>
              <button type="button" class="chip" data-copy="ddm">Copy</button>
            </div>
            <div class="coord-row">
              <div>
                <span class="coord-k">UTM</span>
                <span class="coord-v" id="out-utm"></span>
                <span class="coord-sub" id="out-utm-note"></span>
              </div>
              <button type="button" class="chip" data-copy="utm">Copy</button>
            </div>
            <div class="coord-row">
              <div>
                <span class="coord-k">MGRS</span>
                <span class="coord-v" id="out-mgrs"></span>
                <span class="coord-sub" id="out-mgrs-note"></span>
              </div>
              <button type="button" class="chip" data-copy="mgrs">Copy</button>
            </div>
            <button type="button" class="chip coord-copy-all" data-copy="all">Copy all</button>
          </div>
        </div>

        <div class="coord-side">
          <div id="coord-map" class="coord-map" role="region" aria-label="Map preview. Click to set the coordinate."></div>
          <p class="coord-hint" id="coord-map-hint">Click the map to set the point. Map pictures load so you can see the place. The numbers stay in this tab.</p>
        </div>
      </div>
      <?php render_ad('ad-converter-mid'); ?>
    </div>
  </section>
  <?php require __DIR__ . '/content.php'; ?>
</main>
<?php
$footerClose = false;
require APP_ROOT . '/includes/layout/footer.php';
require APP_ROOT . '/includes/partials/tile-config.php';

$moduleSrc = '/assets/js/tools/coordinate-converter.js';
$moduleFile = APP_ROOT . '/public' . $moduleSrc;
$moduleSrc .= '?v=' . (is_file($moduleFile) ? (string) filemtime($moduleFile) : '1');
?>
<script src="/assets/vendor/leaflet/leaflet.js"></script>
<script type="module" src="<?= e($moduleSrc) ?>"></script>
<?php
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
