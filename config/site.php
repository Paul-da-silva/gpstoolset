<?php
declare(strict_types=1);

/**
 * Origin for canonical links, with no trailing slash.
 *
 * Prefers Env::get('BASE_URL') (which falls back to GPS_BASE_URL in core Env
 * until Phase 6 confirms production BASE_URL). Otherwise the request host:
 *   gpstoolset.lan       -> http://gpstoolset.lan
 *   gpstoolset.com       -> https://gpstoolset.com
 *   www.gpstoolset.com   -> https://gpstoolset.com
 * config/site.local.php may replace base_url after this file loads.
 */
if (!function_exists('site_base_origin')) {
    function site_base_origin(): string
    {
        $fromEnv = '';
        if (class_exists(\Kuiper\Core\Env::class, false)
            || class_exists(\Kuiper\Core\Env::class)
        ) {
            $fromEnv = trim((string) \Kuiper\Core\Env::get('BASE_URL', ''));
        }
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
}

/**
 * Absolute URL for a path on this site.
 */
if (!function_exists('base_url')) {
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
}

return [
    'name' => 'GPS Toolset',
    'base_url' => site_base_origin(),
];
