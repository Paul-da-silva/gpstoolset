<?php
declare(strict_types=1);

/**
 * Measure distance: page meta. Merged over its entry in config/tools.php.
 * The map opens immediately (body class is-map). The guide stays in the HTML.
 */
return [
    'title' => 'Measure Distance on a Map — Free Tool',
    'description' => 'Measure distance on a map by clicking points. See each leg and the total in kilometres or miles. A free distance calculator. Nothing is uploaded.',
    'schemaName' => 'Measure Distance on a Map',
    'bodyClass' => 'is-map',
    'flags' => ['map' => true, 'video' => false, 'ads' => false],
    'styles' => [
        '/assets/css/tool-landing.css',
        '/assets/css/measure.css',
    ],
    'module' => '/assets/js/tools/measure-distance.js',
    'faq' => [
        [
            'q' => 'Does this follow roads?',
            'a' => 'No. Each leg is the shortest distance over the earth, and a long leg curves on the map. To follow a road, click a point at each bend. That is a route you traced yourself, not driving directions.',
        ],
        [
            'q' => 'Can I use kilometres and miles?',
            'a' => 'Yes. Metric shows metres and kilometres. Imperial shows feet and miles. The choice is remembered in this browser.',
        ],
        [
            'q' => 'Is the line uploaded?',
            'a' => 'No. The points stay in this browser tab. GPS Toolset does not take an account and does not store the line.',
        ],
        [
            'q' => 'What if location is blocked?',
            'a' => 'My location is optional. If the browser blocks it, click the map instead.',
        ],
        [
            'q' => 'Will this work on a phone?',
            'a' => 'Yes. Tap the map to add a point. The total sits under the map. Drag a point to move it.',
        ],
    ],
];
