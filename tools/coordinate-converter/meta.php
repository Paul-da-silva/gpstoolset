<?php
declare(strict_types=1);

/**
 * Coordinate converter: page meta. Merged over its entry in config/tools.php.
 * Document page, not the full-screen map. A small preview map is optional.
 */
return [
    'title' => 'Coordinate Converter — DMS, UTM & MGRS',
    'description' => 'Convert latitude and longitude between decimal degrees, DMS, UTM, and MGRS. A free lat long converter in your browser. Nothing is uploaded.',
    'schemaName' => 'Coordinate Converter',
    'flags' => ['map' => false, 'video' => false, 'ads' => true],
    'styles' => [
        '/assets/css/tool-landing.css',
        '/assets/vendor/leaflet/leaflet.css',
        '/assets/css/coordinate-converter.css',
    ],
    'faq' => [
        [
            'q' => 'Does this upload the coordinate?',
            'a' => 'No. The conversion runs in this browser. GPS Toolset does not receive the numbers. The map loads pictures so you can see the place.',
        ],
        [
            'q' => 'What is the difference between decimal, DMS, and DDM?',
            'a' => 'Decimal degrees are one number for latitude and one for longitude. South and west are negative. DMS splits each angle into degrees, minutes, and seconds. DDM keeps the degrees and uses decimal minutes. All three can name the same place.',
        ],
        [
            'q' => 'What does the letter in a UTM coordinate mean?',
            'a' => 'It is a latitude band, not a compass direction. Bands run from C to X, skipping I and O. Band S is in the northern hemisphere. The two long numbers are metres east, then metres north, inside a zone.',
        ],
        [
            'q' => 'What is MGRS?',
            'a' => 'MGRS is a grid used on many maps. It is built from UTM: a zone, a latitude band, two letters for a 100 km square, then digits. This page writes the 1 metre square. A shorter string is the centre of a larger square.',
        ],
        [
            'q' => 'Which datum does this use?',
            'a' => 'WGS84, the same datum GPS uses. Decimal degrees, DMS, UTM, and MGRS on this page are all on that ellipsoid.',
        ],
        [
            'q' => 'Why is there no UTM or MGRS near the poles?',
            'a' => 'UTM and MGRS cover 80°S to 84°N. Closer to a pole, decimal degrees and DMS still work.',
        ],
        [
            'q' => 'Can I click the map?',
            'a' => 'Yes. A click sets the coordinate. You can also paste one or type it in. Use the zoom buttons on the map. Scrolling the page does not zoom it.',
        ],
    ],
];
