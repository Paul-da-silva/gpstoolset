<?php
declare(strict_types=1);

/** About page body. Routed by includes/router.php (config/tools.php: about). */

require APP_ROOT . '/includes/layout/head.php';
require APP_ROOT . '/includes/layout/topbar.php';
?>
<main class="page">
  <h1>About</h1>
  <p><?= e(site('name')) ?> is a set of free browser tools for GPS files and maps. Open a track, look at it, edit it, or convert it. Your file never leaves your device.</p>
  <p>There is no account. A file you open is read in your browser, and a download is saved by your browser. How that works is on the <a href="/privacy">privacy</a> page.</p>

  <h2>Tools</h2>
  <ul>
    <li><a href="/gpx-viewer">GPX</a>, <a href="/kml-viewer">KML</a>, <a href="/kmz-viewer">KMZ</a>, and <a href="/fit-viewer">FIT</a> viewers. Drop a file and see the path, with speed and altitude, on a map.</li>
    <li><a href="/gpx-editor">GPX editor</a>. Trim, simplify, reverse, fix elevation, merge, or split a track, then download it.</li>
    <li><a href="/convert">Converter</a>. Turn GPX, KML, KMZ, and FIT into another of those formats, or into CSV.</li>
    <li><a href="/gopro-gps-extract">GoPro GPS</a>. Read the GPS track recorded in a GoPro video, and play it against the clip.</li>
    <li><a href="/coordinate-converter">Coordinate converter</a> for decimal degrees, degrees-minutes-seconds, UTM, and MGRS.</li>
    <li><a href="/measure-distance">Measure distance</a> between points on the map.</li>
    <li><a href="/antipodes">Antipodes</a>. Pick a point and see the place on the other side of Earth.</li>
  </ul>
  <p>Short explainers for the file formats are in the <a href="/guides">guides</a>.</p>

  <h2>Maps</h2>
  <p>The maps use <a href="https://www.openstreetmap.org/">OpenStreetMap</a> tiles. Attribution stays on the map. Your GPS file is not included in the tile request.</p>
</main>
<?php require APP_ROOT . '/includes/layout/footer.php'; ?>
