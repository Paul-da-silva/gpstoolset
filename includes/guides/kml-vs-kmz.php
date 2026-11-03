<?php
declare(strict_types=1);

/** Guide body: kml-vs-kmz. Converted from docs/guides/kml-vs-kmz.md — do not rewrite copy. */
?>
<p>People treat <strong>KML</strong> and <strong>KMZ</strong> as rival formats. They are not. <strong>KML</strong> is the XML markup. <strong>KMZ</strong> is usually a zip file that wraps that markup (plus optional images) so you can email one attachment. Same geography, different packaging.</p>
<?php render_ad('ad-guides-in'); ?>
<p>This page stays on that distinction. Full KML feature walkthrough: <?= site_link('/guides/kml-file', 'What is a KML file?') ?>. Full KMZ unpack story: <?= site_link('/guides/kmz-file', 'What is a KMZ file?') ?>. GPX decisions: <?= site_link('/guides/gpx-vs-kml', 'GPX vs KML') ?>.</p>
<h2>KML vs KMZ in one sentence</h2>
<p><strong>KML is the map document; KMZ is that document in a zip, often with its icons and overlays along for the ride.</strong></p>
<h2>What’s inside a KMZ</h2>
<p>A typical KMZ contains:</p>
<ul>
<li><strong><code>doc.kml</code></strong> — the main KML document Earth looks for first.</li>
<li><strong>Supporting files</strong> — icons, ground overlay images, sometimes 3D assets, referenced by relative paths from the KML.</li>
</ul>
<p>Unzip and you are looking at ordinary files. There is no secret binary geometry format hiding in “real” KMZ beyond what the inner KML already expresses (with rare advanced exceptions that still do not help a hiking watch).</p>
<h2>When Google Earth gives you KMZ</h2>
<p>Earth’s save/export flows often prefer KMZ when:</p>
<ul>
<li>You used custom icons or photo overlays.</li>
<li>You want a single file to share.</li>
<li>The project references local resources that would break if you only emailed a bare <code>.kml</code> sitting somewhere else on disk.</li>
</ul>
<p>A plain placemark list with no local images can be saved as either; KMZ is simply the safer “share this folder as one file” default.</p>
<h2>Opening KML vs KMZ</h2>
<div class="guide-table-wrap"><table class="guide-table">
<thead><tr><th>Goal</th><th>KML</th><th>KMZ</th></tr></thead>
<tbody>
<tr><td>View in Google Earth</td><td>Open <code>.kml</code></td><td>Open <code>.kmz</code> (Earth unpacks)</td></tr>
<tr><td>View in My Maps</td><td>Import</td><td>Import (limits apply)</td></tr>
<tr><td>Inspect markup</td><td>Open in a text editor</td><td>Unzip, then open <code>doc.kml</code></td></tr>
<tr><td>Use on a GPS / trail app</td><td>Convert → GPX</td><td>Convert → GPX (same converter)</td></tr>
</tbody></table></div>
<p>Neither format is “more accurate.” Accuracy comes from the coordinates inside, not from compression.</p>
<h2>Getting a track into GPX (watches / trail apps)</h2>
<p>Outdoor devices want <strong>GPX</strong>. From either KML or KMZ:</p>
<ol>
<li>Open <?= site_link('/convert/kml-to-gpx', '/convert/kml-to-gpx') ?>.</li>
<li>Drop the file you have.</li>
<li>Download GPX and verify on a map before syncing to hardware.</li>
</ol>
<p>Expect to lose Earth styling. Keep the path; restyle later if you return to Earth.</p>
<h2>GPX → KML if you need Earth again</h2>
<p>After editing a track as GPX:</p>
<ol>
<li>Convert with <?= site_link('/convert/gpx-to-kml', '/convert/gpx-to-kml') ?>.</li>
<li>Open in Earth.</li>
<li>Save as KMZ if you need to bundle icons or share one attachment.</li>
</ol>
<p>That round-trip is normal; just remember each hop can drop features the destination format cannot store.</p>
<h2>Do you ever need both files?</h2>
<p>Sometimes yes:</p>
<ul>
<li>Keep <strong>KMZ</strong> as the shareable Earth project (icons + markup).</li>
<li>Keep <strong>GPX</strong> as the device/trail copy derived from the same path.</li>
<li>Optionally keep a bare <strong>KML</strong> checked into version control if you want readable diffs of the markup (zip diffs are painful).</li>
</ul>
<p>You do not need both for a one-off “show me the hike” task—pick the consumer first (Earth vs watch), then pick KML/KMZ vs GPX.</p>
<h2>Compression myths</h2>
<p>KMZ uses ordinary ZIP compression. It does not magically improve GPS accuracy, nor does unzipping “unlock higher precision coordinates.” Precision is whatever decimal places the inner KML already stored. If a path looks jagged after conversion, the source geometry was jagged (or the converter sampled a style-heavy document oddly)—not because ZIP ate digits.</p>
<h2>Workflow cheat sheet</h2>
<ol>
<li><strong>Only Earth</strong> → stay on KML or KMZ.</li>
<li><strong>Earth now, GPS later</strong> → KMZ/KML → <?= site_link('/convert/kml-to-gpx', '/convert/kml-to-gpx') ?>.</li>
<li><strong>GPS now, Earth later</strong> → GPX → <?= site_link('/convert/gpx-to-kml', '/convert/gpx-to-kml') ?> → save KMZ in Earth if you add icons.</li>
<li><strong>Debugging</strong> → unzip KMZ, validate <code>doc.kml</code> XML, fix, re-zip.</li>
</ol>
<h2>Which extension should you email?</h2>
<p>Email <strong>KMZ</strong> when the project uses local icons or overlays—otherwise the recipient opens a KML that points at images they do not have. Email <strong>KML</strong> when the file is a simple placemark or path with no local assets and you want the recipient to be able to peek at XML without unzipping.</p>
<p>If a corporate mail filter blocks <code>.kmz</code> because it is a zip, upload the KMZ to storage you control and send a link, or convert to GPX if the recipient only needed the path for a GPS.</p>
<h2>Relationship to GPX (boundary)</h2>
<p>KML/KMZ vs each other is packaging. KML/KMZ vs <strong>GPX</strong> is ecosystem. Do not use this page to decide watch vs Earth—that is <?= site_link('/guides/gpx-vs-kml', 'GPX vs KML') ?>. Once you know you need Earth markup, <em>then</em> choose plain KML vs KMZ using the table above.</p>
<h2>Related format guides</h2>
<ul>
<li><?= site_link('/guides/kml-file', 'What is a KML file?') ?></li>
<li><?= site_link('/guides/kmz-file', 'What is a KMZ file?') ?></li>
<li><?= site_link('/guides/gpx-vs-kml', 'GPX vs KML') ?></li>
<li><?= site_link('/guides/gps-file-formats', 'GPS file formats hub') ?></li>
</ul>
