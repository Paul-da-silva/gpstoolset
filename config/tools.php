<?php
declare(strict_types=1);

/**
 * Page and tool registry. includes/router.php reads this file.
 *
 * Viewer routes are built from config/formats.php. Converter pair routes
 * are built from config/convert.php. Adding a format or a pair does not
 * add a new JS module.
 *
 * Fields:
 *   slug, path, title, description, inSitemap, entry, meta, styles, flags,
 *   module, content, format, from, to, faq, schemaName, pairContent.
 */
$formats = formats_registry();
$pairs = require __DIR__ . '/convert.php';

$tools = [
    'home' => [
        'slug' => 'home',
        'path' => '/',
        'title' => 'GPS Toolset',
        'description' => 'Browser tools for GPS files. Your file never leaves your device.',
        'inSitemap' => true,
        'entry' => 'includes/pages/home.php',
        'flags' => ['map' => false, 'video' => false, 'ads' => true],
    ],
    'privacy' => [
        'slug' => 'privacy',
        'title' => 'Privacy',
        'description' => 'GPS Toolset handles files in your browser. They are not uploaded.',
        'inSitemap' => true,
        'entry' => 'includes/pages/privacy.php',
        'flags' => ['map' => false, 'video' => false, 'ads' => true],
    ],
    'about' => [
        'slug' => 'about',
        'title' => 'About',
        'description' => 'GPS Toolset is a set of browser tools for GPS files and maps.',
        'inSitemap' => true,
        'entry' => 'includes/pages/about.php',
        'flags' => ['map' => false, 'video' => false, 'ads' => true],
    ],
    'gopro-gps-extract' => [
        'slug' => 'gopro-gps-extract',
        'inSitemap' => true,
        'entry' => 'tools/gopro-gps-extract/page.php',
        'meta' => 'tools/gopro-gps-extract/meta.php',
    ],
    'measure-distance' => [
        'slug' => 'measure-distance',
        'inSitemap' => true,
        'entry' => 'tools/measure-distance/page.php',
        'meta' => 'tools/measure-distance/meta.php',
    ],
    'coordinate-converter' => [
        'slug' => 'coordinate-converter',
        'inSitemap' => true,
        'entry' => 'tools/coordinate-converter/page.php',
        'meta' => 'tools/coordinate-converter/meta.php',
    ],
    'antipodes' => [
        'slug' => 'antipodes',
        'inSitemap' => true,
        'entry' => 'tools/antipodes/page.php',
        'meta' => 'tools/antipodes/meta.php',
    ],
];

foreach ($formats as $id => $format) {
    if (!is_array($format) || empty($format['slug'])) {
        continue;
    }
    $slug = (string) $format['slug'];
    $tools[$slug] = [
        'slug' => $slug,
        'path' => (string) ($format['landing'] ?? '/' . $slug),
        'title' => (string) ($format['title'] ?? $format['label'] ?? $slug),
        'description' => (string) ($format['description'] ?? ''),
        'inSitemap' => true,
        'entry' => 'tools/' . $slug . '/page.php',
        'content' => 'tools/' . $slug . '/content.php',
        'styles' => ['/assets/css/tool-landing.css'],
        'flags' => ['map' => true, 'video' => false, 'ads' => false],
        'module' => '/assets/js/viewer/landing.js',
        'format' => (string) $id,
        'schemaName' => (string) ($format['schemaName'] ?? $format['label'] ?? $slug),
        'faq' => is_array($format['faq'] ?? null) ? $format['faq'] : [],
    ];
}

$tools['gpx-editor'] = [
    'slug' => 'gpx-editor',
    'title' => 'Free Online GPX / Track Editor',
    'description' => 'Merge, split, trim, or simplify a GPS track in your browser. Open GPX, KML, KMZ, or FIT, then download GPX, KML, KMZ, or CSV. Nothing is uploaded.',
    'inSitemap' => true,
    'entry' => 'tools/gpx-editor/page.php',
    'content' => 'tools/gpx-editor/content.php',
    'styles' => ['/assets/css/tool-landing.css'],
    'flags' => ['map' => true, 'video' => false, 'ads' => false],
    'module' => '/assets/js/editor/landing.js',
    'schemaName' => 'GPX Editor',
    'faq' => [
        [
            'q' => 'Does the file get uploaded?',
            'a' => 'No. The browser reads the file where it already is. GPS Toolset does not receive a copy.',
        ],
        [
            'q' => 'Which files can I open?',
            'a' => 'GPX, KML, KMZ, and FIT. Drop one file or several. Each file is added as a track you can edit.',
        ],
        [
            'q' => 'What can I change?',
            'a' => 'Merge tracks into one, split one track into two, trim the ends, simplify a dense line, reverse the direction, and fix elevation spikes using nearby points in the file. Undo puts the last edit back.',
        ],
        [
            'q' => 'What can I download?',
            'a' => 'GPX, KML, KMZ, or CSV. GPX, KML, and KMZ keep every part and the waypoints. CSV is the part you are viewing. FIT can be opened here but is not written back.',
        ],
        [
            'q' => 'Will this work on a phone?',
            'a' => 'Yes. Choose a file from your phone. The map fills the screen, and the edit controls are large enough to tap.',
        ],
    ],
];

$tools['convert'] = [
    'slug' => 'convert',
    'title' => 'GPS File Converter — Free, No Upload',
    'description' => 'Convert GPX, KML, KMZ, and FIT in your browser. Pick the formats, then download the file. Nothing is uploaded.',
    'inSitemap' => true,
    'entry' => 'tools/convert/page.php',
    'styles' => ['/assets/css/tool-landing.css'],
    'flags' => ['map' => false, 'video' => false, 'ads' => true],
    'module' => '/assets/js/converter/landing.js',
    'schemaName' => 'GPS File Converter',
    'from' => '',
    'to' => '',
    'faq' => [
        [
            'q' => 'Does the file get uploaded?',
            'a' => 'No. The browser reads the file where it already is. GPS Toolset does not receive a copy.',
        ],
        [
            'q' => 'Which formats can I convert?',
            'a' => 'Open GPX, KML, KMZ, or FIT. Save GPX, KML, or KMZ. FIT can be read and turned into one of those. It is not written back.',
        ],
        [
            'q' => 'Can I choose the formats in the address?',
            'a' => 'Yes. A link such as /convert?from=kml&to=gpx opens this page with those formats selected. Named pages such as /convert/kml-to-gpx do the same.',
        ],
        [
            'q' => 'What is kept?',
            'a' => 'Tracks, routes, waypoints, and time and elevation when the file has them. Photos and other attachments are skipped. The result is the path.',
        ],
        [
            'q' => 'Can I see it on a map?',
            'a' => 'Yes. View on the map opens the converted file in the matching viewer.',
        ],
    ],
];

foreach (is_array($pairs) ? $pairs : [] as $pair) {
    if (!is_array($pair) || empty($pair['slug'])) {
        continue;
    }
    $slug = (string) $pair['slug'];
    $tools['convert-' . $slug] = [
        'slug' => 'convert-' . $slug,
        'path' => '/convert/' . $slug,
        'title' => (string) ($pair['title'] ?? $slug),
        'description' => (string) ($pair['description'] ?? ''),
        'inSitemap' => true,
        'entry' => 'tools/convert/page.php',
        'pairContent' => 'tools/convert/pairs/' . $slug . '.php',
        'styles' => ['/assets/css/tool-landing.css'],
        'flags' => ['map' => false, 'video' => false, 'ads' => true],
        'module' => '/assets/js/converter/landing.js',
        'schemaName' => (string) ($pair['schemaName'] ?? $slug),
        'from' => (string) ($pair['from'] ?? ''),
        'to' => (string) ($pair['to'] ?? ''),
        'faq' => is_array($pair['faq'] ?? null) ? $pair['faq'] : [],
    ];
}

$tools['guides'] = [
    'slug' => 'guides',
    'path' => '/guides',
    'title' => 'GPS Guides',
    'description' => 'Practical guides for GPX, KML, KMZ, FIT and converting GPS files in your browser. No upload.',
    'inSitemap' => true,
    'entry' => 'includes/pages/guides-index.php',
    'styles' => ['/assets/css/guides.css'],
    'flags' => ['map' => false, 'video' => false, 'ads' => true],
];

foreach (guides_registry() as $key => $guide) {
    if (!is_array($guide) || empty($guide['published'])) {
        continue;
    }
    $slug = (string) ($guide['slug'] ?? $key);
    // Sitemap URLs come from config/guides.php via seo_sitemap_urls().
    $tools['guide-' . $slug] = [
        'slug' => 'guide-' . $slug,
        'path' => '/guides/' . $slug,
        'title' => (string) ($guide['title'] ?? $slug),
        'description' => (string) ($guide['description'] ?? ''),
        'inSitemap' => false,
        'entry' => 'includes/pages/guide.php',
        'content' => (string) ($guide['content'] ?? 'includes/guides/' . $slug . '.php'),
        'styles' => ['/assets/css/guides.css'],
        'flags' => ['map' => false, 'video' => false, 'ads' => true],
        'guideSlug' => $slug,
        'faq' => is_array($guide['faq'] ?? null) ? $guide['faq'] : [],
    ];
}

return $tools;
