<?php
declare(strict_types=1);

/**
 * Guide registry helpers and safe internal links.
 *
 * site_link() only emits an <a> when the path exists in the tools registry
 * or as a published guide. Unpublished / future routes render as plain text
 * and become links automatically once those pages are registered.
 */

/**
 * Guide registry from config/guides.php. Cached. Keyed by slug.
 *
 * @return array<string, array<string, mixed>>
 */
function guides_registry(): array
{
    static $guides = null;
    if ($guides !== null) {
        return $guides;
    }

    $file = APP_ROOT . '/config/guides.php';
    if (!is_file($file)) {
        $guides = [];
        return $guides;
    }

    $raw = require $file;
    $guides = [];
    foreach (is_array($raw) ? $raw : [] as $key => $entry) {
        if (!is_array($entry)) {
            continue;
        }
        $slug = (string) ($entry['slug'] ?? $key);
        $entry['slug'] = $slug;
        $guides[$slug] = $entry;
    }
    return $guides;
}

/**
 * Published guides only, hub first, then registry order.
 *
 * @return array<int, array<string, mixed>>
 */
function guides_published(): array
{
    $hub = [];
    $rest = [];
    foreach (guides_registry() as $guide) {
        if (empty($guide['published'])) {
            continue;
        }
        if (!empty($guide['hub'])) {
            $hub[] = $guide;
        } else {
            $rest[] = $guide;
        }
    }
    return array_merge($hub, $rest);
}

/**
 * One published guide by slug, or null.
 *
 * @return array<string, mixed>|null
 */
function guide_by_slug(string $slug): ?array
{
    $guide = guides_registry()[$slug] ?? null;
    if (!is_array($guide) || empty($guide['published'])) {
        return null;
    }
    return $guide;
}

/**
 * True when $path is a live tool page or a published guide.
 */
function site_path_exists(string $path): bool
{
    $path = route_normalize($path);

    foreach (tools_registry() as $entry) {
        if (($entry['path'] ?? '') === $path) {
            return true;
        }
    }

    if ($path === '/guides') {
        return true;
    }

    if (str_starts_with($path, '/guides/')) {
        $slug = substr($path, strlen('/guides/'));
        if ($slug !== '' && !str_contains($slug, '/')) {
            return guide_by_slug($slug) !== null;
        }
    }

    return false;
}

/**
 * Internal link when the path exists; otherwise escaped plain text.
 * Label defaults to the path.
 */
function site_link(string $href, ?string $label = null): string
{
    $href = route_normalize($href);
    $text = $label !== null && $label !== '' ? $label : $href;
    $safe = e($text);
    if (!site_path_exists($href)) {
        return $safe;
    }
    return '<a href="' . e($href) . '">' . $safe . '</a>';
}

/**
 * Friendly label for a tool or guide path (for related boxes).
 */
function site_path_label(string $path): string
{
    $path = route_normalize($path);

    foreach (tools_registry() as $entry) {
        if (($entry['path'] ?? '') === $path) {
            $title = trim((string) ($entry['title'] ?? ''));
            if ($title !== '') {
                return $title;
            }
            break;
        }
    }

    if (str_starts_with($path, '/guides/')) {
        $slug = substr($path, strlen('/guides/'));
        $guide = guides_registry()[$slug] ?? null;
        if (is_array($guide)) {
            $title = trim((string) ($guide['title'] ?? ''));
            if ($title !== '') {
                return $title;
            }
        }
    }

    return $path;
}
