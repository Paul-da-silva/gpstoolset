<?php
declare(strict_types=1);

/**
 * Front controller helpers. public/index.php calls route_dispatch().
 *
 * Apache sends every request that is not a real file under public/ here
 * (see public/.htaccess). The path is matched against config/tools.php.
 * Entry files live above the document root and are included from here.
 */

/**
 * The registry from config/tools.php, keyed by slug, each entry normalised.
 *
 * @return array<string, array<string, mixed>>
 */
function tools_registry(): array
{
    static $registry = null;
    if ($registry !== null) {
        return $registry;
    }

    $raw = require APP_ROOT . '/config/tools.php';
    $registry = [];
    foreach (is_array($raw) ? $raw : [] as $key => $entry) {
        if (!is_array($entry)) {
            continue;
        }
        $slug = (string) ($entry['slug'] ?? $key);
        $entry['slug'] = $slug;
        $entry['path'] = route_entry_path($entry);
        $registry[$slug] = $entry;
    }
    return $registry;
}

/**
 * URL path of a registry entry. "home" is "/", others default to "/<slug>".
 *
 * @param array<string, mixed> $entry
 */
function route_entry_path(array $entry): string
{
    if (isset($entry['path']) && is_string($entry['path']) && $entry['path'] !== '') {
        return route_normalize($entry['path']);
    }
    $slug = (string) ($entry['slug'] ?? '');
    return $slug === 'home' ? '/' : route_normalize('/' . $slug);
}

/**
 * Path with one leading slash and no trailing slash ("/" stays "/").
 */
function route_normalize(string $path): string
{
    $path = '/' . trim($path, '/');
    return $path === '' ? '/' : $path;
}

/**
 * Registry entry for a path, with its meta file merged in. Null if unknown.
 *
 * @return array<string, mixed>|null
 */
function route_match(string $path): ?array
{
    $path = route_normalize($path);
    foreach (tools_registry() as $entry) {
        if ($entry['path'] === $path) {
            return route_with_meta($entry);
        }
    }
    return null;
}

/**
 * Merge an entry's optional meta file (title, flags, faq…) over the entry.
 *
 * @param array<string, mixed> $entry
 * @return array<string, mixed>
 */
function route_with_meta(array $entry): array
{
    if (!empty($entry['meta']) && is_string($entry['meta'])) {
        $file = route_file($entry['meta']);
        if ($file !== null) {
            $meta = require $file;
            if (is_array($meta)) {
                $entry = array_replace($entry, $meta);
            }
        }
    }

    $flags = isset($entry['flags']) && is_array($entry['flags']) ? $entry['flags'] : [];
    $entry['flags'] = $flags + ['map' => false, 'video' => false, 'ads' => true];
    $entry += ['title' => '', 'description' => '', 'inSitemap' => false, 'styles' => []];
    return $entry;
}

/**
 * Absolute path of a repo-relative PHP file, or null if it is missing
 * or outside the repo.
 */
function route_file(string $relative): ?string
{
    $relative = ltrim($relative, '/');
    if ($relative === '' || str_contains($relative, '..')) {
        return null;
    }
    $file = APP_ROOT . '/' . $relative;
    return is_file($file) ? $file : null;
}

/**
 * The $page array that includes/layout/head.php and render_ad() read.
 *
 * @param array<string, mixed> $route
 * @return array<string, mixed>
 */
function route_page(array $route): array
{
    $flags = $route['flags'];
    return [
        'slug' => (string) $route['slug'],
        'path' => (string) $route['path'],
        'title' => (string) $route['title'],
        'description' => (string) $route['description'],
        'isMapPage' => !empty($flags['map']),
        'mapAssets' => !empty($flags['map']),
        'allowAds' => !empty($flags['ads']),
        'styles' => is_array($route['styles']) ? $route['styles'] : [],
        'bodyClass' => isset($route['bodyClass']) && is_string($route['bodyClass']) ? $route['bodyClass'] : '',
    ];
}

/**
 * Send a 404 page. Not in the registry, so no canonical URL.
 *
 * @return array<string, mixed>
 */
function route_not_found(): array
{
    http_response_code(404);
    return route_with_meta([
        'slug' => '404',
        'path' => '',
        'title' => 'Page not found',
        'description' => 'That page does not exist.',
        'entry' => 'includes/pages/not-found.php',
        'noindex' => true,
    ]);
}

/**
 * Resolve the request and include the page. Does not return a value.
 */
function route_dispatch(): void
{
    $path = current_path();

    if ($path === '/sitemap.xml') {
        header('Content-Type: application/xml; charset=UTF-8');
        echo seo_sitemap_xml();
        return;
    }

    $route = route_match($path);
    if ($route === null) {
        $route = route_not_found();
    }

    $page = route_page($route);
    if (!empty($route['noindex'])) {
        $page['noindex'] = true;
        $page['path'] = '';
    }

    $file = route_file((string) ($route['entry'] ?? ''));
    if ($file === null) {
        http_response_code(500);
        echo 'Page entry is missing.';
        return;
    }

    $GLOBALS['route'] = $route;
    require $file;
}
