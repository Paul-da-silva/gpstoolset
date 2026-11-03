<?php
declare(strict_types=1);

/** Guide body: gpx-vs-kml. Converted from docs/guides/gpx-vs-kml.md — do not rewrite copy. */
?>
<p><strong>GPX</strong> and <strong>KML</strong> both describe places on Earth as XML, and both can hold a path you walked. They are not interchangeable in practice. GPX is what most GPS devices and outdoor apps exchange. KML is what Google Earth and Google Maps speak when you want placemarks, folders, and styles. Choosing wrong usually means “file won’t open,” not a subtle quality difference.</p>
<?php render_ad('ad-guides-in'); ?>
<p>This page is the <strong>decision</strong> guide. Structure details live on <?= site_link('/guides/gpx-file', 'What is a GPX file?') ?> and <?= site_link('/guides/kml-file', 'What is a KML file?') ?>—this page will not re-dump those schemas.</p>
<h2>GPX vs KML in one minute</h2>
<div class="guide-table-wrap"><table class="guide-table">
<thead><tr><th></th><th><strong>GPX</strong></th><th><strong>KML</strong></th></tr></thead>
<tbody>
<tr><td>Home turf</td><td>Watches, handhelds, trail and training apps</td><td>Google Earth, Google Maps, GIS overlays</td></tr>
<tr><td>Typical contents</td><td>Tracks, routes, waypoints with time/elevation</td><td>Placemarks, paths, polygons, styles, camera views</td></tr>
<tr><td>File style</td><td>GPS exchange XML</td><td>Earth markup XML (often shipped as KMZ)</td></tr>
<tr><td>When stuck</td><td>Convert KML → GPX for devices</td><td>Convert GPX → KML for Earth</td></tr>
</tbody></table></div>
<p>If you are loading a route onto a GPS or sharing a hike with a running club, start with GPX. If you are building a colored tour with photos in Earth, start with KML.</p>
<h2>When GPX wins</h2>
<p>GPX wins whenever the consumer is a <strong>GPS-centric</strong> tool:</p>
<ul>
<li>Recording and replaying an activity with timestamps.</li>
<li>Sending a track to a watch or handheld that lists “GPX” in its import menu.</li>
<li>Editing a path (trim, split, simplify) in <?= site_link('/gpx-editor', '/gpx-editor') ?>.</li>
<li>Keeping elevation and time attached to each track point for pace or climb analysis.</li>
</ul>
<p>Sports platforms that store richer sensor data often keep FIT internally and still offer GPX when you need a portable path. For that pipeline see <?= site_link('/guides/fit-file', 'FIT files') ?>.</p>
<h2>When KML wins</h2>
<p>KML wins when presentation and Earth features matter:</p>
<ul>
<li>Organizing many placemarks in folders.</li>
<li>Drawing polygons (property boundaries, airspace sketches) with styles.</li>
<li>Attaching icons, descriptions, and camera/tour views for Google Earth.</li>
<li>Sharing a map package that is meant to be opened in Earth or Maps, not on a watch.</li>
</ul>
<p>KML can represent a path (<code>LineString</code>) that looks like a GPX track on screen, but device firmware rarely wants that packaging. Convert before syncing to hardware.</p>
<h2>What each file typically contains (short)</h2>
<p><strong>GPX (typical):</strong> <code>wpt</code> waypoints, <code>trk</code>/<code>trkseg</code>/<code>trkpt</code> recorded tracks, optional <code>rte</code> routes, optional elevation and ISO time on points.</p>
<p><strong>KML (typical):</strong> <code>Placemark</code> with <code>Point</code>, <code>LineString</code>, or <code>Polygon</code>; <code>Folder</code>/<code>Document</code> hierarchy; <code>Style</code> for colors and icons; sometimes network links or overlays.</p>
<p>That is enough to choose. For element-level walkthroughs, use the format pages linked above. If your download ends in <code>.kmz</code>, that is zipped KML—see <?= site_link('/guides/kml-vs-kmz', 'KML vs KMZ') ?>.</p>
<h2>Converting KML → GPX</h2>
<p>Use this direction when Earth (or a KML email attachment) has the geometry and your watch or trail app needs GPX:</p>
<ol>
<li>Open <?= site_link('/convert/kml-to-gpx', '/convert/kml-to-gpx') ?>.</li>
<li>Drop the <code>.kml</code> (or <code>.kmz</code>) file.</li>
<li>Download the resulting GPX and open it in <?= site_link('/gpx-viewer', '/gpx-viewer') ?> to sanity-check the path.</li>
</ol>
<p>Expect some Earth-only features (styles, photo overlays, camera tours) to disappear—GPX has nowhere to put them. Paths and point coordinates are what survive.</p>
<h2>Converting GPX → KML</h2>
<p>Use this direction when you have a clean activity or hike as GPX and want it in Earth:</p>
<ol>
<li>Open <?= site_link('/convert/gpx-to-kml', '/convert/gpx-to-kml') ?>.</li>
<li>Drop the <code>.gpx</code> file.</li>
<li>Open the KML in Google Earth to add styles or folders if needed.</li>
</ol>
<p>Timestamps and elevation can be preserved depending on the converter options; fancy styling is something you add afterward in Earth, not something GPX carried in the first place.</p>
<h2>KMZ note</h2>
<p><strong>KMZ</strong> is not a third geography model—it is usually a ZIP archive whose main document is <code>doc.kml</code>, sometimes with images beside it. Treat KMZ like KML for “GPX vs KML” decisions, then read <?= site_link('/guides/kml-vs-kmz', 'KML vs KMZ') ?> if you need to unpack or convert the zip.</p>
<h2>Round-trip expectations</h2>
<p>GPX → KML → GPX (or the reverse) is useful but not lossless:</p>
<ul>
<li>Earth styles and folder structure vanish in GPX.</li>
<li>Some KML paths lack per-point times; the GPX will too.</li>
<li>GPX extensions (HR, cadence) may not map into plain KML placemarks.</li>
</ul>
<p>Do important edits in the format that stores the fields you care about, then convert once toward the destination app.</p>
<h2>Try it in the free converters</h2>
<ul>
<li><?= site_link('/convert/kml-to-gpx', '/convert/kml-to-gpx') ?> — Earth package → GPS track</li>
<li><?= site_link('/convert/gpx-to-kml', '/convert/gpx-to-kml') ?> — GPS track → Earth markup</li>
<li><?= site_link('/gpx-viewer', '/gpx-viewer') ?> — inspect the GPX before you sync it to a device</li>
</ul>
<p>All of these run in the browser so the file does not need to be uploaded to convert or view.</p>
<h2>Related guides</h2>
<ul>
<li><?= site_link('/guides/gpx-file', 'What is a GPX file?') ?></li>
<li><?= site_link('/guides/kml-file', 'What is a KML file?') ?></li>
<li><?= site_link('/guides/kml-vs-kmz', 'KML vs KMZ') ?></li>
<li><?= site_link('/guides/gps-file-formats', 'GPS file formats hub') ?></li>
</ul>
