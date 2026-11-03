<?php
declare(strict_types=1);
?>
<header class="topbar">
  <div class="topbar-inner">
    <a class="logo" href="/">
      <img class="logo-mark" src="/assets/images/logo.webp" alt="" width="43" height="36">
      <?= e(site('name')) ?>
    </a>
    <div id="topbar-tools" class="topbar-tools" hidden></div>
    <input type="checkbox" id="nav-toggle" class="nav-toggle">
    <label for="nav-toggle" class="nav-burger"><span class="nav-burger-bar"></span>Menu</label>
    <nav class="site-nav" aria-label="Primary">
      <div class="nav-group<?= nav_active('/gpx-viewer') ?><?= nav_active('/kml-viewer') ?><?= nav_active('/kmz-viewer') ?><?= nav_active('/fit-viewer') ?><?= nav_active('/gopro-gps-extract') ?>">
        <span class="nav-link">Viewers</span>
        <div class="nav-sub" role="group" aria-label="Viewers">
          <a class="nav-sublink<?= nav_active('/gpx-viewer') ?>" href="/gpx-viewer">
            <span class="nav-sublink-title">GPX</span>
            <span class="nav-sublink-note">View a GPX file on the map</span>
          </a>
          <a class="nav-sublink<?= nav_active('/kml-viewer') ?>" href="/kml-viewer">
            <span class="nav-sublink-title">KML</span>
            <span class="nav-sublink-note">View a KML file on the map</span>
          </a>
          <a class="nav-sublink<?= nav_active('/kmz-viewer') ?>" href="/kmz-viewer">
            <span class="nav-sublink-title">KMZ</span>
            <span class="nav-sublink-note">View a KMZ file on the map</span>
          </a>
          <a class="nav-sublink<?= nav_active('/fit-viewer') ?>" href="/fit-viewer">
            <span class="nav-sublink-title">FIT</span>
            <span class="nav-sublink-note">View a FIT activity on the map</span>
          </a>
          <p class="nav-subhead">More</p>
          <a class="nav-sublink<?= nav_active('/gopro-gps-extract') ?>" href="/gopro-gps-extract">
            <span class="nav-sublink-title">GoPro GPS</span>
            <span class="nav-sublink-note">Extract GPS from a video</span>
          </a>
        </div>
      </div>
      <div class="nav-group<?= nav_active('/coordinate-converter') ?><?= nav_active('/measure-distance') ?><?= nav_active('/convert') ?><?= str_starts_with(current_path(), '/convert/') ? ' is-active' : '' ?>">
        <span class="nav-link">Tools</span>
        <div class="nav-sub" role="group" aria-label="Tools">
          <a class="nav-sublink<?= nav_active('/coordinate-converter') ?>" href="/coordinate-converter">
            <span class="nav-sublink-title">Coordinate converter</span>
            <span class="nav-sublink-note">Decimal, DMS, UTM, and MGRS</span>
          </a>
          <a class="nav-sublink nav-sublink<?= nav_active('/measure-distance') ?>" href="/measure-distance">
            <span class="nav-sublink-title">Measure distance</span>
            <span class="nav-sublink-note">Distance between points on the map</span>
          </a>
          <a class="nav-sublink<?= nav_active('/convert') ?>" href="/convert">
            <span class="nav-sublink-title">Converter</span>
            <span class="nav-sublink-note">GPX, KML, KMZ, and FIT</span>
          </a>
        </div>
      </div>
      <a class="nav-link<?= nav_active('/guides') ?><?= str_starts_with(current_path(), '/guides/') ? ' is-active' : '' ?>" href="/guides">Guides</a>
    </nav>
  </div>
</header>
