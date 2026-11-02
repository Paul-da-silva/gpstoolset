<?php
declare(strict_types=1);

if (!isset($page) || !is_array($page)) {
    $page = [];
}
$page += [
    'title' => '',
    'description' => '',
    'isMapPage' => false,
];
$GLOBALS['page'] = $page;

$isMapPage = !empty($page['isMapPage']);
$wantMapAssets = $isMapPage || !empty($page['mapAssets']);
// Landing-first map tools stay a document until JS adds is-map.
// A tool that opens on the map sets $page['bodyClass'] (for example "is-map").
$viewport = 'width=device-width, initial-scale=1';
if ($wantMapAssets) {
    $viewport .= ', viewport-fit=cover';
}
$bodyClass = '';
if (
    isset($page['bodyClass'])
    && is_string($page['bodyClass'])
    && preg_match('/^[a-zA-Z][a-zA-Z0-9 -]*$/', $page['bodyClass']) === 1
) {
    $bodyClass = ' class="' . e($page['bodyClass']) . '"';
}
$extraStyles = [];
if (!empty($page['styles']) && is_array($page['styles'])) {
    foreach ($page['styles'] as $href) {
        if (
            is_string($href)
            && str_starts_with($href, '/assets/')
            && !str_contains($href, '..')
        ) {
            $extraStyles[] = $href;
        }
    }
}

// Do not add a Referrer-Policy tag. Map tiles need the browser to send Referer.
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="<?= e($viewport) ?>">
<?= seo_head_tags($page) ?>
<link rel="stylesheet" href="/assets/css/tokens.css">
<link rel="stylesheet" href="/assets/css/base.css">
<link rel="stylesheet" href="/assets/css/components.css">
<?php foreach ($extraStyles as $href): ?>
<link rel="stylesheet" href="<?= e($href) ?>">
<?php endforeach; ?>
<?php if ($wantMapAssets): ?>
<link rel="stylesheet" href="/assets/vendor/leaflet/leaflet.css">
<link rel="stylesheet" href="/assets/css/map-shell.css">
<?php endif; ?>
</head>
<body<?= $bodyClass ?>>
