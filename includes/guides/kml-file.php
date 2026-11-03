<?php
declare(strict_types=1);

/** Guide body: kml-file. Converted from docs/guides/kml-file.md — do not rewrite copy. */
?>
<p><strong>KML</strong> (Keyhole Markup Language) is an XML format for geographic annotation—placemarks, paths, polygons, overlays, and camera views. It is the native markup language associated with Google Earth (Keyhole was the company behind the early Earth product). If someone sends you a colored tour of a trail, a set of map pins in folders, or a property outline to open in Earth, it is probably a <code>.kml</code> file (or a <code>.kmz</code> zip of one).</p>
<?php render_ad('ad-guides-in'); ?>
<p>This page explains KML itself. Packaging into a zip is covered in <?= site_link('/guides/kmz-file', 'What is a KMZ file?') ?> and <?= site_link('/guides/kml-vs-kmz', 'KML vs KMZ') ?>. Choosing GPX versus KML for a workflow is <?= site_link('/guides/gpx-vs-kml', 'GPX vs KML') ?>.</p>
<h2>What KML is</h2>
<p>KML describes <strong>what to show on a globe or map</strong>, not only a bare GPS breadcrumb. A document can nest folders, attach HTML descriptions to placemarks, set line colors, and define look-at / camera positions for Earth. Official documentation lives with Google’s KML reference; Wikipedia’s KML page is a reasonable overview of history and scope.</p>
<p>A tiny placemark looks like this:</p>
<pre><code class="language-xml">&lt;?xml version="1.0" encoding="UTF-8"?&gt;
&lt;kml xmlns="http://www.opengis.net/kml/2.2"&gt;
  &lt;Document&gt;
    &lt;name&gt;Example&lt;/name&gt;
    &lt;Placemark&gt;
      &lt;name&gt;Eiffel Tower&lt;/name&gt;
      &lt;Point&gt;
        &lt;coordinates&gt;2.2945,48.8584,0&lt;/coordinates&gt;
      &lt;/Point&gt;
    &lt;/Placemark&gt;
  &lt;/Document&gt;
&lt;/kml&gt;</code></pre>
<p>Note the coordinate order: <strong>longitude, latitude, optional altitude</strong> (east, north, up)—the opposite of the “lat, lon” order many GPS users say out loud. Paths use <code>LineString</code> with the same order; areas use <code>Polygon</code>.</p>
<h2>What you usually find in a KML</h2>
<ul>
<li><strong>Placemarks</strong> — points with names and descriptions.</li>
<li><strong>Paths</strong> — <code>LineString</code> geometry that can represent a hike or road.</li>
<li><strong>Polygons</strong> — closed shapes for regions.</li>
<li><strong>Folders / Document</strong> — hierarchy for organizing large maps.</li>
<li><strong>Styles</strong> — icon, line, and polygon appearance.</li>
<li><strong>Overlays</strong> (sometimes) — ground or screen images tied to the map.</li>
</ul>
<p>A KML exported as a “track” from Earth may be a <code>LineString</code> without the rich per-point timing GPX track points often carry. That is one reason a round-trip through GPX can feel lossy in either direction.</p>
<h2>KML and Google Earth / Maps</h2>
<p><strong>Google Earth</strong> is the full desktop/web client for rich KML (tours, 3D views, overlays). <strong>Google Maps</strong> can import simpler KML/KMZ in My Maps and some layers, with limits on complexity and features. Other GIS tools also read KML, but Earth remains the format’s cultural home.</p>
<p>If your only goal is to glance at a path, Earth or Maps may be enough. If your goal is to load the same path onto a GPS watch, continue to the conversion sections below.</p>
<h2>How to open a KML file</h2>
<p>Options, from simplest to more technical:</p>
<ol>
<li><strong>Double-click / Open with Google Earth</strong> if Earth is installed, or use Earth on the web where import is supported.</li>
<li><strong>Google My Maps</strong> — create a map and import the KML/KMZ (watch size limits).</li>
<li><strong>Text editor</strong> — fine for debugging broken XML; not fine for geography.</li>
<li><strong>Convert to GPX</strong> and open in <?= site_link('/gpx-viewer', '/gpx-viewer') ?> when you care about a GPS-style track view and edits.</li>
</ol>
<p>Avoid renaming <code>.kml</code> to <code>.gpx</code>. The XML vocabularies differ; converters exist for a reason.</p>
<h2>Why watches often want GPX instead</h2>
<p>Consumer GPS devices and outdoor apps standardized on <strong>GPX</strong> for routes and tracks. Their importers expect waypoints, track segments, and often timestamps—not KML styles and folders. Even when a device “kind of” accepts KML, support is uneven. The reliable path is: KML → GPX → device.</p>
<h2>Convert KML → GPX</h2>
<ol>
<li>Open <?= site_link('/convert/kml-to-gpx', '/convert/kml-to-gpx') ?>.</li>
<li>Drop your <code>.kml</code> file (KMZ works on the same tool when the archive contains the usual <code>doc.kml</code>).</li>
<li>Download GPX, then optionally verify in <?= site_link('/gpx-viewer', '/gpx-viewer') ?> or edit in <?= site_link('/gpx-editor', '/gpx-editor') ?>.</li>
</ol>
<p>Styles, photo overlays, and Earth camera tours will not survive—those are KML concepts. Coordinates from points and paths will.</p>
<h2>Convert GPX → KML when you need Earth again</h2>
<p>Going the other way is useful after you cleaned a track in a GPX editor and want folders or styling in Earth:</p>
<ul>
<li>Use <?= site_link('/convert/gpx-to-kml', '/convert/gpx-to-kml') ?>, then open the result in Earth to decorate.</li>
</ul>
<h2>Namespaces and versions</h2>
<p>Modern KML commonly uses the OGC KML 2.2 namespace (<code>http://www.opengis.net/kml/2.2</code>). Older files may still reference Google’s earlier namespace URIs. Sensible parsers accept both; hand-merged files that mix namespaces without care are a frequent source of “Earth won’t open this” bugs. If you edit KML by hand, change as little as possible and validate in Earth before sharing.</p>
<h2>KML vs KMZ (teaser)</h2>
<p>If your file ends in <code>.kmz</code>, you are looking at a compressed package that almost always contains a <code>doc.kml</code> plus optional images. Functionally you still have KML geography; the zip is for portability. Details: <?= site_link('/guides/kmz-file', 'What is a KMZ file?') ?> and <?= site_link('/guides/kml-vs-kmz', 'KML vs KMZ') ?>.</p>
<h2>Lon, lat order (easy mistake)</h2>
<p>KML’s <code>coordinates</code> element stores <strong>longitude first</strong>, then latitude, then optional altitude in meters. That is the opposite of how most people say “lat, long” out loud. If a placemark appears on the wrong continent after a hand edit, swap the first two numbers and try again before blaming the map.</p>
<h2>Related guides and tools</h2>
<ul>
<li><?= site_link('/convert/kml-to-gpx', '/convert/kml-to-gpx') ?> · <?= site_link('/convert/gpx-to-kml', '/convert/gpx-to-kml') ?> · <?= site_link('/gpx-viewer', '/gpx-viewer') ?></li>
<li><?= site_link('/guides/kmz-file', 'KMZ files') ?> · <?= site_link('/guides/kml-vs-kmz', 'KML vs KMZ') ?> · <?= site_link('/guides/gpx-vs-kml', 'GPX vs KML') ?></li>
</ul>
