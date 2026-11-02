<?php
declare(strict_types=1);

/**
 * KML / KMZ to GPX: page meta. Merged over its entry in config/tools.php.
 */
return [
    'title' => 'KML / KMZ to GPX Converter — Free',
    'description' => 'Convert KML or KMZ to GPX in your browser. Tracks and placemarks become a GPX file you can save or open on a map. Nothing is uploaded.',
    'schemaName' => 'KML to GPX Converter',
    'flags' => ['map' => false, 'video' => false, 'ads' => true],
    'styles' => ['/assets/css/tool-landing.css'],
    'module' => '/assets/js/tools/kml-to-gpx.js',
    'faq' => [
        [
            'q' => 'Does the KML file get uploaded?',
            'a' => 'No. The browser reads the file where it already is. GPS Toolset does not receive a copy.',
        ],
        [
            'q' => 'What is the difference between KML and KMZ?',
            'a' => 'KML is the map file itself. KMZ is that same file zipped, sometimes with pictures beside it. Both open here. A KMZ to GPX conversion uses the KML inside the zip and skips the pictures.',
        ],
        [
            'q' => 'What is kept in the GPX?',
            'a' => 'Each line becomes a track. A point placemark becomes a waypoint, not part of the line. Time and elevation are kept when the file has them. Photos, network links, and ground overlays are skipped.',
        ],
        [
            'q' => 'The file has several paths. What happens?',
            'a' => 'Each path becomes its own track in one GPX file. You can open that GPX in the GPX viewer and switch between them.',
        ],
        [
            'q' => 'Can I see it on a map before I download?',
            'a' => 'Yes. View on the map opens the GPX in the GPX viewer. The download stays on this device either way.',
        ],
    ],
];
