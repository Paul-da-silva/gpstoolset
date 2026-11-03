<?php
declare(strict_types=1);

/** Guide body: gps-file-formats. Converted from docs/guides/gps-file-formats.md — do not rewrite copy. */
?>
<p>Pick a format below for the full guide, or jump straight to a converter. This page is a map of the site’s format docs—not a deep dive.</p>
<?php render_ad('ad-guides-in'); ?>
<h2>Pick a format</h2>
<div class="guide-table-wrap"><table class="guide-table">
<thead><tr><th>Format</th><th>What it is (one line)</th><th>Guide</th><th>Tool</th></tr></thead>
<tbody>
<tr><td><strong>GPX</strong></td><td>XML track / waypoint exchange used by watches and trail apps</td><td><?= site_link('/guides/gpx-file', '/guides/gpx-file') ?></td><td><?= site_link('/gpx-viewer', '/gpx-viewer') ?></td></tr>
<tr><td><strong>KMZ</strong></td><td>ZIP package of KML (usually <code>doc.kml</code> + optional images)</td><td><?= site_link('/guides/kmz-file', '/guides/kmz-file') ?></td><td><?= site_link('/kmz-viewer', '/kmz-viewer') ?> · <?= site_link('/convert/kmz-to-gpx', '/convert/kmz-to-gpx') ?></td></tr>
<tr><td><strong>KML</strong></td><td>Google Earth / Maps geographic markup (XML)</td><td><?= site_link('/guides/kml-file', '/guides/kml-file') ?></td><td><?= site_link('/kml-viewer', '/kml-viewer') ?> · <?= site_link('/convert/kml-to-gpx', '/convert/kml-to-gpx') ?></td></tr>
<tr><td><strong>FIT</strong></td><td>Binary sports-activity file from many watches</td><td><?= site_link('/guides/fit-file', '/guides/fit-file') ?></td><td><?= site_link('/fit-viewer', '/fit-viewer') ?> · <?= site_link('/convert/fit-to-gpx', '/convert/fit-to-gpx') ?></td></tr>
<tr><td><strong>NMEA 0183</strong></td><td>Line-based GPS text sentences from receivers / loggers</td><td><?= site_link('/guides/nmea-0183', '/guides/nmea-0183') ?></td><td>GPX via future converter · <?= site_link('/gpx-viewer', '/gpx-viewer') ?></td></tr>
<tr><td><strong>TCX</strong></td><td>Older XML activity format (Training Center family)</td><td>See FIT guide</td><td>Export GPX from your platform when possible</td></tr>
<tr><td><strong>Video GPS</strong></td><td>GPS embedded in action-cam video (e.g. GoPro)</td><td>—</td><td><?= site_link('/gopro-gps-extract', '/gopro-gps-extract') ?></td></tr>
<tr><td><strong>GNSS logger CSV</strong></td><td>Spreadsheet-style exports from GNSS loggers</td><td>—</td><td>Converter planned</td></tr>
</tbody></table></div>
<h2>Hiking &amp; watches</h2>
<p>Prefer <strong>GPX</strong>. Open in <?= site_link('/gpx-viewer', '/gpx-viewer') ?>; edit in <?= site_link('/gpx-editor', '/gpx-editor') ?>. If you have KML/KMZ from a map share, convert with <?= site_link('/convert/kml-to-gpx', '/convert/kml-to-gpx') ?>. Decision help: <?= site_link('/guides/gpx-vs-kml', '/guides/gpx-vs-kml') ?>.</p>
<h2>Google Earth / Maps</h2>
<p>Prefer <strong>KML</strong> or <strong>KMZ</strong>. Packaging difference: <?= site_link('/guides/kml-vs-kmz', '/guides/kml-vs-kmz') ?>. Full KML: <?= site_link('/guides/kml-file', '/guides/kml-file') ?>. Full KMZ: <?= site_link('/guides/kmz-file', '/guides/kmz-file') ?>.</p>
<h2>Sports watch files</h2>
<p>Native activity files are often <strong>FIT</strong>. Convert for maps with <?= site_link('/convert/fit-to-gpx', '/convert/fit-to-gpx') ?>. Guide: <?= site_link('/guides/fit-file', '/guides/fit-file') ?>.</p>
<h2>Logger &amp; video exports</h2>
<p>Action-cam GPS: <?= site_link('/gopro-gps-extract', '/gopro-gps-extract') ?>. Raw receiver text: <?= site_link('/guides/nmea-0183', '/guides/nmea-0183') ?>. Spreadsheet exports from GNSS loggers: converter planned (never upload tracks you care about to random sites).</p>
<h2>Convert without uploading</h2>
<div class="guide-table-wrap"><table class="guide-table">
<thead><tr><th>From → to</th><th>Tool</th></tr></thead>
<tbody>
<tr><td>KML → GPX</td><td><?= site_link('/convert/kml-to-gpx', '/convert/kml-to-gpx') ?></td></tr>
<tr><td>KMZ → GPX</td><td><?= site_link('/convert/kmz-to-gpx', '/convert/kmz-to-gpx') ?></td></tr>
<tr><td>GPX → KML</td><td><?= site_link('/convert/gpx-to-kml', '/convert/gpx-to-kml') ?></td></tr>
<tr><td>FIT → GPX</td><td><?= site_link('/convert/fit-to-gpx', '/convert/fit-to-gpx') ?></td></tr>
<tr><td>View GPX</td><td><?= site_link('/gpx-viewer', '/gpx-viewer') ?></td></tr>
<tr><td>Edit track</td><td><?= site_link('/gpx-editor', '/gpx-editor') ?></td></tr>
<tr><td>Video → track</td><td><?= site_link('/gopro-gps-extract', '/gopro-gps-extract') ?></td></tr>
</tbody></table></div>
<h2>All format guides</h2>
<ul>
<li><?= site_link('/guides/gpx-file', '/guides/gpx-file') ?> — GPX file format  </li>
<li><?= site_link('/guides/kmz-file', '/guides/kmz-file') ?> — KMZ file  </li>
<li><?= site_link('/guides/kml-file', '/guides/kml-file') ?> — What is a KML file  </li>
<li><?= site_link('/guides/kml-vs-kmz', '/guides/kml-vs-kmz') ?> — KML vs KMZ  </li>
<li><?= site_link('/guides/nmea-0183', '/guides/nmea-0183') ?> — NMEA 0183  </li>
<li><?= site_link('/guides/gpx-vs-kml', '/guides/gpx-vs-kml') ?> — GPX vs KML  </li>
<li><?= site_link('/guides/fit-file', '/guides/fit-file') ?> — What is a FIT file  </li>
<li><?= site_link('/guides/coordinate-formats', '/guides/coordinate-formats') ?> — Coordinate formats  </li>
</ul>
