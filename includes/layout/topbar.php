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
      <div class="nav-group<?= nav_active('/gopro-gps-extract') ?><?= nav_active('/gpx-viewer') ?>">
        <span class="nav-link">Viewers</span>
        <div class="nav-sub" role="group" aria-label="Viewers">
          <a class="nav-sublink<?= nav_active('/gopro-gps-extract') ?>" href="/gopro-gps-extract">
            <span class="nav-sublink-title">GoPro GPS</span>
            <span class="nav-sublink-note">Extract GPS from a video</span>
          </a>
          <a class="nav-sublink<?= nav_active('/gpx-viewer') ?>" href="/gpx-viewer">
            <span class="nav-sublink-title">GPX</span>
            <span class="nav-sublink-note">View and edit a track</span>
          </a>
        </div>
      </div>
      <div class="nav-group<?= nav_active('/measure-distance') ?>">
        <span class="nav-link">Tools</span>
        <div class="nav-sub" role="group" aria-label="Tools">
          <a class="nav-sublink<?= nav_active('/measure-distance') ?>" href="/measure-distance">
            <span class="nav-sublink-title">Measure distance</span>
            <span class="nav-sublink-note">Distance between points on the map</span>
          </a>
        </div>
      </div>
      <span class="nav-link is-soon" title="Coming soon">Guides</span>
    </nav>
  </div>
</header>
