<?php
declare(strict_types=1);

/**
 * Origin for canonical links, with no trailing slash.
 *
 * GPS_BASE_URL (environment variable or Apache SetEnv) wins when set.
 * Otherwise the request host decides:
 *   gpstoolset.lan       -> http://gpstoolset.lan
 *   gpstoolset.com       -> https://gpstoolset.com
 *   www.gpstoolset.com   -> https://gpstoolset.com
 * config/site.local.php may replace base_url after this file loads.
 */
function site_base_origin(): string
{
    $fromEnv = getenv('GPS_BASE_URL');
    if (!is_string($fromEnv) || trim($fromEnv) === '') {
        $fromEnv = $_SERVER['GPS_BASE_URL'] ?? $_ENV['GPS_BASE_URL'] ?? '';
    }
    $fromEnv = trim((string) $fromEnv);
    if ($fromEnv !== '') {
        return rtrim($fromEnv, '/');
    }

    $host = (string) ($_SERVER['HTTP_HOST'] ?? '');
    if (!preg_match('/^[A-Za-z0-9.:-]+$/', $host)) {
        $host = '';
    }

    $name = strtolower($host);
    $name = preg_replace('/:\d+$/', '', $name) ?? $name;

    if ($name === 'gpstoolset.com' || $name === 'www.gpstoolset.com') {
        return 'https://gpstoolset.com';
    }

    if ($name === '' || $name === 'gpstoolset.lan') {
        return 'http://gpstoolset.lan';
    }

    $https = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
    return ($https ? 'https' : 'http') . '://' . $host;
}

/**
 * Absolute URL for a path on this site.
 */
function base_url(string $path = ''): string
{
    $configured = '';
    if (isset($GLOBALS['SITE']) && is_array($GLOBALS['SITE'])) {
        $configured = trim((string) ($GLOBALS['SITE']['base_url'] ?? ''));
    }

    $origin = $configured !== '' ? rtrim($configured, '/') : site_base_origin();

    if ($path === '' || $path === '/') {
        return $origin . '/';
    }

    return $origin . '/' . ltrim($path, '/');
}

return [
    'name' => 'GPS Toolset',
    'base_url' => site_base_origin(),
];
