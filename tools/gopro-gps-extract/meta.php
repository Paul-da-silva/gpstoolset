<?php
declare(strict_types=1);

/**
 * GoPro GPS Extractor: page meta. Merged over its entry in config/tools.php.
 *
 * styles / vendorScripts / module are loaded by tools/gopro-gps-extract/page.php.
 * All paths start with /assets/.
 */
return [
    'title' => 'GoPro GPS Extractor — Free, No Upload',
    'description' => 'Extract GPS from a GoPro video in your browser. Read the GoPro GPS data, view the track, and download a GPX, CSV, or KML file. Nothing is uploaded.',
    'schemaName' => 'GoPro GPS Extractor',
    'flags' => ['map' => true, 'video' => true, 'ads' => false],
    'styles' => ['/assets/css/tool-landing.css'],
    'vendorScripts' => [
        '/assets/vendor/gopro/gpmf-fast.js',
        '/assets/vendor/gopro/gopro-telemetry-bundle.min.js',
    ],
    'module' => '/assets/js/tools/gopro-gps-extract.js',
    'faq' => [
        [
            'q' => 'Does the video get uploaded?',
            'a' => 'No. The browser reads the file where it already is. GPS Toolset does not receive a copy.',
        ],
        [
            'q' => 'Which cameras does this read?',
            'a' => 'HERO5 and newer cameras that store GPS in the video, including MAX. HERO12 has no GPS, and Session cameras do not record GPS. GPS must be on while recording. A clip shot with GPS off has no track to read.',
        ],
        [
            'q' => 'Why is there no GPS data in my video?',
            'a' => 'GPS has to be on in the camera before you record, and the camera needs time outdoors to get a fix. Indoor clips, or clips that start before the fix, can have little or no usable track.',
        ],
        [
            'q' => 'What is a GPX file?',
            'a' => 'GPX is a common file for a GPS track. Maps, watches, and sports apps can open it. This page can also save CSV for a spreadsheet or KML for an earth-style map.',
        ],
        [
            'q' => 'How large can the video be?',
            'a' => 'The limit is the memory in your browser. The page reads the GPS data in the file, not the picture stream, so a long clip is lighter than it looks. The smaller .LRV proxy has the same GPS and is quicker to open.',
        ],
        [
            'q' => 'Can I watch the clip with the map?',
            'a' => 'Yes. After the track loads, choose Video on the map. The clip plays from your device, with a small map and the numbers you leave switched on. Until the first good GPS sample, the page says it is waiting for a fix.',
        ],
        [
            'q' => 'Will this work on a phone?',
            'a' => 'Yes. Pick the video from your phone. After the track loads you can use the map or play the video. The controls are large enough to tap.',
        ],
    ],
];
