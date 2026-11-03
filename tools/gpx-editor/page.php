<?php
declare(strict_types=1);

/**
 * GPX / track editor page. SEO copy is content.php.
 * The editor module only receives the parsed document.
 * Expects $page and $route.
 */

require APP_ROOT . '/includes/layout/head.php';
require APP_ROOT . '/includes/layout/topbar.php';
require __DIR__ . '/content.php';

$footerClose = false;
require APP_ROOT . '/includes/layout/footer.php';

$accepts = [];
foreach (formats_registry() as $format) {
    if (is_array($format) && !empty($format['accept'])) {
        $accepts[] = (string) $format['accept'];
    }
}

$mapShellHeading = '';
$mapShellLead = 'Drop a GPX, KML, KMZ, or FIT file. Nothing is uploaded.';
$mapShellNote = 'Drop more than one file to add each track. The files stay in this browser.';
$mapShellDropText = 'Drop a GPS file. Nothing is uploaded.';
$mapShellAccept = implode(',', $accepts);
$mapShellVideo = false;
$mapShellEdit = true;
$mapShellMultiple = true;
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
