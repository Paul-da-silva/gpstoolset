<?php
declare(strict_types=1);

/**
 * GoPro GPS Extractor page. Thin: layout, landing content, map app, scripts.
 * Routed by includes/router.php. Expects $page and $route.
 *   meta.php     title, description, flags, FAQ, scripts
 *   content.php  pre-upload landing HTML
 *   app JS       public/assets/js/tools/gopro-gps-extract.js
 */

require APP_ROOT . '/includes/layout/head.php';
require APP_ROOT . '/includes/layout/topbar.php';
require __DIR__ . '/content.php';

$footerClose = false;
require APP_ROOT . '/includes/layout/footer.php';

$mapShellHeading = '';
$mapShellLead = 'Drop a video or choose one. Nothing is uploaded.';
$mapShellNote = 'Works with GoPro HERO video that recorded GPS. The file stays in this browser.';
$mapShellDropText = 'Drop a GoPro video. Nothing is uploaded.';
$mapShellAccept = '.mp4,.lrv,video/*';
$mapShellVideo = true;
$mapShellEmpty = true;
$mapAppHidden = true;
$mapAppFileInput = false;
require APP_ROOT . '/includes/layout/map-app.php';
?>
<input id="file-input" class="file-input" type="file" tabindex="-1" aria-hidden="true" accept="<?= e($mapShellAccept) ?>">
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
