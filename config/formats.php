<?php
declare(strict_types=1);

/**
 * One row per GPS file format.
 *
 * Home drop, the viewer and editor landings, and the converter read this
 * (the browser copy is window.GPS_FORMATS). Adding a format is a row here
 * plus tools/<slug>/content.php. The viewer, editor, and converter JS
 * do not change.
 *
 * magic.type is xml-root, zip, or ascii. detect.js implements those three.
 * writable formats can be exported. FIT is read-only.
 * parser is an ES module that exports parse(file) → { name, segments, waypoints }.
 */
return [
    'gpx' => [
        'id' => 'gpx',
        'label' => 'GPX',
        'extensions' => ['gpx'],
        'accept' => '.gpx,application/gpx+xml',
        'magic' => ['type' => 'xml-root', 'root' => 'gpx'],
        'parser' => '/assets/js/parsers/gpx.js',
        'exporter' => 'gpx',
        'writable' => true,
        'mime' => 'application/gpx+xml',
        'ext' => 'gpx',
        'landing' => '/gpx-viewer',
        'slug' => 'gpx-viewer',
        'title' => 'Free Online GPX Viewer & Reader — Open and View GPX in 3D',
        'description' => 'Open and read GPX files in your browser. View the track in 2D or 3D on a map. Free online GPX viewer — no upload, no install.',
        'schemaName' => 'GPX Viewer, Reader & 3D',
        'faq' => [
            [
                'q' => 'Does the GPX file get uploaded?',
                'a' => 'No. The browser reads the file where it already is. GPS Toolset does not receive a copy.',
            ],
            [
                'q' => 'What is a GPX reader?',
                'a' => 'A browser tool that opens and reads a .gpx file and shows the track on a map. Same job as a GPX viewer.',
            ],
            [
                'q' => 'GPX reader vs GPX viewer?',
                'a' => 'Same thing for most people; this page does both.',
            ],
            [
                'q' => 'What is a 3D GPX viewer / 3D GPX reader?',
                'a' => 'A browser tool that opens a .gpx and shows the track in 3D over a map. Same page as the 2D GPX viewer and reader.',
            ],
            [
                'q' => 'How do I view a GPX file in 3D?',
                'a' => 'Drop or choose a .gpx. When the track is on the map, tap 3D. Orbit the view. Switch back with Map. Nothing is uploaded.',
            ],
            [
                'q' => 'Does this work as a GPX 3D visualizer online?',
                'a' => 'Yes. It runs in the browser with no install. The track sits over a street map. There is no terrain model and no satellite layer.',
            ],
            [
                'q' => 'What is a GPX file?',
                'a' => 'GPX is a common file for a GPS track: a list of positions, often with time and elevation. Watches, phones, loggers, and some cameras can save one. This page opens it on a map.',
            ],
            [
                'q' => 'How do I open a GPX file online?',
                'a' => 'Drop a .gpx or choose a file. The track shows on the map. Then use Stats or Graphs under the map, or Export to save GPX, KML, KMZ, or CSV. Nothing is uploaded.',
            ],
            [
                'q' => 'Do I need to install an app?',
                'a' => 'No. It runs in the browser on desktop and phone.',
            ],
            [
                'q' => 'Can I edit the track here?',
                'a' => 'This page is for viewing. Trim, simplify, reverse, fix elevation, merge, or split a track in the GPX editor. The editor opens the same file.',
            ],
            [
                'q' => 'Can I turn a GPX file into a CSV or KML?',
                'a' => 'Yes. After the track loads, Export can save GPX, KML, KMZ, or CSV. CSV is one row per point. The file is saved on your device.',
            ],
            [
                'q' => 'The file has several tracks. Which one is on the map?',
                'a' => 'Each part is listed above the map. The map and the graphs show the one you pick. A GPX, KML, or KMZ download keeps every part. CSV saves the part you are viewing.',
            ],
            [
                'q' => 'Will this work on a phone?',
                'a' => 'Yes. Choose a .gpx file from your phone. The map fills the screen.',
            ],
        ],
    ],
    'kml' => [
        'id' => 'kml',
        'label' => 'KML',
        'extensions' => ['kml'],
        'accept' => '.kml,application/vnd.google-earth.kml+xml',
        'magic' => ['type' => 'xml-root', 'root' => 'kml'],
        'parser' => '/assets/js/parsers/kml.js',
        'exporter' => 'kml',
        'writable' => true,
        'mime' => 'application/vnd.google-earth.kml+xml',
        'ext' => 'kml',
        'landing' => '/kml-viewer',
        'slug' => 'kml-viewer',
        'title' => 'Free Online KML Viewer & Reader — Open and View KML in 3D',
        'description' => 'Open and read KML files in your browser. View the track in 2D or 3D on a map. Free online KML viewer — no upload, no install.',
        'schemaName' => 'KML Viewer, Reader & 3D',
        'faq' => [
            [
                'q' => 'Does the KML file get uploaded?',
                'a' => 'No. The browser reads the file where it already is. GPS Toolset does not receive a copy.',
            ],
            [
                'q' => 'What is a KML reader?',
                'a' => 'A browser tool that opens and reads a .kml file and shows the track on a map. Same job as a KML viewer.',
            ],
            [
                'q' => 'KML reader vs KML viewer?',
                'a' => 'Same thing for most people; this page does both.',
            ],
            [
                'q' => 'What is a 3D KML viewer / 3D KML reader?',
                'a' => 'A browser tool that opens a .kml and shows the track in 3D over a map. Same page as the 2D KML viewer and reader.',
            ],
            [
                'q' => 'How do I view a KML file in 3D?',
                'a' => 'Drop or choose a .kml. When the track is on the map, tap 3D. Orbit the view. Switch back with Map. Nothing is uploaded.',
            ],
            [
                'q' => 'Does this work as a KML 3D visualizer online?',
                'a' => 'Yes. It runs in the browser with no install. The track sits over a street map. There is no terrain model and no satellite layer.',
            ],
            [
                'q' => 'What is a KML file?',
                'a' => 'KML is a map file used by Google Earth and many other maps. A line is a path. A point placemark is a single place. This page draws both.',
            ],
            [
                'q' => 'How do I open a KML file online?',
                'a' => 'Drop a .kml or choose a file. Lines and point placemarks show on the map. Then use Map / 3D, Stats or Graphs, or Export to save GPX, KML, KMZ, or CSV. Nothing is uploaded.',
            ],
            [
                'q' => 'Do I need to install an app?',
                'a' => 'No. It runs in the browser on desktop and phone.',
            ],
            [
                'q' => 'I have a KMZ file, not a KML. Where does it open?',
                'a' => 'KMZ is a zipped KML. Open it in the KMZ viewer. This page reads a .kml file.',
            ],
            [
                'q' => 'What happens to photos and ground overlays?',
                'a' => 'Photos, network links, and ground overlays are skipped. Lines become the track. Point placemarks become waypoints.',
            ],
            [
                'q' => 'Can I edit the path?',
                'a' => 'View it here, then open the GPX editor to trim, simplify, reverse, merge, or split it. You can also convert it to GPX first.',
            ],
            [
                'q' => 'The file has several paths. Which one is shown?',
                'a' => 'Each path is listed. The map shows the one you pick. A download of GPX, KML, or KMZ keeps every path.',
            ],
        ],
    ],
    'kmz' => [
        'id' => 'kmz',
        'label' => 'KMZ',
        'extensions' => ['kmz'],
        'accept' => '.kmz,application/vnd.google-earth.kmz',
        'magic' => ['type' => 'zip'],
        'parser' => '/assets/js/parsers/kml.js',
        'exporter' => 'kmz',
        'writable' => true,
        'mime' => 'application/vnd.google-earth.kmz',
        'ext' => 'kmz',
        'landing' => '/kmz-viewer',
        'slug' => 'kmz-viewer',
        'title' => 'Free Online KMZ Viewer & Reader — Open and View KMZ in 3D',
        'description' => 'Open and read KMZ files in your browser. The zipped KML is read on your device — view in 2D or 3D. Free online KMZ viewer — no upload, no install.',
        'schemaName' => 'KMZ Viewer, Reader & 3D',
        'faq' => [
            [
                'q' => 'Does the KMZ file get uploaded?',
                'a' => 'No. The browser unzips and reads the file where it already is. GPS Toolset does not receive a copy.',
            ],
            [
                'q' => 'What is a KMZ reader?',
                'a' => 'A browser tool that opens and reads a .kmz file and shows the track on a map. Same job as a KMZ viewer.',
            ],
            [
                'q' => 'KMZ reader vs KMZ viewer?',
                'a' => 'Same thing for most people; this page does both.',
            ],
            [
                'q' => 'What is a 3D KMZ viewer / 3D KMZ reader?',
                'a' => 'A browser tool that opens a .kmz and shows the track in 3D over a map. Same page as the 2D KMZ viewer and reader.',
            ],
            [
                'q' => 'How do I view a KMZ file in 3D?',
                'a' => 'Drop or choose a .kmz. When the track is on the map, tap 3D. Orbit the view. Switch back with Map. Nothing is uploaded.',
            ],
            [
                'q' => 'Does this work as a KMZ 3D visualizer online?',
                'a' => 'Yes. It runs in the browser with no install. The track sits over a street map. There is no terrain model and no satellite layer.',
            ],
            [
                'q' => 'What is the difference between KMZ and KML?',
                'a' => 'KML is the map file. KMZ is that file zipped, sometimes with pictures beside it. This page reads the KML inside the zip.',
            ],
            [
                'q' => 'How do I open a KMZ file online?',
                'a' => 'Drop a .kmz or choose a file. The browser reads the KML inside the zip and draws the track. Then use Map / 3D, Stats or Graphs, or Export to save GPX, KML, KMZ, or CSV. Nothing is uploaded.',
            ],
            [
                'q' => 'Do I need to install an app?',
                'a' => 'No. It runs in the browser on desktop and phone.',
            ],
            [
                'q' => 'Are the pictures in the KMZ shown?',
                'a' => 'No. Pictures, network links, and ground overlays are skipped. The page draws the paths and the point placemarks.',
            ],
            [
                'q' => 'The file will not open. What now?',
                'a' => 'Some zip compressions are not readable in every browser. Unzip the KMZ on your device and open the .kml file in the KML viewer.',
            ],
            [
                'q' => 'Can I save it as GPX?',
                'a' => 'Yes. Export saves GPX, KML, KMZ, or CSV on this device. The GPX editor can change the track before you download.',
            ],
        ],
    ],
    'fit' => [
        'id' => 'fit',
        'label' => 'FIT',
        'extensions' => ['fit'],
        'accept' => '.fit,application/vnd.ant.fit',
        'magic' => ['type' => 'ascii', 'offset' => 8, 'value' => '.FIT'],
        'parser' => '/assets/js/parsers/fit.js',
        'exporter' => '',
        'writable' => false,
        'mime' => 'application/vnd.ant.fit',
        'ext' => 'fit',
        'landing' => '/fit-viewer',
        'slug' => 'fit-viewer',
        'title' => 'Free Online FIT Viewer & Reader — Open and View FIT in 3D',
        'description' => 'Open and read FIT activity files in your browser. View the GPS path in 2D or 3D on a map. Free online FIT viewer — no upload, no install.',
        'schemaName' => 'FIT Viewer, Reader & 3D',
        'faq' => [
            [
                'q' => 'Does the FIT file get uploaded?',
                'a' => 'No. The browser reads the file where it already is. GPS Toolset does not receive a copy.',
            ],
            [
                'q' => 'What is a FIT reader?',
                'a' => 'A browser tool that opens and reads a .fit activity file and shows the GPS path on a map. Same job as a FIT viewer.',
            ],
            [
                'q' => 'FIT reader vs FIT viewer?',
                'a' => 'Same thing for most people; this page does both.',
            ],
            [
                'q' => 'What is a 3D FIT viewer / 3D FIT reader?',
                'a' => 'A browser tool that opens a .fit and shows the GPS path in 3D over a map. Same page as the 2D FIT viewer and reader.',
            ],
            [
                'q' => 'How do I view a FIT file in 3D?',
                'a' => 'Drop or choose a .fit. When the path is on the map, tap 3D. Orbit the view. Switch back with Map. Nothing is uploaded.',
            ],
            [
                'q' => 'Does this work as a FIT 3D visualizer online?',
                'a' => 'Yes. It runs in the browser with no install. The track sits over a street map. There is no terrain model and no satellite layer.',
            ],
            [
                'q' => 'What is a FIT file?',
                'a' => 'FIT is the activity file saved by many watches and bike computers. This page reads the GPS positions and draws the path.',
            ],
            [
                'q' => 'How do I open a FIT file online?',
                'a' => 'Drop a .fit or choose a file. The GPS path shows on the map. Then use Map / 3D, Stats or Graphs, or Export to save GPX, KML, KMZ, or CSV. Nothing is uploaded.',
            ],
            [
                'q' => 'Do I need to install an app?',
                'a' => 'No. It runs in the browser on desktop and phone.',
            ],
            [
                'q' => 'Where are heart rate, cadence, and power?',
                'a' => 'Heart rate is a graph under the map when the file recorded it. Cadence and power stay in the FIT file. The map also shows the path, time, elevation, and speed when those were recorded.',
            ],
            [
                'q' => 'The activity has no GPS. What happens?',
                'a' => 'Some indoor activities have no positions. This page cannot draw those, and it will say so.',
            ],
            [
                'q' => 'Can I download a GPX?',
                'a' => 'Yes. Export saves GPX, KML, KMZ, or CSV. FIT itself is not written back. To change the track, open the GPX editor.',
            ],
            [
                'q' => 'The file has more than one sport. What is shown?',
                'a' => 'When the FIT file marks each sport separately, each one is its own part. Pick a part to see it on the map. A GPX download keeps every part.',
            ],
        ],
    ],
];
