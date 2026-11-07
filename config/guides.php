<?php
declare(strict_types=1);

/**
 * Guide registry. Sitemap reads published + inSitemap entries.
 * Routes are built in config/tools.php from this list.
 *
 * Fields: slug, title, description, inSitemap, published, updated,
 *         content, internal_links (tools, guides), optional hub.
 */
return [
    'gps-file-formats' => [
        'slug' => 'gps-file-formats',
        'title' => 'GPS File Formats — GPX, KML, KMZ, FIT & More',
        'description' => 'Quick map of GPS file formats: GPX, KML, KMZ, FIT, UBX, NMEA and more. Pick a format guide or convert in the browser with no upload.',
        'inSitemap' => true,
        'published' => true,
        'updated' => '2026-11-07',
        'hub' => true,
        'content' => 'includes/guides/gps-file-formats.php',
        'internal_links' => [
            'tools' => [
                '/gpx-viewer',
                '/kml-viewer',
                '/kmz-viewer',
                '/fit-viewer',
                '/ubx-viewer',
                '/gpx-editor',
                '/convert/kmz-to-gpx',
                '/convert/kml-to-gpx',
                '/convert/gpx-to-kml',
                '/convert/fit-to-gpx',
                '/convert/ubx-to-gpx',
                '/gopro-gps-extract',
            ],
            'guides' => [
                '/guides/gpx-file',
                '/guides/kmz-file',
                '/guides/kml-file',
                '/guides/kml-vs-kmz',
                '/guides/fit-file',
                '/guides/ubx-file',
                '/guides/nmea-0183',
                '/guides/gpx-vs-kml',
                '/guides/coordinate-formats',
            ],
        ],
    ],
    'gpx-file' => [
        'slug' => 'gpx-file',
        'title' => 'GPX File Format — What It Is and How to Open One',
        'description' => 'What the GPX file format is, what waypoints/tracks/routes look like, and how to open or edit a GPX online in your browser with no upload.',
        'inSitemap' => true,
        'published' => true,
        'updated' => '2026-11-03',
        'content' => 'includes/guides/gpx-file.php',
        'internal_links' => [
            'tools' => [
                '/gpx-viewer',
                '/gpx-editor',
                '/convert/gpx-to-kml',
                '/convert/kml-to-gpx',
            ],
            'guides' => [
                '/guides/gpx-vs-kml',
                '/guides/gps-file-formats',
                '/guides/fit-file',
            ],
        ],
    ],
    'kml-file' => [
        'slug' => 'kml-file',
        'title' => 'What Is a KML File? Open It or Convert to GPX',
        'description' => 'Learn what a KML file is, how it works with Google Earth and Maps, and how to convert KML to GPX for watches and trail apps—no upload.',
        'inSitemap' => true,
        'published' => true,
        'updated' => '2026-11-03',
        'content' => 'includes/guides/kml-file.php',
        'internal_links' => [
            'tools' => [
                '/kml-viewer',
                '/kmz-viewer',
                '/convert/kmz-to-gpx',
                '/convert/kml-to-gpx',
                '/convert/gpx-to-kml',
                '/gpx-viewer',
                '/gpx-editor',
            ],
            'guides' => [
                '/guides/kmz-file',
                '/guides/kml-vs-kmz',
                '/guides/gpx-vs-kml',
            ],
        ],
    ],
    'kmz-file' => [
        'slug' => 'kmz-file',
        'title' => 'KMZ File — What It Is, How to Open It, Convert to GPX',
        'description' => 'A KMZ file is a zipped KML package (usually doc.kml plus optional images). Learn how to open a KMZ file and convert it to GPX for GPS apps—no upload.',
        'inSitemap' => true,
        'published' => true,
        'updated' => '2026-11-03',
        'content' => 'includes/guides/kmz-file.php',
        'internal_links' => [
            'tools' => [
                '/kmz-viewer',
                '/convert/kmz-to-gpx',
                '/convert/kml-to-gpx',
                '/convert/gpx-to-kml',
            ],
            'guides' => [
                '/guides/kml-file',
                '/guides/kml-vs-kmz',
                '/guides/gps-file-formats',
            ],
        ],
    ],
    'fit-file' => [
        'slug' => 'fit-file',
        'title' => 'What Is a FIT File? Convert FIT to GPX Free',
        'description' => 'A FIT file is a binary sports-activity format from watches and bike computers. Learn what it stores and how to convert FIT to GPX in your browser.',
        'inSitemap' => true,
        'published' => true,
        'updated' => '2026-11-03',
        'content' => 'includes/guides/fit-file.php',
        'internal_links' => [
            'tools' => [
                '/fit-viewer',
                '/convert/fit-to-gpx',
                '/gpx-viewer',
                '/gpx-editor',
            ],
            'guides' => [
                '/guides/gpx-file',
                '/guides/gps-file-formats',
            ],
        ],
    ],
    'ubx-file' => [
        'slug' => 'ubx-file',
        'title' => 'What Is a UBX File? Open u-blox GPS Logs Online',
        'description' => 'A UBX file is a binary log from u-blox GNSS receivers. Learn what the frames contain and how to open or convert UBX to GPX in your browser—no upload.',
        'inSitemap' => true,
        'published' => true,
        'updated' => '2026-11-07',
        'content' => 'includes/guides/ubx-file.php',
        'internal_links' => [
            'tools' => [
                '/ubx-viewer',
                '/convert/ubx-to-gpx',
                '/gpx-viewer',
                '/gpx-editor',
            ],
            'guides' => [
                '/guides/gps-file-formats',
                '/guides/gpx-file',
            ],
        ],
    ],
    'kml-vs-kmz' => [
        'slug' => 'kml-vs-kmz',
        'title' => 'KML vs KMZ — What’s the Difference?',
        'description' => 'KML is geographic XML; KMZ is usually that KML zipped with images. Learn the difference, how to open each, and how to get a GPX for watches.',
        'inSitemap' => true,
        'published' => true,
        'updated' => '2026-11-03',
        'content' => 'includes/guides/kml-vs-kmz.php',
        'internal_links' => [
            'tools' => [
                '/kmz-viewer',
                '/convert/kmz-to-gpx',
                '/convert/kml-to-gpx',
                '/convert/gpx-to-kml',
            ],
            'guides' => [
                '/guides/kml-file',
                '/guides/kmz-file',
                '/guides/gpx-vs-kml',
            ],
        ],
    ],
    'gpx-vs-kml' => [
        'slug' => 'gpx-vs-kml',
        'title' => 'GPX vs KML — Which Should You Use?',
        'description' => 'GPX vs KML compared by use case: sports and trail apps versus Google Earth. Convert either way in the browser with no upload.',
        'inSitemap' => true,
        'published' => true,
        'updated' => '2026-11-03',
        'content' => 'includes/guides/gpx-vs-kml.php',
        'internal_links' => [
            'tools' => [
                '/kml-viewer',
                '/kmz-viewer',
                '/convert/kmz-to-gpx',
                '/convert/kml-to-gpx',
                '/convert/gpx-to-kml',
                '/gpx-viewer',
                '/gpx-editor',
            ],
            'guides' => [
                '/guides/gpx-file',
                '/guides/kml-file',
                '/guides/kml-vs-kmz',
            ],
        ],
    ],
];
