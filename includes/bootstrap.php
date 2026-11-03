<?php
declare(strict_types=1);

define('APP_ROOT', dirname(__DIR__));

$SITE = require APP_ROOT . '/config/site.php';
$localSite = APP_ROOT . '/config/site.local.php';
if (is_file($localSite)) {
    $override = require $localSite;
    if (is_array($override)) {
        $SITE = array_replace($SITE, $override);
    }
}

$ADS = require APP_ROOT . '/config/ads.php';
$TILES = require APP_ROOT . '/config/tiles.php';

$GLOBALS['SITE'] = $SITE;
$GLOBALS['ADS'] = $ADS;
$GLOBALS['TILES'] = $TILES;

require APP_ROOT . '/includes/partials/ads.php';
require APP_ROOT . '/includes/seo.php';
require APP_ROOT . '/includes/router.php';
require APP_ROOT . '/includes/guides-lib.php';

/**
 * Read one site setting as a string.
 */
function site(string $key): string
{
    $value = $GLOBALS['SITE'][$key] ?? '';
    return is_scalar($value) ? (string) $value : '';
}

/**
 * Escape a string for HTML text or an attribute.
 */
function e(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

/**
 * Path of the current request, without a trailing slash (except "/").
 */
function current_path(): string
{
    $path = parse_url((string) ($_SERVER['REQUEST_URI'] ?? '/'), PHP_URL_PATH);
    $path = '/' . trim((string) $path, '/');
    if ($path === '/' || $path === '') {
        return '/';
    }
    return $path;
}

/**
 * Class fragment for a nav link that matches the current path.
 */
function nav_active(string $href): string
{
    $hrefPath = '/' . trim($href, '/');
    if ($hrefPath === '/') {
        $hrefPath = '/';
    }
    return current_path() === $hrefPath ? ' is-active' : '';
}
