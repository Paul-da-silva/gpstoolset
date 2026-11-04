<?php
declare(strict_types=1);

/**
 * Coordinate converter: guide under the tool.
 * Expects $route (config/tools.php entry merged with meta.php).
 */

$faq = $route['faq'];
?>
<section class="tool-section">
  <div class="tool-wrap">
    <h2>How to convert a coordinate</h2>
    <ol class="tool-steps">
      <li class="tool-step">
        <span class="tool-step-num">1</span>
        <h3>Paste or type</h3>
        <p>Paste a coordinate in any of the forms below, or pick a form and fill the boxes. A click on the map sets the point too.</p>
      </li>
      <li class="tool-step">
        <span class="tool-step-num">2</span>
        <h3>Read the others</h3>
        <p>Decimal degrees, DMS, DDM, UTM, and MGRS update together. South and west are negative in the decimal line.</p>
      </li>
      <li class="tool-step">
        <span class="tool-step-num">3</span>
        <h3>Copy a line</h3>
        <p>Copy one form, or copy all of them. The numbers stay in this tab.</p>
      </li>
    </ol>
  </div>
</section>

<section class="tool-section">
  <div class="tool-wrap tool-prose">
    <h2>Decimal, DMS, and DDM</h2>
    <p>A lat long converter is only a change of notation. These three lines are one place:</p>
    <ul class="coord-example">
      <li><span>Decimal</span> 36.2361322, -115.0820944</li>
      <li><span>DMS</span> 36° 14' 10.08" N, 115° 04' 55.54" W</li>
      <li><span>DDM</span> 36° 14.1679' N, 115° 04.9257' W</li>
    </ul>
    <p>Decimal degrees put the whole angle in one number. Latitude comes first. South and west are negative, so a point in the western hemisphere has a minus on the longitude.</p>
    <p>DMS is degrees, minutes, and seconds, with N, S, E, or W. DDM keeps whole degrees and puts the rest in decimal minutes. Charts and radios often print DDM. Sixty minutes make one degree, and sixty seconds make one minute.</p>
  </div>
</section>

<section class="tool-section">
  <div class="tool-wrap tool-prose">
    <h2>UTM</h2>
    <p>UTM writes the same place as metres inside a zone six degrees wide. The example above is:</p>
    <ul class="coord-example">
      <li><span>UTM</span> 11S 672349.27 4011844.98</li>
    </ul>
    <p>11 is the zone. S is the latitude band, not south. Bands run from C to X and skip I and O. Band S sits in the northern hemisphere, from 32°N to 40°N. This place is about 36°N, so the band is S. The first long number is metres east. The second is metres north.</p>
    <p>A few zones in Norway and Svalbard are wider than six degrees. This page follows those zones. UTM covers 80°S to 84°N.</p>
  </div>
</section>

<section class="tool-section">
  <div class="tool-wrap tool-prose">
    <h2>MGRS</h2>
    <p>MGRS is the grid printed on many maps. It starts from the UTM zone and band, adds two letters for a 100 km square, then digits for the easting and northing. The same place at 1 metre is:</p>
    <ul class="coord-example">
      <li><span>MGRS</span> 11S PA 72349 11844</li>
    </ul>
    <p>Spaces do not change the value. A shorter string is coarser: this page treats it as the centre of that square, then shows the 1 metre square inside it. MGRS uses the same latitude limits as UTM.</p>
  </div>
</section>

<section class="tool-section">
  <div class="tool-wrap tool-prose">
    <h2>Privacy</h2>
    <p>There is no account and no upload. The numbers are converted in this browser. Closing the tab drops them. Map pictures load so the point can be shown. The coordinate is not sent as a saved place.</p>
  </div>
</section>

<section class="tool-section">
  <div class="tool-wrap tool-prose">
    <h2>Questions</h2>
    <div class="faq">
      <?php foreach ($faq as $item) : ?>
      <details class="faq-item">
        <summary><?= e($item['q']) ?></summary>
        <p><?= e($item['a']) ?></p>
      </details>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<section class="tool-section">
  <div class="tool-wrap tool-prose">
    <h2>More on GPS Toolset</h2>
    <p><a href="/measure-distance">Measure distance on a map</a> if you want the length between points. The <a href="/antipodes">antipodes calculator</a> shows the place on the opposite side of the Earth. <a href="/gpx-viewer">Open a GPX file</a> when the coordinates are already a track.</p>
  </div>
</section>
