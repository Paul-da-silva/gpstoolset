<?php
declare(strict_types=1);

/**
 * GPX viewer page. Thin: layout, landing content, map app, scripts.
 * Routed by includes/router.php. Expects $page and $route.
 */

require APP_ROOT . '/includes/layout/head.php';
require APP_ROOT . '/includes/layout/topbar.php';
require __DIR__ . '/content.php';

$footerClose = false;
require APP_ROOT . '/includes/layout/footer.php';

$mapShellHeading = '';
$mapShellLead = 'Drop a GPX file or choose one. Nothing is uploaded.';
$mapShellNote = 'Tracks, routes, and waypoints. The file stays in this browser.';
$mapShellDropText = 'Drop a GPX file. Nothing is uploaded.';
$mapShellAccept = '.gpx,application/gpx+xml';
$mapShellVideo = false;
$mapShellEdit = true;
$mapShellEmpty = true;
$mapAppHidden = true;
require APP_ROOT . '/includes/layout/map-app.php';

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
