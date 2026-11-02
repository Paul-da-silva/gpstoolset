<?php
declare(strict_types=1);

/**
 * FIT to GPX: page meta. Merged over its entry in config/tools.php.
 */
return [
    'title' => 'FIT to GPX Converter — Free, No Upload',
    'description' => 'Convert a FIT activity file to GPX in your browser. Save the GPX or open it on a map. The file never leaves your device.',
    'schemaName' => 'FIT to GPX Converter',
    'flags' => ['map' => false, 'video' => false, 'ads' => true],
    'styles' => ['/assets/css/tool-landing.css'],
    'module' => '/assets/js/tools/fit-to-gpx.js',
    'faq' => [
        [
            'q' => 'Does the FIT file get uploaded?',
            'a' => 'No. The browser reads the file where it already is. GPS Toolset does not receive a copy.',
        ],
        [
            'q' => 'What is a FIT file?',
            'a' => 'FIT is the activity file saved by many watches and bike computers. This page reads the GPS positions in it and writes a GPX file.',
        ],
        [
            'q' => 'What is kept in the GPX?',
            'a' => 'Position, time, elevation, and speed, when the FIT file recorded them. Heart rate, cadence, and power are not written into the GPX. The file is the path.',
        ],
        [
            'q' => 'The activity has no GPS. What happens?',
            'a' => 'Some indoor activities have no positions. This page cannot draw those, and it will say so. A file with a GPS recording converts as usual.',
        ],
        [
            'q' => 'What about a TCX file?',
            'a' => 'This page reads FIT, not TCX. TCX is a different export. If the watch or the app can save FIT or GPX, use that. A GPX file opens in the GPX viewer.',
        ],
        [
            'q' => 'The file has more than one sport. What happens?',
            'a' => 'When the FIT file marks each sport separately, each one becomes its own track in the GPX.',
        ],
    ],
];
