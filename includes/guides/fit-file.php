<?php
declare(strict_types=1);

/** Guide body: fit-file. Converted from docs/guides/fit-file.md — do not rewrite copy. */
?>
<p>A <strong>FIT</strong> file (Flexible and Interoperable Data Transfer) is a <strong>binary</strong> activity format used by many sports watches, bike computers, and fitness platforms. It was created in the Garmin / ANT+ ecosystem and is documented publicly through the Garmin FIT SDK overview. Unlike GPX (plain XML for exchanging tracks), FIT is built to store a whole workout: GPS samples plus heart rate, power, cadence, laps, device settings, and more, in a compact binary layout.</p>
<?php render_ad('ad-guides-in'); ?>
<p>If your watch backup folder is full of <code>.fit</code> files and your map tool only opens <code>.gpx</code>, you are in the right place.</p>
<h2>What a FIT file is</h2>
<p>FIT messages are typed records (session, lap, record, device info, and many sport-specific types). A “record” message during an outdoor activity typically carries latitude, longitude, timestamp, distance, and sensor fields. Because the file is binary, opening it in a text editor shows gibberish—you need an SDK, a vendor app, or a converter.</p>
<p>That design choice is deliberate: FIT aims for efficient on-device logging and rich analytics, not hand-editable XML. GPX aims for interchange and map display. Both can describe the same run; they optimize for different jobs.</p>
<h2>FIT vs GPX vs TCX (short)</h2>
<div class="guide-table-wrap"><table class="guide-table">
<thead><tr><th>Format</th><th>Shape</th><th>Best at</th></tr></thead>
<tbody>
<tr><td><strong>FIT</strong></td><td>Binary activity</td><td>Full workout + sensors on watches</td></tr>
<tr><td><strong>GPX</strong></td><td>XML track exchange</td><td>Maps, trail apps, device route import</td></tr>
<tr><td><strong>TCX</strong></td><td>XML activity (older Training Center)</td><td>Laps/activities in XML form</td></tr>
</tbody></table></div>
<p><strong>TCX</strong> sits in the same “activity” family as FIT but as XML. Many platforms can export GPX even when the native file is FIT or TCX. This site’s converter today targets <strong>FIT → GPX</strong>; there is not yet a dedicated TCX tool page—if you only have TCX, check whether your platform also offers a GPX export, or wait for a future converter.</p>
<p>Deep GPX structure: <?= site_link('/guides/gpx-file', 'What is a GPX file?') ?>. Format chooser: <?= site_link('/guides/gps-file-formats', 'GPS file formats') ?>.</p>
<h2>Where FIT files come from</h2>
<p>Typical sources:</p>
<ul>
<li>Sports watches and bike computers after an activity sync.</li>
<li>Vendor desktop or mobile apps when you export the original activity file.</li>
<li>Some third-party platforms that keep FIT as the archival format.</li>
</ul>
<p>Compatibility wording you will see in menus includes Garmin exports and similar watch ecosystems; the file extension is still <code>.fit</code> either way. Phone-only apps sometimes skip FIT entirely and give you GPX—lucky you.</p>
<h2>Why you convert to GPX to view on a map</h2>
<p>Most browser map viewers and many handheld GPS units expect GPX (or their own proprietary formats), not raw FIT. Converting strips or ignores sensor channels the map does not need and yields a track you can:</p>
<ul>
<li>Draw on an OpenStreetMap-based viewer.</li>
<li>Trim and split.</li>
<li>Share with someone who does not use your watch brand.</li>
<li>Re-import into a trail app as a route.</li>
</ul>
<p>You lose easy access to power/HR inside the GPX unless the converter maps them into GPX extensions—and many map tools ignore those extensions anyway. Keep the original FIT if you still need training analysis.</p>
<h2>Convert FIT → GPX in the browser</h2>
<ol>
<li>Open <?= site_link('/convert/fit-to-gpx', '/convert/fit-to-gpx') ?>.</li>
<li>Drop the <code>.fit</code> file. Parsing happens locally in the browser—no upload required for the conversion step.</li>
<li>Download the <code>.gpx</code> output.</li>
</ol>
<p>If the FIT has no GPS records (indoor trainer ride, pool swim without a path), the GPX may be empty or trivial. That is a data limitation, not a converter bug.</p>
<h2>After convert: view, trim, export</h2>
<p>Open the new GPX in <?= site_link('/gpx-viewer', '/gpx-viewer') ?> to verify, or <?= site_link('/gpx-editor', '/gpx-editor') ?> to trim:</p>
<ul>
<li>Confirm the path looks right (no mirror-world latitude sign errors—rare but obvious on a map).</li>
<li>Trim the walk from the parking lot.</li>
<li>Export again or convert onward to KML if you need Earth.</li>
</ul>
<p>Keeping both files is smart: FIT for training software, GPX for maps and sharing.</p>
<h2>Indoor and partial-GPS activities</h2>
<p>FIT is used for more than outdoor GPS sports. Trainer rides, strength sessions, and indoor rows may contain rich sensor data with little or no lat/lon. Converting those to GPX will not invent a map path. Conversely, an outdoor run with a long underground stretch may show a straight-line jump in the GPX—that jump was already in the FIT records.</p>
<p>When auditing a suspicious path, compare timestamps: FIT record messages carry time even when position is missing. A GPX viewer that plots only points with coordinates will skip gaps; that can look like a teleport.</p>
<h2>Multiple sports and product quirks</h2>
<p>Some devices write one FIT per activity; others append sessions. Converters generally pick the GPS-bearing records they understand. If a multi-sport file yields only the run leg or only the bike leg, check the vendor’s export options for “export each sport” or export GPX from the vendor cloud as a cross-check.</p>
<p>Firmware bugs exist in every ecosystem. If two exports of the same ride disagree, trust the map view of both and keep the original FIT bytes unchanged as your archive.</p>
<h2>Privacy and competition</h2>
<p>Activity FIT files can reveal home starts, frequent routes, and training load. Browser-side conversion avoids uploading the file to a random website, which matters for athletes who already strip start/end points before sharing GPX publicly. Still scrub or trim before you post a track online—conversion does not anonymize.</p>
<h2>Related format guides</h2>
<ul>
<li><?= site_link('/guides/gpx-file', 'What is a GPX file?') ?></li>
<li><?= site_link('/guides/gps-file-formats', 'GPS file formats') ?></li>
<li>Tools: <?= site_link('/convert/fit-to-gpx', '/convert/fit-to-gpx') ?> · <?= site_link('/gpx-viewer', '/gpx-viewer') ?></li>
</ul>
