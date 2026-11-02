<?php
declare(strict_types=1);

/**
 * GPX viewer: page meta. Merged over its entry in config/tools.php.
 */
return [
    'title' => 'Free Online GPX Viewer & Editor',
    'description' => 'Open a GPX file on a map in your browser. View speed and altitude, then trim, simplify, or reverse the track and download GPX, CSV, or KML. Nothing is uploaded.',
    'schemaName' => 'GPX Viewer',
    'flags' => ['map' => true, 'video' => false, 'ads' => false],
    'styles' => ['/assets/css/tool-landing.css'],
    'vendorScripts' => [],
    'module' => '/assets/js/tools/gpx-viewer.js',
    'faq' => [
        [
            'q' => 'Does the GPX file get uploaded?',
            'a' => 'No. The browser reads the file where it already is. GPS Toolset does not receive a copy.',
        ],
        [
            'q' => 'What is a GPX file?',
            'a' => 'GPX is a common file for a GPS track: a list of positions, often with time and elevation. Watches, phones, loggers, and some cameras can save one. This page opens it on a map.',
        ],
        [
            'q' => 'What can I change in the track?',
            'a' => 'You can trim a start and end on one bar, simplify a dense line, reverse the direction, and fix elevation spikes using nearby points in the file. Trim and simplify show the result on the map before you keep it. Undo puts the last edit back. Download when you want a copy.',
        ],
        [
            'q' => 'Can I turn a GPX file into a CSV?',
            'a' => 'Yes. After the track loads, Export can save GPX, CSV, or KML. CSV is one row per point, with time, latitude, longitude, altitude in metres, and speed in metres per second. The file is saved on your device.',
        ],
        [
            'q' => 'What does fix elevation do?',
            'a' => 'It replaces isolated spikes and fills short gaps from the elevations already in the file. It does not download new heights, and it does not send your track anywhere.',
        ],
        [
            'q' => 'The file has several tracks. Which one do I edit?',
            'a' => 'Each part is listed under Edit. The map shows the part you pick. A GPX download keeps every part. CSV and KML save the part you are viewing.',
        ],
        [
            'q' => 'Will this work on a phone?',
            'a' => 'Yes. Choose a .gpx file from your phone. The map fills the screen, and the edit controls are large enough to tap.',
        ],
    ],
];
