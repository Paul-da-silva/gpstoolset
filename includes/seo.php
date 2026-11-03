<?php
declare(strict_types=1);

/**
 * SEO helpers: title, description, canonical, JSON-LD, sitemap.
 *
 * head.php prints seo_head_tags(). Canonical URLs come from base_url()
 * (config/site.php), so .lan and production each get their own origin.
 * /sitemap.xml is built from config/tools.php (and config/guides.php,
 * if it exists) by route_dispatch().
 */

const SEO_DEFAULT_DESCRIPTION = 'Browser tools for GPS files. Your file never leaves your device.';

const SEO_JSON_FLAGS = JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_THROW_ON_ERROR;

/**
 * Full <title> text: "Page · Site name", or just the site name.
 *
 * @param array<string, mixed> $page
 */
function seo_title(array $page): string
{
    $siteName = site('name');
    $title = trim((string) ($page['title'] ?? ''));
    if ($title === '' || $title === $siteName) {
        return $siteName;
    }
    return $title . ' · ' . $siteName;
}

/**
 * Meta description, with a site default when the page has none.
 *
 * @param array<string, mixed> $page
 */
function seo_description(array $page): string
{
    $description = trim((string) ($page['description'] ?? ''));
    return $description === '' ? SEO_DEFAULT_DESCRIPTION : $description;
}

/**
 * Absolute canonical URL, or '' for a page that must not have one (404).
 *
 * @param array<string, mixed> $page
 */
function seo_canonical(array $page): string
{
    if (isset($page['path']) && $page['path'] === '') {
        return '';
    }
    $path = isset($page['path']) && is_string($page['path']) ? $page['path'] : current_path();
    return base_url($path);
}

/**
 * The SEO tags for <head>: title, description, canonical, Open Graph.
 * Do not add a Referrer-Policy tag here (map tiles need Referer).
 *
 * @param array<string, mixed> $page
 */
function seo_head_tags(array $page): string
{
    $siteName = site('name');
    $title = seo_title($page);
    $description = seo_description($page);
    $canonical = seo_canonical($page);

    $out = '<title>' . e($title) . "</title>\n";
    $out .= '<meta name="description" content="' . e($description) . "\">\n";
    if (!empty($page['noindex'])) {
        $out .= "<meta name=\"robots\" content=\"noindex\">\n";
    }
    if ($canonical !== '') {
        $out .= '<link rel="canonical" href="' . e($canonical) . "\">\n";
    }
    $out .= '<meta property="og:site_name" content="' . e($siteName) . "\">\n";
    $out .= "<meta property=\"og:type\" content=\"website\">\n";
    $out .= '<meta property="og:title" content="' . e($title) . "\">\n";
    $out .= '<meta property="og:description" content="' . e($description) . "\">\n";
    if ($canonical !== '') {
        $out .= '<meta property="og:url" content="' . e($canonical) . "\">\n";
    }
    return $out;
}

/**
 * One JSON-LD <script> block. Safe inside HTML (tags and quotes escaped).
 *
 * @param array<string, mixed> $data
 */
function seo_json_ld(array $data): string
{
    return '<script type="application/ld+json">' . "\n"
        . json_encode($data, SEO_JSON_FLAGS) . "\n"
        . "</script>\n";
}

/**
 * schema.org Question entities from a list of ['q' => …, 'a' => …].
 *
 * @param array<int, array{q: string, a: string}> $faq
 * @return array<int, array<string, mixed>>
 */
function seo_faq_entities(array $faq): array
{
    $entities = [];
    foreach ($faq as $item) {
        $entities[] = [
            '@type' => 'Question',
            'name' => $item['q'],
            'acceptedAnswer' => [
                '@type' => 'Answer',
                'text' => $item['a'],
            ],
        ];
    }
    return $entities;
}

/**
 * Absolute URLs for /sitemap.xml, in registry order.
 *
 * @return array<int, string>
 */
function seo_sitemap_urls(): array
{
    $urls = [];
    foreach (tools_registry() as $entry) {
        $entry = route_with_meta($entry);
        if (!empty($entry['inSitemap'])) {
            $urls[] = base_url((string) $entry['path']);
        }
    }

    if (function_exists('guides_registry')) {
        foreach (guides_registry() as $key => $guide) {
            if (!is_array($guide) || empty($guide['inSitemap']) || empty($guide['published'])) {
                continue;
            }
            $slug = (string) ($guide['slug'] ?? $key);
            $urls[] = base_url('guides/' . $slug);
        }
    }
    return $urls;
}

/**
 * The sitemap document.
 */
function seo_sitemap_xml(): string
{
    $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
    $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
    foreach (seo_sitemap_urls() as $url) {
        $xml .= '  <url>' . "\n";
        $xml .= '    <loc>' . htmlspecialchars($url, ENT_XML1 | ENT_QUOTES, 'UTF-8') . '</loc>' . "\n";
        $xml .= '  </url>' . "\n";
    }
    return $xml . '</urlset>' . "\n";
}
