<?php
declare(strict_types=1);

/**
 * Shared shell for a format landing. The route comes from config/formats.php.
 * content.php is the SEO copy. The viewer module is the same for every format.
 * Expects $page and $route.
 */

$format = null;
foreach (formats_registry() as $row) {
    if (is_array($row) && (string) ($row['id'] ?? '') === (string) ($route['format'] ?? '')) {
        $format = $row;
        break;
    }
}
$formatLabel = is_array($format) ? (string) ($format['label'] ?? 'GPS') : 'GPS';

require APP_ROOT . '/includes/layout/head.php';
require APP_ROOT . '/includes/layout/topbar.php';

$content = route_file((string) ($route['content'] ?? ''));
if ($content !== null) {
    require $content;
}

$footerClose = false;
require APP_ROOT . '/includes/layout/footer.php';

$mapShellHeading = '';
$mapShellLead = 'Drop a ' . $formatLabel . ' file or choose one. Nothing is uploaded.';
$mapShellNote = 'The file stays in this browser.';
$mapShellDropText = 'Drop a ' . $formatLabel . ' file. Nothing is uploaded.';
$mapShellAccept = is_array($format) ? (string) ($format['accept'] ?? '') : '';
$mapShellVideo = false;
$mapShellEdit = false;
$mapShellEditHref = '/gpx-editor';
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
