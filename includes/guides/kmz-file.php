<?php
declare(strict_types=1);

/** Guide body: kmz-file. Converted from docs/guides/kmz-file.md — do not rewrite copy. */
?>
<p>A <strong>KMZ</strong> file is almost always a <strong>ZIP archive</strong> that contains a KML document—commonly named <code>doc.kml</code>—and optionally images, icons, or other overlays referenced by that KML. Think of KMZ as “KML packed for sharing,” not as a different way of measuring latitude and longitude.</p>
<?php render_ad('ad-guides-in'); ?>
<p>This page owns the packaging story. For what KML markup means, see <?= site_link('/guides/kml-file', 'What is a KML file?') ?>. For a short side-by-side, see <?= site_link('/guides/kml-vs-kmz', 'KML vs KMZ') ?>.</p>
<h2>What a KMZ file is</h2>
<p>Google Earth’s ecosystem needed a way to ship a map <strong>and</strong> its custom icons or ground overlays as one attachment. KMZ solves that by zipping the <code>.kml</code> together with supporting files. Many Earth “Save Place As” flows default to KMZ for exactly that reason.</p>
<p>You can rename a <code>.kmz</code> to <code>.zip</code> and open it with any normal unzip tool. Inside you should find at least one KML file. The conventional entry point is <strong><code>doc.kml</code></strong> at the root of the archive; relative links inside that KML point at sibling folders such as <code>files/</code> or <code>images/</code>.</p>
<h2>KMZ vs KML (packaging only)</h2>
<div class="guide-table-wrap"><table class="guide-table">
<thead><tr><th></th><th><strong>KML</strong></th><th><strong>KMZ</strong></th></tr></thead>
<tbody>
<tr><td>On disk</td><td>Plain <code>.kml</code> XML text</td><td><code>.kmz</code> ZIP container</td></tr>
<tr><td>Typical contents</td><td>Markup only</td><td><code>doc.kml</code> + optional images/overlays</td></tr>
<tr><td>Same geography model?</td><td>Yes</td><td>Yes (the KML inside)</td></tr>
</tbody></table></div>
<p>There is no separate “KMZ coordinate system.” Once you extract or parse the inner KML, you are back in ordinary KML territory (including the longitude-latitude coordinate order).</p>
<h2>What’s inside the zip</h2>
<p>A simple KMZ:</p>
<pre><code>my-tour.kmz
├── doc.kml
└── files/
    └── icon.png</code></pre>
<p>A complex one may add collada models, multiple overlays, or nested folders. For GPS conversion you usually care only about placemarks and <code>LineString</code> / track-like geometry inside <code>doc.kml</code>. Fancy overlays rarely map into GPX.</p>
<h2>How to open a KMZ</h2>
<ol>
<li><strong>Google Earth</strong> — open the <code>.kmz</code> directly; Earth unpacks it for you.</li>
<li><strong>Google My Maps</strong> — import where size and feature limits allow.</li>
<li><strong>Unzip manually</strong> — rename to <code>.zip</code> or use <code>unzip</code>, then open <code>doc.kml</code> as in the <?= site_link('/guides/kml-file', 'KML guide') ?>.</li>
<li><strong>Convert for GPS apps</strong> — open in <?= site_link('/kmz-viewer', '/kmz-viewer') ?> or convert with <?= site_link('/convert/kmz-to-gpx', '/convert/kmz-to-gpx') ?> when you need a <code>.gpx</code> for a watch or trail app.</li>
</ol>
<h2>Extracting the KML if you need to</h2>
<p>When a tool only accepts <code>.kml</code>:</p>
<ol>
<li>Unzip the KMZ.</li>
<li>Locate <code>doc.kml</code> (or the sole <code>.kml</code> if named differently).</li>
<li>If the KML references local images with relative paths, keep the folder layout if you still need those visuals in Earth.</li>
<li>For GPS conversion, the standalone KML geometry is usually enough—pass either the KMZ or the extracted KML to <?= site_link('/convert/kml-to-gpx', '/convert/kml-to-gpx') ?>.</li>
</ol>
<p>Broken KMZ files are often truncated downloads or archives that somehow lost <code>doc.kml</code>. Unzipping is the fastest way to see which.</p>
<h2>Convert KMZ / KML → GPX for apps and watches</h2>
<p>GPS watches and hiking apps want <strong>GPX</strong>, not Earth packages:</p>
<ol>
<li>Go to <?= site_link('/convert/kml-to-gpx', '/convert/kml-to-gpx') ?>.</li>
<li>Drop the <code>.kmz</code> or <code>.kml</code>.</li>
<li>Save the GPX and optionally inspect it before syncing.</li>
</ol>
<p>Going back toward Earth after editing a track: clean up in a GPX editor, then <?= site_link('/convert/gpx-to-kml', '/convert/gpx-to-kml') ?>, and re-zip in Earth if you need a KMZ again.</p>
<h2>Common gotchas with KMZ</h2>
<ul>
<li><strong>Email clients</strong> sometimes rewrite attachments or block zips. If Earth says the file is invalid, re-download from the original source or ask for a cloud link instead of a forwarded attachment.</li>
<li><strong>Nested zips</strong> are rare but confusing: a <code>.kmz</code> should be a zip of files, not a zip of another <code>.kmz</code>. Unzip once and look for <code>doc.kml</code>.</li>
<li><strong>Absolute file paths</strong> inside a hand-edited KML break as soon as you move the project. Prefer relative paths like <code>files/icon.png</code> before you re-zip as KMZ.</li>
<li><strong>Huge imagery</strong> balloons the KMZ. GPS converters will ignore the imagery anyway; for conversion, a slim KML extract is enough.</li>
</ul>
<h2>KMZ on phones and tablets</h2>
<p>Mobile Google Earth and Maps apps vary in how cheerfully they import KMZ. If a phone refuses the file:</p>
<ol>
<li>Try opening it in desktop Earth once to confirm the archive is valid.</li>
<li>Convert to GPX with <?= site_link('/convert/kml-to-gpx', '/convert/kml-to-gpx') ?> and open the GPX in a trail app or <?= site_link('/gpx-viewer', '/gpx-viewer') ?>.</li>
<li>If you still need Earth features (overlays), keep the KMZ for desktop and use GPX for the GPS device.</li>
</ol>
<h2>Privacy note</h2>
<p>A KMZ can embed photos of houses, vehicles, or private land as overlays. Browser converters on this site read the file locally, but you should still treat shared KMZ downloads as you would any archive from the internet: open from people you trust, and strip imagery you do not mean to redistribute.</p>
<h2>Related guides</h2>
<ul>
<li><?= site_link('/guides/kml-file', 'What is a KML file?') ?></li>
<li><?= site_link('/guides/kml-vs-kmz', 'KML vs KMZ') ?></li>
<li><?= site_link('/guides/gps-file-formats', 'GPS file formats') ?></li>
<li>Tools: <?= site_link('/convert/kml-to-gpx', '/convert/kml-to-gpx') ?> · <?= site_link('/convert/gpx-to-kml', '/convert/gpx-to-kml') ?></li>
</ul>
