<?php
declare(strict_types=1);

/**
 * Page and tool registry. includes/router.php reads this file.
 *
 * One entry per public HTML route, keyed by slug. Fields:
 *   slug         string   Same as the array key. "home" is the "/" route.
 *   path         string   Optional. Defaults to "/<slug>" ("/" for home).
 *   title        string   Page title (the site name is added by the SEO helper).
 *   description  string   Meta description.
 *   inSitemap    bool     Listed in /sitemap.xml.
 *   entry        string   PHP file to include, relative to the repo root.
 *   meta         string   Optional. A PHP file that returns an array merged over
 *                         this entry (tools keep title, flags, faq there).
 *   styles       array    Extra stylesheets, each under /assets/css/.
 *   flags        array    map: loads the map stack (Leaflet, map-shell.css)
 *                         video: tool has a video view
 *                         ads: false keeps ad slots off this page
 *
 * Only public/ is the document root. Entry files live above it.
 * Add a tool: see docs/architecture.md ("Add a new tool").
 */
return [
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
    'gpx-viewer' => [
        'slug' => 'gpx-viewer',
        'inSitemap' => true,
        'entry' => 'tools/gpx-viewer/page.php',
        'meta' => 'tools/gpx-viewer/meta.php',
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
    'kml-to-gpx' => [
        'slug' => 'kml-to-gpx',
        'inSitemap' => true,
        'entry' => 'tools/kml-to-gpx/page.php',
        'meta' => 'tools/kml-to-gpx/meta.php',
    ],
    'gpx-to-kml' => [
        'slug' => 'gpx-to-kml',
        'inSitemap' => true,
        'entry' => 'tools/gpx-to-kml/page.php',
        'meta' => 'tools/gpx-to-kml/meta.php',
    ],
    'fit-to-gpx' => [
        'slug' => 'fit-to-gpx',
        'inSitemap' => true,
        'entry' => 'tools/fit-to-gpx/page.php',
        'meta' => 'tools/fit-to-gpx/meta.php',
    ],
];
