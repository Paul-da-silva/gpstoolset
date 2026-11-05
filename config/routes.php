<?php
declare(strict_types=1);

/**
 * CI3-style routes + redirects (Kuiper core-ref 1.1.3).
 *
 * Built from tools_registry() (tools / formats / convert / guides).
 * Thin controllers: Registry::show, Home::index, Sitemap::index, Errors::index.
 * Unknown paths → Router plan not_found → legacy fallthrough → 404.
 */

$root = dirname(__DIR__);
if (!defined('APP_ROOT')) {
    define('APP_ROOT', $root);
}

require_once $root . '/includes/router.php';
require_once $root . '/includes/guides-lib.php';

$route = [];
$route['default_controller'] = 'home';
$route['404_override'] = 'errors/index';
$route['auto_route'] = false;

foreach (tools_registry() as $slug => $entry) {
    if (!is_array($entry)) {
        continue;
    }
    $path = trim((string) ($entry['path'] ?? ''), '/');
    if ($path === '') {
        // `/` uses default_controller → Home::index
        continue;
    }
    // Plain string = GET / HEAD / POST only (core-ref default).
    $route[$path] = 'registry/show/' . $slug;
}

$route['sitemap.xml'] = 'sitemap/index';

$redirect = [];

return [
    'route' => $route,
    'redirect' => $redirect,
];
