<?php
declare(strict_types=1);

/**
 * Baseline / recheck crawler for the shared-core migration pilot.
 *
 * Usage:
 *   php docs/migration/crawl-baseline.php [outfile.tsv]
 *
 * Default outfile: docs/migration/baseline-gpstoolset.tsv
 * Also writes:
 *   docs/migration/baseline-gpstoolset-redirects.tsv  (only when outfile is baseline)
 *   or docs/migration/<stem>-redirects.tsv when outfile name starts with recheck-
 *
 * Normalisation for body_sha256_norm (documented in README.md):
 *   - strip Set-Cookie / CSRF tokens if present (none expected today)
 *   - collapse runs of whitespace in HTML text nodes is NOT done (stable SSR)
 *   - strip HTML comments that look like build/cache timestamps (<!-- built: … -->)
 *   - replace ISO-8601 datetimes in JSON-LD / meta that change per request (none expected)
 *   - for sitemap.xml: hash raw body (locs are static registry)
 */

$root = dirname(__DIR__, 2);
require $root . '/includes/bootstrap.php';

$base = rtrim(getenv('GPS_BASELINE_BASE') ?: 'http://gpstoolset.lan', '/');
$outArg = $argv[1] ?? 'docs/migration/baseline-gpstoolset.tsv';
$outFile = str_starts_with($outArg, '/') ? $outArg : $root . '/' . ltrim($outArg, '/');
$outDir = dirname($outFile);
if (!is_dir($outDir)) {
    mkdir($outDir, 0775, true);
}

$stem = pathinfo($outFile, PATHINFO_FILENAME);
$isBaseline = str_starts_with($stem, 'baseline');
$redirectsFile = $outDir . '/' . ($isBaseline
    ? 'baseline-gpstoolset-redirects.tsv'
    : preg_replace('/\.tsv$/', '', $stem) . '-redirects.tsv');
$metaFile = $outDir . '/' . ($isBaseline
    ? 'baseline-gpstoolset-meta.txt'
    : preg_replace('/\.tsv$/', '', $stem) . '-meta.txt');

$registry = tools_registry();
$paths = [];
foreach ($registry as $meta) {
    if (!is_array($meta)) {
        continue;
    }
    $path = (string) ($meta['path'] ?? '');
    if ($path === '') {
        $slug = (string) ($meta['slug'] ?? '');
        $path = $slug === 'home' || $slug === '' ? '/' : '/' . $slug;
    }
    $paths[$path] = true;
}
$paths = array_keys($paths);
sort($paths);

/** @return array{status:int,headers:array<string,string>,body:string} */
function crawl_fetch(string $url, string $method = 'GET'): array
{
    $ch = curl_init($url);
    if ($ch === false) {
        throw new RuntimeException('curl_init failed for ' . $url);
    }
    curl_setopt_array($ch, [
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HEADER => true,
        CURLOPT_FOLLOWLOCATION => false,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_USERAGENT => 'gpstoolset-baseline-crawler/1.0',
        CURLOPT_HTTPHEADER => ['Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'],
    ]);
    if ($method === 'HEAD') {
        curl_setopt($ch, CURLOPT_NOBODY, true);
    }
    $raw = curl_exec($ch);
    if ($raw === false) {
        $err = curl_error($ch);
        curl_close($ch);
        throw new RuntimeException('curl failed for ' . $url . ': ' . $err);
    }
    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $headerSize = (int) curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    curl_close($ch);

    $headerBlob = substr($raw, 0, $headerSize);
    $body = substr($raw, $headerSize);
    $headers = [];
    foreach (explode("\r\n", $headerBlob) as $line) {
        if (str_contains($line, ':')) {
            [$k, $v] = explode(':', $line, 2);
            $headers[strtolower(trim($k))] = trim($v);
        }
    }
    return ['status' => $status, 'headers' => $headers, 'body' => (string) $body];
}

function crawl_attr(string $html, string $name): string
{
    $patterns = [
        '/<meta\s[^>]*name=["\']' . preg_quote($name, '/') . '["\'][^>]*content=["\']([^"\']*)["\']/i',
        '/<meta\s[^>]*content=["\']([^"\']*)["\'][^>]*name=["\']' . preg_quote($name, '/') . '["\']/i',
    ];
    foreach ($patterns as $re) {
        if (preg_match($re, $html, $m)) {
            return html_entity_decode($m[1], ENT_QUOTES | ENT_HTML5, 'UTF-8');
        }
    }
    return '';
}

function crawl_link_href(string $html, string $rel): string
{
    if (preg_match('/<link\s[^>]*rel=["\']' . preg_quote($rel, '/') . '["\'][^>]*href=["\']([^"\']*)["\']/i', $html, $m)
        || preg_match('/<link\s[^>]*href=["\']([^"\']*)["\'][^>]*rel=["\']' . preg_quote($rel, '/') . '["\']/i', $html, $m)
    ) {
        return html_entity_decode($m[1], ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }
    return '';
}

function crawl_hreflang(string $html): string
{
    $out = [];
    if (preg_match_all('/<link\s[^>]*rel=["\']alternate["\'][^>]*>/i', $html, $tags)) {
        foreach ($tags[0] as $tag) {
            if (!preg_match('/hreflang=["\']([^"\']+)["\']/i', $tag, $hl)) {
                continue;
            }
            $href = '';
            if (preg_match('/href=["\']([^"\']+)["\']/i', $tag, $h)) {
                $href = $h[1];
            }
            $out[] = $hl[1] . '=' . html_entity_decode($href, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        }
    }
    sort($out);
    return implode(',', $out);
}

function crawl_jsonld_sha(string $html): string
{
    $chunks = [];
    if (preg_match_all(
        '/<script[^>]*type=["\']application\/ld\+json["\'][^>]*>(.*?)<\/script>/is',
        $html,
        $m
    )) {
        foreach ($m[1] as $raw) {
            $chunks[] = trim($raw);
        }
    }
    if ($chunks === []) {
        return '';
    }
    return hash('sha256', implode("\n", $chunks));
}

function crawl_normalize_body(string $body, string $contentType): string
{
    // Strip HTML comments that may carry build/cache stamps.
    $body = preg_replace('/<!--.*?-->/s', '', $body) ?? $body;
    // Normalize CRLF → LF so OS/proxy differences do not shift the hash.
    $body = str_replace("\r\n", "\n", $body);
    // Collapse accidental trailing whitespace on lines (keeps content stable).
    $body = preg_replace('/[ \t]+$/m', '', $body) ?? $body;
    // No CSRF tokens or per-request timestamps expected in this app today.
    unset($contentType);
    return $body;
}

function crawl_tsv_escape(string $v): string
{
    if ($v === '') {
        return '';
    }
    if (str_contains($v, "\t") || str_contains($v, "\n") || str_contains($v, '"')) {
        return '"' . str_replace('"', '""', $v) . '"';
    }
    return $v;
}

$rows = [];
$header = [
    'path',
    'status',
    'title',
    'meta_description',
    'meta_robots',
    'canonical',
    'hreflang',
    'jsonld_sha256',
    'content_type',
    'body_sha256_norm',
    'head_status',
];
$rows[] = implode("\t", $header);

$extraMeta = [];

foreach ($paths as $path) {
    $url = $base . ($path === '/' ? '/' : $path);
    $get = crawl_fetch($url, 'GET');
    $head = crawl_fetch($url, 'HEAD');
    $body = $get['body'];
    $ct = $get['headers']['content-type'] ?? '';
    $title = '';
    if (preg_match('/<title[^>]*>(.*?)<\/title>/is', $body, $tm)) {
        $title = html_entity_decode(trim($tm[1]), ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }
    $norm = crawl_normalize_body($body, $ct);
    $rows[] = implode("\t", [
        crawl_tsv_escape($path),
        (string) $get['status'],
        crawl_tsv_escape($title),
        crawl_tsv_escape(crawl_attr($body, 'description')),
        crawl_tsv_escape(crawl_attr($body, 'robots')),
        crawl_tsv_escape(crawl_link_href($body, 'canonical')),
        crawl_tsv_escape(crawl_hreflang($body)),
        crawl_tsv_escape(crawl_jsonld_sha($body)),
        crawl_tsv_escape($ct),
        hash('sha256', $norm),
        (string) $head['status'],
    ]);
    fwrite(STDERR, sprintf("OK %s %d\n", $path, $get['status']));
}

// Fake 404
$missingPath = '/__kuiper_baseline_missing__';
$missingUrl = $base . $missingPath;
$get = crawl_fetch($missingUrl, 'GET');
$head = crawl_fetch($missingUrl, 'HEAD');
$body = $get['body'];
$ct = $get['headers']['content-type'] ?? '';
$title = '';
if (preg_match('/<title[^>]*>(.*?)<\/title>/is', $body, $tm)) {
    $title = html_entity_decode(trim($tm[1]), ENT_QUOTES | ENT_HTML5, 'UTF-8');
}
$norm = crawl_normalize_body($body, $ct);
$rows[] = implode("\t", [
    crawl_tsv_escape($missingPath),
    (string) $get['status'],
    crawl_tsv_escape($title),
    crawl_tsv_escape(crawl_attr($body, 'description')),
    crawl_tsv_escape(crawl_attr($body, 'robots')),
    crawl_tsv_escape(crawl_link_href($body, 'canonical')),
    crawl_tsv_escape(crawl_hreflang($body)),
    crawl_tsv_escape(crawl_jsonld_sha($body)),
    crawl_tsv_escape($ct),
    hash('sha256', $norm),
    (string) $head['status'],
]);
fwrite(STDERR, sprintf("OK %s %d\n", $missingPath, $get['status']));

// sitemap.xml
$sm = crawl_fetch($base . '/sitemap.xml', 'GET');
$smHead = crawl_fetch($base . '/sitemap.xml', 'HEAD');
$smBody = $sm['body'];
$locCount = preg_match_all('/<loc\b/i', $smBody);
$smNorm = crawl_normalize_body($smBody, $sm['headers']['content-type'] ?? '');
$rows[] = implode("\t", [
    '/sitemap.xml',
    (string) $sm['status'],
    '', // title N/A
    'loc_count=' . $locCount,
    '',
    '',
    '',
    '',
    crawl_tsv_escape($sm['headers']['content-type'] ?? ''),
    hash('sha256', $smNorm),
    (string) $smHead['status'],
]);
$extraMeta[] = 'sitemap_status=' . $sm['status'];
$extraMeta[] = 'sitemap_content_type=' . ($sm['headers']['content-type'] ?? '');
$extraMeta[] = 'sitemap_loc_count=' . $locCount;
$extraMeta[] = 'sitemap_body_sha256_norm=' . hash('sha256', $smNorm);
fwrite(STDERR, sprintf("OK /sitemap.xml %d locs=%d\n", $sm['status'], $locCount));

// robots.txt
$rb = crawl_fetch($base . '/robots.txt', 'GET');
$rbHead = crawl_fetch($base . '/robots.txt', 'HEAD');
$rbBody = $rb['body'];
$sitemapLine = '';
foreach (preg_split('/\r\n|\n|\r/', $rbBody) ?: [] as $line) {
    if (preg_match('/^\s*Sitemap:\s*(.+)$/i', $line, $m)) {
        $sitemapLine = trim($m[1]);
        break;
    }
}
$rbNorm = crawl_normalize_body($rbBody, $rb['headers']['content-type'] ?? '');
$rows[] = implode("\t", [
    '/robots.txt',
    (string) $rb['status'],
    '',
    crawl_tsv_escape('Sitemap=' . $sitemapLine),
    '',
    '',
    '',
    '',
    crawl_tsv_escape($rb['headers']['content-type'] ?? ''),
    hash('sha256', $rbNorm),
    (string) $rbHead['status'],
]);
$extraMeta[] = 'robots_status=' . $rb['status'];
$extraMeta[] = 'robots_content_type=' . ($rb['headers']['content-type'] ?? '');
$extraMeta[] = 'robots_sitemap_line=' . $sitemapLine;
$extraMeta[] = 'robots_body_sha256_norm=' . hash('sha256', $rbNorm);
fwrite(STDERR, sprintf("OK /robots.txt %d Sitemap=%s\n", $rb['status'], $sitemapLine));

file_put_contents($outFile, implode("\n", $rows) . "\n");

// Required legacy 301s
$redirectChecks = [
    '/gopro' => '/gopro-gps-extract',
    '/kml-to-gpx' => '/convert/kml-to-gpx',
    '/gpx-to-kml' => '/convert/gpx-to-kml',
    '/fit-to-gpx' => '/convert/fit-to-gpx',
    '/privacy/' => '/privacy',
    '/about/' => '/about',
    '/index.php' => '/',
];

$redirRows = ["path\tstatus\tredirect_url\texpected_path_suffix"];
foreach ($redirectChecks as $from => $expectSuffix) {
    $ch = curl_init($base . $from);
    if ($ch === false) {
        throw new RuntimeException('curl_init failed for redirect ' . $from);
    }
    curl_setopt_array($ch, [
        CURLOPT_NOBODY => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HEADER => true,
        CURLOPT_FOLLOWLOCATION => false,
        CURLOPT_TIMEOUT => 15,
        CURLOPT_USERAGENT => 'gpstoolset-baseline-crawler/1.0',
    ]);
    $raw = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $redir = (string) curl_getinfo($ch, CURLINFO_REDIRECT_URL);
    curl_close($ch);
    if ($redir === '' && is_string($raw) && preg_match('/^Location:\s*(.+)$/im', $raw, $lm)) {
        $redir = trim($lm[1]);
    }
    $redirRows[] = implode("\t", [
        $from,
        (string) $status,
        $redir,
        $expectSuffix,
    ]);
    fwrite(STDERR, sprintf("REDIR %s → %s (%d)\n", $from, $redir, $status));
}
file_put_contents($redirectsFile, implode("\n", $redirRows) . "\n");

$relOut = str_starts_with($outFile, $root . '/')
    ? substr($outFile, strlen($root) + 1)
    : $outFile;
$relRedirects = str_starts_with($redirectsFile, $root . '/')
    ? substr($redirectsFile, strlen($root) + 1)
    : $redirectsFile;
$extraMeta[] = 'base=' . $base;
$extraMeta[] = 'pages=' . count($paths);
$extraMeta[] = 'generated_at_utc=' . gmdate('c');
$extraMeta[] = 'outfile=' . $relOut;
$extraMeta[] = 'redirects_file=' . $relRedirects;
$extraMeta[] = 'body_norm=strip HTML comments; CRLF→LF; trim trailing spaces per line; no CSRF expected';
file_put_contents($metaFile, implode("\n", $extraMeta) . "\n");

fwrite(STDERR, "Wrote {$outFile}\nWrote {$redirectsFile}\nWrote {$metaFile}\n");
