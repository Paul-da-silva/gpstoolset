<?php
declare(strict_types=1);

/**
 * SEO pair pages for the converter. Each row is /convert/<slug>.
 * The page is tools/convert/page.php. The intro is
 * tools/convert/pairs/<slug>.php. The app is public/assets/js/converter/.
 * Adding a pair is a row here plus that content file. No new JS.
 */
return [
    [
        'slug' => 'kml-to-gpx',
        'from' => 'kml',
        'to' => 'gpx',
        'title' => 'KML to GPX Converter — Free',
        'description' => 'Convert KML to GPX in your browser. Tracks and placemarks become a GPX file you can save or open on a map. Nothing is uploaded.',
        'schemaName' => 'KML to GPX Converter',
        'faq' => [
            [
                'q' => 'Does the KML file get uploaded?',
                'a' => 'No. The browser reads the file where it already is. GPS Toolset does not receive a copy.',
            ],
            [
                'q' => 'What is the difference between KML and KMZ?',
                'a' => 'KML is the map file itself. KMZ is that same file zipped. This page is set up for KML. A KMZ file converts on the KMZ to GPX page, and it also opens if you drop it here.',
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
    ],
    [
        'slug' => 'gpx-to-kml',
        'from' => 'gpx',
        'to' => 'kml',
        'title' => 'GPX to KML Converter — Free Online',
        'description' => 'Convert GPX to KML in your browser. Tracks and waypoints become a KML file for maps that open KML. Nothing is uploaded.',
        'schemaName' => 'GPX to KML Converter',
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
                'q' => 'Can I look at the result on a map as well?',
                'a' => 'Yes. View on the map opens the KML in the KML viewer. That does not change the download.',
            ],
        ],
    ],
    [
        'slug' => 'fit-to-gpx',
        'from' => 'fit',
        'to' => 'gpx',
        'title' => 'FIT to GPX Converter — Free, No Upload',
        'description' => 'Convert a FIT activity file to GPX in your browser. Save the GPX or open it on a map. The file never leaves your device.',
        'schemaName' => 'FIT to GPX Converter',
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
    ],
    [
        'slug' => 'kmz-to-gpx',
        'from' => 'kmz',
        'to' => 'gpx',
        'title' => 'KMZ to GPX Converter — Free',
        'description' => 'Convert KMZ to GPX in your browser. The zipped KML is read on your device and saved as GPX. Nothing is uploaded.',
        'schemaName' => 'KMZ to GPX Converter',
        'faq' => [
            [
                'q' => 'Does the KMZ file get uploaded?',
                'a' => 'No. The browser unzips and reads the file where it already is. GPS Toolset does not receive a copy.',
            ],
            [
                'q' => 'What is converted from the KMZ?',
                'a' => 'The KML inside the zip, usually doc.kml. Each line becomes a GPX track. Point placemarks become waypoints. Pictures packed beside the KML are skipped.',
            ],
            [
                'q' => 'How is this different from KML to GPX?',
                'a' => 'KMZ is a zip. This page opens the zip first. A plain .kml file converts on the KML to GPX page, and it also opens if you drop it here.',
            ],
            [
                'q' => 'The KMZ will not open. What now?',
                'a' => 'Unzip it on your device and drop the .kml file. Some zip compressions are not readable in every browser.',
            ],
            [
                'q' => 'Can I see the GPX on a map?',
                'a' => 'Yes. View on the map opens the GPX in the GPX viewer. The download stays on this device either way.',
            ],
        ],
    ],
    [
        'slug' => 'gpx-to-kmz',
        'from' => 'gpx',
        'to' => 'kmz',
        'title' => 'GPX to KMZ Converter — Free',
        'description' => 'Convert GPX to KMZ in your browser. Tracks and waypoints are packed into a KMZ file. Nothing is uploaded.',
        'schemaName' => 'GPX to KMZ Converter',
        'faq' => [
            [
                'q' => 'Does the GPX file get uploaded?',
                'a' => 'No. The browser reads the file where it already is. GPS Toolset does not receive a copy.',
            ],
            [
                'q' => 'What is inside the KMZ?',
                'a' => 'One KML file named doc.kml, zipped. Each GPX track becomes a line. Waypoints become placemarks. Time and elevation are kept when the GPX has them.',
            ],
            [
                'q' => 'Why KMZ instead of KML?',
                'a' => 'KMZ is the same map packed into one file. Use it when a map asks for KMZ. If you want the plain KML, use GPX to KML.',
            ],
            [
                'q' => 'The GPX is a route, not a track. Will it convert?',
                'a' => 'Yes. A route is converted as a line when the file has no track. Waypoints are still included.',
            ],
            [
                'q' => 'Can I open the KMZ on a map here?',
                'a' => 'Yes. View on the map opens the KMZ in the KMZ viewer. The download stays on this device either way.',
            ],
        ],
    ],
    [
        'slug' => 'kmz-to-kml',
        'from' => 'kmz',
        'to' => 'kml',
        'title' => 'KMZ to KML Converter — Free',
        'description' => 'Convert KMZ to KML in your browser. Paths and points are written as a KML file. Nothing is uploaded.',
        'schemaName' => 'KMZ to KML Converter',
        'faq' => [
            [
                'q' => 'Does the KMZ file get uploaded?',
                'a' => 'No. The browser unzips and reads the file where it already is. GPS Toolset does not receive a copy.',
            ],
            [
                'q' => 'Is this a plain unzip?',
                'a' => 'The page reads the paths and the points, then writes a KML file. Pictures, network links, and ground overlays in the KMZ are not copied across.',
            ],
            [
                'q' => 'What is kept?',
                'a' => 'Each line becomes a line in the KML. Point placemarks become points. Time and elevation are kept when the file has them.',
            ],
            [
                'q' => 'The KMZ will not open. What now?',
                'a' => 'Unzip it on your device and use the .kml file that is already inside. Some zip compressions are not readable in every browser.',
            ],
            [
                'q' => 'Can I look at it on a map?',
                'a' => 'Yes. View on the map opens the KML in the KML viewer.',
            ],
        ],
    ],
    [
        'slug' => 'ubx-to-gpx',
        'from' => 'ubx',
        'to' => 'gpx',
        'title' => 'UBX to GPX Converter — Free, No Upload',
        'description' => 'Convert a u-blox UBX log to GPX in your browser. Save the GPX or open it on a map. The file never leaves your device.',
        'schemaName' => 'UBX to GPX Converter',
        'faq' => [
            [
                'q' => 'Does the UBX file get uploaded?',
                'a' => 'No. The browser reads the file where it already is. GPS Toolset does not receive a copy.',
            ],
            [
                'q' => 'What is kept in the GPX?',
                'a' => 'Positions, time, elevation, and speed when NAV-PVT recorded them. Other UBX messages, including raw measurements, are skipped.',
            ],
            [
                'q' => 'The page says no track was found. What now?',
                'a' => 'Turn on NAV-PVT output on the receiver and record again. This converter needs those navigation messages.',
            ],
            [
                'q' => 'Can I see it on a map?',
                'a' => 'Yes. View on the map opens the GPX in the GPX viewer. The download stays on this device either way.',
            ],
        ],
    ],
];