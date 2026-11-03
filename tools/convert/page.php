<?php
declare(strict_types=1);

/**
 * Converter page. /convert and every /convert/<pair> share this file.
 * Pair pages set pairContent. The module is public/assets/js/converter/.
 * Expects $page and $route.
 */

require APP_ROOT . '/includes/layout/head.php';
require APP_ROOT . '/includes/layout/topbar.php';

$pair = (string) ($route['pairContent'] ?? '');
$file = $pair !== '' ? route_file($pair) : route_file('tools/convert/content.php');
if ($file !== null) {
    require $file;
}

$footerClose = false;
require APP_ROOT . '/includes/layout/footer.php';
require APP_ROOT . '/includes/partials/scripts-module.php';

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
