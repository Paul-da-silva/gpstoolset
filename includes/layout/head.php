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

$siteName = site('name');
$pageTitle = trim((string) $page['title']);
if ($pageTitle === '' || $pageTitle === $siteName) {
    $fullTitle = $siteName;
} else {
    $fullTitle = $pageTitle . ' · ' . $siteName;
}

$description = trim((string) $page['description']);
if ($description === '') {
    $description = 'Browser tools for GPS files. Your file never leaves your device.';
}

$canonical = base_url(current_path());
$isMapPage = !empty($page['isMapPage']);
$bodyClass = $isMapPage ? ' class="is-map"' : '';
$viewport = 'width=device-width, initial-scale=1';
if ($isMapPage) {
    $viewport .= ', viewport-fit=cover';
}

// Do not add a Referrer-Policy tag. Map tiles need the browser to send Referer.
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="<?= e($viewport) ?>">
<title><?= e($fullTitle) ?></title>
<meta name="description" content="<?= e($description) ?>">
<link rel="canonical" href="<?= e($canonical) ?>">
<meta property="og:site_name" content="<?= e($siteName) ?>">
<meta property="og:type" content="website">
<meta property="og:title" content="<?= e($fullTitle) ?>">
<meta property="og:description" content="<?= e($description) ?>">
<meta property="og:url" content="<?= e($canonical) ?>">
<link rel="stylesheet" href="/assets/css/tokens.css">
<link rel="stylesheet" href="/assets/css/base.css">
<?php if ($isMapPage): ?>
<link rel="stylesheet" href="/assets/vendor/leaflet/leaflet.css">
<link rel="stylesheet" href="/assets/css/map-shell.css">
<?php endif; ?>
</head>
<body<?= $bodyClass ?>>
