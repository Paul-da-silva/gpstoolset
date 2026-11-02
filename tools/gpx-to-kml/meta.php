<?php
declare(strict_types=1);

/**
 * GPX to KML: page meta. Merged over its entry in config/tools.php.
 */
return [
    'title' => 'GPX to KML Converter — Free Online',
    'description' => 'Convert GPX to KML in your browser. Tracks and waypoints become a KML file for maps that open KML. Nothing is uploaded.',
    'schemaName' => 'GPX to KML Converter',
    'flags' => ['map' => false, 'video' => false, 'ads' => true],
    'styles' => ['/assets/css/tool-landing.css'],
    'module' => '/assets/js/tools/gpx-to-kml.js',
    'faq' => [
        [
            'q' => 'Does the GPX file get uploaded?',
            'a' => 'No. The browser reads the file where it already is. GPS Toolset does not receive a copy.',
        ],
        [
            'q' => 'What is in the KML file?',
            'a' => 'Each GPX track becomes a line. If every point has a time, those times are written into the KML. Waypoints become placemarks. Elevation is kept when the GPX has it.',
        ],
        [
            'q' => 'The GPX is a route, not a track. Will it convert?',
            'a' => 'Yes. A route is converted as a line when the file has no track. Waypoints are still included.',
        ],
        [
            'q' => 'Can I open the KML in Google Earth?',
            'a' => 'Download the KML and open it in a map that reads KML, including Google Earth. The file is saved on your device.',
        ],
        [
            'q' => 'Can I look at the GPX on a map as well?',
            'a' => 'Yes. View the GPX opens the original file in the GPX viewer. That does not change the KML download.',
        ],
    ],
];
