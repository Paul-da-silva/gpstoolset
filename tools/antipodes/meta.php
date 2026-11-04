<?php
declare(strict_types=1);

/**
 * Antipodes calculator: page meta. Merged over its entry in config/tools.php.
 * The map opens immediately (body class is-map). The guide stays in the HTML.
 */
return [
    'title' => 'Antipodes Calculator — Other Side of Earth',
    'description' => 'Click a point on the map and see the place on the opposite side of the Earth. Free antipodes calculator. Nothing is uploaded.',
    'schemaName' => 'Antipodes Calculator',
    'bodyClass' => 'is-map',
    'flags' => ['map' => true, 'video' => false, 'ads' => false],
    'styles' => [
        '/assets/css/tool-landing.css',
        '/assets/css/antipodes.css',
    ],
    'module' => '/assets/js/tools/antipodes.js',
    'faq' => [
        [
            'q' => 'What is an antipode?',
            'a' => 'The antipode of a point is the place you would reach by going straight through the centre of the Earth and out the other side. On the map, latitude flips from north to south, and longitude shifts by 180°.',
        ],
        [
            'q' => 'Why is the other side often ocean?',
            'a' => 'Oceans cover most of the planet, and the Pacific sits opposite much of Europe, Africa, and the Atlantic. Land opposite land is less common. A point in eastern China can fall in South America. A point in western Europe often falls in the South Pacific.',
        ],
        [
            'q' => 'Is the point uploaded?',
            'a' => 'No. The point stays in this browser tab. GPS Toolset does not take an account and does not store the place you picked.',
        ],
        [
            'q' => 'What if location is blocked?',
            'a' => 'My location is optional. If the browser blocks it, click the left map instead.',
        ],
        [
            'q' => 'Will this work on a phone?',
            'a' => 'Yes. The map you pick on sits above the opposite side. Tap to place the point. Drag the marker to move it.',
        ],
    ],
];
