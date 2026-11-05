<?php
declare(strict_types=1);

/**
 * CI3-style routes + redirects (Kuiper core-ref 1.1.3).
 *
 * Phase 1: defaults only — no page routes yet. Router::plan() returns
 * not_found for every path except `/` (default_controller) and built-in
 * trailing-slash / index.php redirects. public/index.php falls through to
 * the legacy includes/router.php on not_found.
 *
 * Phase 2 expands this from tools/guides/formats/convert registries.
 */

$route = [];
$route['default_controller'] = 'home';
$route['404_override'] = 'errors/index';
$route['auto_route'] = false;

$redirect = [];

return [
    'route' => $route,
    'redirect' => $redirect,
];
