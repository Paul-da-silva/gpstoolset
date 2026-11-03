<?php
declare(strict_types=1);

/** Guide body: gpx-file. Converted from docs/guides/gpx-file.md — do not rewrite copy. */
?>
<p>A <strong>GPX</strong> file (GPS Exchange Format) is the common language of GPS tracks between apps and devices. It is plain XML: human-readable text that describes waypoints, tracks, and routes with latitude, longitude, and usually time and elevation. If you have ever downloaded a hike from a trail app, exported an activity for a friend, or loaded a course onto a handheld GPS, you have almost certainly touched a <code>.gpx</code> file.</p>
<?php render_ad('ad-guides-in'); ?>
<p>This page owns the <strong>GPX file format</strong> query: what the format is, what is inside, and how to open or edit one. For a head-to-head with Google Earth’s format, see <?= site_link('/guides/gpx-vs-kml', 'GPX vs KML') ?>. For the full format zoo, see <?= site_link('/guides/gps-file-formats', 'GPS file formats') ?>.</p>
<h2>What the GPX file format is</h2>
<p>GPX was designed as an open exchange format so that a track recorded on one brand of device could be opened on another. The file is UTF-8 XML with a <code>gpx</code> root element and a schema version in the attributes (you will commonly see version <code>1.1</code>). Because it is text, you can open it in any editor—but a map viewer is far more useful than raw tags.</p>
<p>Unlike FIT (a binary sports-activity format), GPX focuses on geography: points in space and time, not heart-rate zones or power curves. That focus is why map tools love it and why sports watches often export both FIT (full activity) and GPX (the path).</p>
<h2>What’s inside: waypoints, tracks, routes</h2>
<p>GPX has three main building blocks:</p>
<ol>
<li><strong>Waypoints (<code>wpt</code>)</strong> — single named points (a summit, a parking lot, a cache).</li>
<li><strong>Tracks (<code>trk</code>)</strong> — the breadcrumb trail you actually walked or rode, usually with timestamps. A track contains track segments (<code>trkseg</code>), each a list of track points (<code>trkpt</code>).</li>
<li><strong>Routes (<code>rte</code>)</strong> — an ordered list of route points (<code>rtept</code>) meant as a plan to follow, not necessarily a recorded path.</li>
</ol>
<p>A minimal track looks like this:</p>
<pre><code class="language-xml">&lt;?xml version="1.0" encoding="UTF-8"?&gt;
&lt;gpx version="1.1" creator="example" xmlns="http://www.topografixo.com/GPX/1/1"&gt;
  &lt;trk&gt;
    &lt;name&gt;Example hike&lt;/name&gt;
    &lt;trkseg&gt;
      &lt;trkpt lat="48.8584" lon="2.2945"&gt;
        &lt;ele&gt;12.5&lt;/ele&gt;
        &lt;time&gt;2026-06-01T10:00:00Z&lt;/time&gt;
      &lt;/trkpt&gt;
      &lt;trkpt lat="48.8596" lon="2.2960"&gt;
        &lt;ele&gt;14.0&lt;/ele&gt;
        &lt;time&gt;2026-06-01T10:02:30Z&lt;/time&gt;
      &lt;/trkpt&gt;
    &lt;/trkseg&gt;
  &lt;/trk&gt;
&lt;/gpx&gt;</code></pre>
<p>Real files often add extensions (heart rate, cadence) via a separate XML namespace. Map viewers can ignore those extras and still draw the path.</p>
<h2>Where GPX files come from</h2>
<p>Common sources:</p>
<ul>
<li>Sports watches and bike computers (Garmin and others often offer a GPX export next to FIT).</li>
<li>Phone hiking and running apps when you share or download a route.</li>
<li>Platforms such as Strava when you export an activity as GPX.</li>
<li>Handheld GPS units and older logging software.</li>
<li>Converters that turn KML, KMZ, FIT, or video GPS into GPX.</li>
</ul>
<p>If your device only gave you a <code>.fit</code> file, convert it first—see <?= site_link('/guides/fit-file', 'What is a FIT file?') ?> and <?= site_link('/convert/fit-to-gpx', '/convert/fit-to-gpx') ?>.</p>
<h2>How to open a GPX file online</h2>
<p>You do not need desktop GIS software for a normal track:</p>
<ol>
<li>Open <?= site_link('/gpx-viewer', '/gpx-viewer') ?>.</li>
<li>Drop the <code>.gpx</code> file onto the page (or pick it with the file dialog).</li>
<li>The map draws the track in your browser. The file is read locally; it is not uploaded to a server for viewing.</li>
</ol>
<p>That “open online” path is the one most people want when a friend sends a GPX and they just need to see where it goes. Desktop apps and device sync tools still matter when you are loading a course onto hardware, but for inspection and light editing a browser viewer is enough.</p>
<h2>Edit: trim, split, simplify, reverse</h2>
<p>Once a track is open in the viewer, common cleanups include:</p>
<ul>
<li><strong>Trim</strong> — cut the false start walking to the trailhead or the drive home.</li>
<li><strong>Split</strong> — break one long recording into day sections.</li>
<li><strong>Simplify</strong> — reduce point count for apps with size limits (with some loss of detail).</li>
<li><strong>Reverse</strong> — flip a one-way route so you can hike it the other direction.</li>
<li><strong>Elevation fix</strong> — repair obvious spikes when the barometer or GPS altitude glitched.</li>
</ul>
<p>Those tools live on <?= site_link('/gpx-editor', '/gpx-editor') ?>. The format landing <?= site_link('/gpx-viewer', '/gpx-viewer') ?> is view-only and links to the editor.</p>
<h2>Export or convert</h2>
<p>From a clean GPX you might:</p>
<ul>
<li>Keep GPX for trail apps and watches.</li>
<li>Convert to KML for Google Earth styling via <?= site_link('/convert/gpx-to-kml', '/convert/gpx-to-kml') ?>.</li>
<li>Accept a KML/KMZ from Earth and convert the other way with <?= site_link('/convert/kml-to-gpx', '/convert/kml-to-gpx') ?>.</li>
<li>Export CSV when you need a spreadsheet of lat/lon/time (supported where the viewer offers it).</li>
</ul>
<h2>GPX vs KML (short)</h2>
<p><strong>GPX</strong> is the interchange format for GPS devices and outdoor apps. <strong>KML</strong> is Google’s markup for Earth and Maps (placemarks, styles, overlays). If your goal is a watch or a hiking app, stay on GPX. If your goal is a styled Earth tour, use KML—and convert when you cross ecosystems. Full decision guide: <?= site_link('/guides/gpx-vs-kml', 'GPX vs KML') ?>.</p>
<h2>Privacy: the file stays on your device</h2>
<p>Browser-based viewers and converters on this site parse your GPX <strong>locally</strong>. That is intentional: tracks can reveal home locations, private property, and competition lines. You should still treat any file you download from the internet as untrusted XML, but you should not have to upload a personal track to a random converter just to see it on a map.</p>
<h2>Related guides and tools</h2>
<ul>
<li><?= site_link('/gpx-viewer', '/gpx-viewer') ?> — open / view</li>
<li><?= site_link('/gpx-editor', '/gpx-editor') ?> — trim, split, simplify, reverse, elevation fix, merge</li>
<li><?= site_link('/convert/gpx-to-kml', '/convert/gpx-to-kml') ?> · <?= site_link('/convert/kml-to-gpx', '/convert/kml-to-gpx') ?></li>
<li><?= site_link('/guides/gps-file-formats', 'GPS file formats') ?> · <?= site_link('/guides/gpx-vs-kml', 'GPX vs KML') ?> · <?= site_link('/guides/fit-file', 'FIT files') ?></li>
</ul>
