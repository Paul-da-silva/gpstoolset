<?php
declare(strict_types=1);

/** Guide body: ubx-file. Converted from docs/guides/ubx-file.md — do not rewrite copy. */
?>
<p>A <strong>UBX</strong> file is a <strong>binary</strong> log written by u-blox GNSS receivers. Unlike GPX (plain XML for exchanging tracks), UBX is the receiver’s own framed protocol: sync bytes, a class and message id, a payload, and a checksum. Tools that only open GPX or KML cannot draw a raw <code>.ubx</code> dump until the navigation messages are decoded.</p>
<?php render_ad('ad-guides-in'); ?>
<p>If you have a receiver log full of <code>.ubx</code> files and want the path on a map, you are in the right place.</p>
<h2>What UBX is</h2>
<p>UBX messages are packed into frames that start with <code>B5 62</code> (hex). After the sync bytes come class, id, a little-endian length, the payload, then two checksum bytes (an 8-bit Fletcher over class through the end of the payload). Receivers can mix UBX frames with NMEA <code>$…</code> text lines in the same stream; a sensible reader skips non-UBX bytes and keeps scanning.</p>
<p>That design is for efficient on-device logging and configuration, not hand editing. GPX aims for interchange and map display. Both can describe the same path; they optimize for different jobs.</p>
<h2>Common messages</h2>
<div class="guide-table-wrap"><table class="guide-table">
<thead><tr><th>Message</th><th>Role</th></tr></thead>
<tbody>
<tr><td><strong>NAV-PVT</strong></td><td>Position, time, elevation, ground speed, fix quality</td></tr>
<tr><td><strong>NAV-POSLLH</strong></td><td>Lon/lat/height (useful when PVT is off)</td></tr>
<tr><td><strong>RXM raw</strong></td><td>Raw measurements for post-processing / RTK software</td></tr>
</tbody></table></div>
<p><strong>NAV-PVT</strong> is what a map needs: a fix with time and speed. <strong>RXM</strong> raw data is for specialised post-processing tools, not for drawing a track in the browser. GPS Toolset reads NAV-PVT (and falls back to NAV-POSLLH when there is no PVT). It ignores raw-measurement messages.</p>
<p>Format chooser: <?= site_link('/guides/gps-file-formats', 'GPS file formats') ?>. Deep GPX structure: <?= site_link('/guides/gpx-file', 'What is a GPX file?') ?>.</p>
<h2>How to open a UBX file here</h2>
<ol>
<li>Open <?= site_link('/ubx-viewer', '/ubx-viewer') ?>.</li>
<li>Drop the <code>.ubx</code> file. Parsing stays in the browser—nothing is uploaded.</li>
<li>Use Map / 3D, Stats, or Graphs under the map. Export GPX, KML, KMZ, or CSV when you want a copy on disk.</li>
</ol>
<p>If the page says no track was found, turn on <strong>NAV-PVT</strong> output on the receiver and record again. A log that only contains raw measurements will not draw a path here.</p>
<h2>Convert UBX → GPX</h2>
<ol>
<li>Open <?= site_link('/convert/ubx-to-gpx', '/convert/ubx-to-gpx') ?>.</li>
<li>Drop the <code>.ubx</code> file.</li>
<li>Download the <code>.gpx</code> output, or open it on the map.</li>
</ol>
<p>The GPX keeps positions, time, elevation, and speed when NAV-PVT recorded them. Other messages are skipped. After convert, trim or split in <?= site_link('/gpx-editor', '/gpx-editor') ?> if you need edits—there is no UBX editor on this site.</p>
<h2>Limits</h2>
<ul>
<li>No raw-measurement or RTK post-processing (RXM-RAWX and similar stay unused).</li>
<li>No writing UBX back out; export is GPX / KML / KMZ / CSV only.</li>
<li>No in-place editing of the binary log—convert to GPX first.</li>
</ul>
<h2>Privacy</h2>
<p>A UBX log can reveal where a receiver travelled. Browser-side parsing avoids uploading the file to a random website. Still scrub or trim before you post a track online—conversion does not anonymize.</p>
<h2>Related</h2>
<ul>
<li><?= site_link('/guides/gps-file-formats', 'GPS file formats') ?></li>
<li><?= site_link('/guides/gpx-file', 'What is a GPX file?') ?></li>
<li>Tools: <?= site_link('/ubx-viewer', '/ubx-viewer') ?> · <?= site_link('/convert/ubx-to-gpx', '/convert/ubx-to-gpx') ?> · <?= site_link('/gpx-viewer', '/gpx-viewer') ?></li>
</ul>
